"""RDKit-only feature service for the audited v7 mobile bundle."""

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote

import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from rdkit import Chem, rdBase
from rdkit.Chem import Descriptors, rdFingerprintGenerator, rdMolDescriptors


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = Path(os.environ.get(
    "ESSENZA_V7_MANIFEST", ROOT / "src/assets/metadata/v7_model_manifest.json"))
MANIFEST = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
SPEC = MANIFEST["feature_spec"]
if (MANIFEST["model_id"] != "perfume-five-grouped-v7-m2048-d8/lgbm_D"
        or SPEC["n_bits"] != 2048 or SPEC["dimensions"]["input"] != 2056
        or SPEC["rdkit_version"] != rdBase.rdkitVersion):
    raise RuntimeError("v7 feature service and model bundle disagree")

GENERATOR = rdFingerprintGenerator.GetMorganGenerator(
    radius=SPEC["radius"], fpSize=SPEC["n_bits"],
    includeChirality=SPEC["include_chirality"])
app = FastAPI(title="Essenza v7 Feature API", version="1.0.0")
CURATED_NAMES = {
    "vanillin": ("COc1cc(C=O)ccc1O", "4-hydroxy-3-methoxybenzaldehyde"),
    "linalool": ("CC(=CCCC(C)(C=C)O)C", None),
    "geraniol": ("CC(C)=CCC/C(C)=C/CO", None),
}
CATALOG = json.loads((ROOT / "src/assets/catalog/compounds.json").read_text(encoding="utf-8"))["compounds"]
MAX_CANDIDATES = 20
FORMULA_PATTERN = re.compile(r"(?:[A-Z][a-z]?\d*)+")
COMMON_NAMES = {
    "air": ("Air (H2O)", "O", "H2O"),
    "water": ("Water (H2O)", "O", "H2O"),
    "co2": ("Karbon dioksida (CO2)", "O=C=O", "CO2"),
    "carbon dioxide": ("Carbon dioxide (CO2)", "O=C=O", "CO2"),
}
INDONESIAN_NAMES = {
    "vanilin": "Vanillin",
    "etanol": "Ethanol",
    "etil asetat": "Ethyl acetate",
    "asam asetat": "Acetic acid",
}
CATALOG_SMILES = {item["smiles"] for item in CATALOG}


class FeatureRequest(BaseModel):
    smiles: str | None = Field(default=None, max_length=2000)
    compound_name: str | None = Field(default=None, max_length=200)
    feature_schema_id: str


class ResolveRequest(BaseModel):
    query: str = Field(min_length=1, max_length=200)


def candidate(name, smiles, source, cid=None, formula=None):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None or mol.GetNumAtoms() == 0 or len(Chem.GetMolFrags(mol)) != 1:
        return None
    canonical = Chem.MolToSmiles(mol, isomericSmiles=True)
    return {
        "name": name, "smiles": canonical,
        "molecular_formula": formula or rdMolDescriptors.CalcMolFormula(mol),
        "cid": str(cid) if cid is not None else None,
        "source": source,
        "in_catalog": source == "catalog" or canonical in CATALOG_SMILES,
        "prediction_supported": (canonical not in {"O", "O=C=O"}
                                 and any(atom.GetAtomicNum() == 6 for atom in mol.GetAtoms())),
    }


@lru_cache(maxsize=32)
def catalog_matches(query, is_formula):
    matches = []
    for item in CATALOG:
        if is_formula:
            mol = Chem.MolFromSmiles(item["smiles"])
            if mol is None or rdMolDescriptors.CalcMolFormula(mol) != query:
                continue
        elif query.casefold() not in (item["name"].casefold(),
                                       *(alias.casefold() for alias in item["aliases"])):
            continue
        resolved = candidate(item["name"], item["smiles"], "catalog", item["cid"])
        if resolved is None:
            continue
        matches.append(resolved)
        if len(matches) > MAX_CANDIDATES:
            break
    return matches


def pubchem_json(url):
    try:
        response = requests.get(url, timeout=(5, 10))
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError) as exc:
        raise HTTPException(503, detail={"code": "LOOKUP_UNAVAILABLE",
                                         "message": "Pencarian senyawa sedang tidak tersedia. Coba lagi."}) from exc


def pubchem_matches(query, is_formula):
    encoded = quote(query, safe="")
    if is_formula:
        endpoint = f"fastformula/{encoded}/cids/JSON?MaxRecords={MAX_CANDIDATES + 1}"
    else:
        endpoint = f"name/{encoded}/cids/JSON?name_type=complete"
    root = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/"
    identifiers = pubchem_json(root + endpoint)
    if identifiers is None:
        return []
    try:
        cids = identifiers["IdentifierList"]["CID"]
    except (KeyError, TypeError) as exc:
        raise HTTPException(503, detail={"code": "LOOKUP_UNAVAILABLE",
                                         "message": "Respons pencarian senyawa tidak valid."}) from exc
    if len(cids) > MAX_CANDIDATES:
        raise HTTPException(422, detail={"code": "TOO_MANY_MATCHES",
                                         "message": "Terlalu banyak struktur yang cocok. Masukkan nama yang lebih spesifik."})
    if not cids:
        return []
    properties = pubchem_json(root + f"cid/{','.join(map(str, cids))}/property/SMILES,MolecularFormula,IUPACName,Title/JSON")
    try:
        records = properties["PropertyTable"]["Properties"]
    except (KeyError, TypeError) as exc:
        raise HTTPException(503, detail={"code": "LOOKUP_UNAVAILABLE",
                                         "message": "Detail senyawa tidak tersedia."}) from exc
    matches = []
    seen = set()
    for record in records:
        item = candidate(record.get("Title") or record.get("IUPACName") or query,
                         record.get("SMILES", ""), "pubchem", record.get("CID"),
                         record.get("MolecularFormula"))
        if item and item["smiles"] not in seen:
            matches.append(item)
            seen.add(item["smiles"])
    return matches


@app.post("/resolve")
def resolve(request: ResolveRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(422, detail={"code": "EMPTY_QUERY", "message": "Masukkan nama atau rumus senyawa."})
    common = COMMON_NAMES.get(query.casefold())
    if common:
        matches = [candidate(common[0], common[1], "common_name", formula=common[2])]
    else:
        mapped_name = INDONESIAN_NAMES.get(query.casefold(), query)
        is_formula = bool(FORMULA_PATTERN.fullmatch(mapped_name))
        matches = catalog_matches(mapped_name, is_formula)
        if len(matches) > MAX_CANDIDATES:
            raise HTTPException(422, detail={"code": "TOO_MANY_MATCHES",
                                             "message": "Banyak molekul punya rumus ini. Masukkan nama yang lebih spesifik."})
        if not matches:
            matches = pubchem_matches(mapped_name, is_formula)
    if not matches:
        raise HTTPException(404, detail={"code": "COMPOUND_NOT_FOUND",
                                         "message": "Senyawa tidak ditemukan. Coba nama atau rumus lain."})
    return {"query": query, "candidates": matches}


def lookup_name(name):
    known = CURATED_NAMES.get(name.strip().casefold())
    if known:
        return known[0], known[1], "local_examples"
    url = ("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"
           f"{quote(name, safe='')}/property/SMILES,IUPACName/JSON")
    try:
        response = requests.get(url, timeout=(5, 10))
        if response.status_code == 404:
            raise HTTPException(422, detail={"code": "COMPOUND_NOT_FOUND", "message": "Nama senyawa tidak ditemukan."})
        response.raise_for_status()
        records = response.json()["PropertyTable"]["Properties"]
        if len(records) != 1:
            raise HTTPException(422, detail={"code": "AMBIGUOUS_COMPOUND", "message": "Nama senyawa ambigu. Masukkan SMILES."})
        return records[0]["SMILES"], records[0].get("IUPACName"), "pubchem"
    except HTTPException:
        raise
    except (requests.RequestException, KeyError, ValueError) as exc:
        raise HTTPException(503, detail={"code": "LOOKUP_UNAVAILABLE", "message": "Pencarian nama sedang tidak tersedia."}) from exc


def calculate(smiles):
    mol = Chem.MolFromSmiles(smiles.strip()) if isinstance(smiles, str) else None
    if mol is None or mol.GetNumAtoms() == 0:
        raise HTTPException(422, detail={"code": "INVALID_SMILES", "message": "Struktur SMILES tidak valid."})
    if len(Chem.GetMolFrags(mol)) != 1:
        raise HTTPException(422, detail={"code": "UNSUPPORTED_MIXTURE", "message": "Masukkan satu molekul, bukan campuran."})
    canonical = Chem.MolToSmiles(mol, isomericSmiles=True)
    mol = Chem.MolFromSmiles(canonical)
    fingerprint = GENERATOR.GetFingerprintAsNumPy(mol).astype(np.float32)
    descriptors = np.asarray([getattr(Descriptors, key)(mol) for key in SPEC["descriptors"]], dtype=np.float32)
    vector = np.concatenate((fingerprint, descriptors))
    if vector.shape != (2056,) or not np.isfinite(vector).all():
        raise HTTPException(422, detail={"code": "INVALID_FEATURES", "message": "Fitur molekul tidak valid."})
    return {
        "status": "ok", "model_id": MANIFEST["model_id"],
        "bundle_id": MANIFEST["bundle_id"], "feature_schema_id": MANIFEST["feature_schema_id"],
        "smiles": canonical, "molecular_formula": rdMolDescriptors.CalcMolFormula(mol),
        "molecular_weight": float(descriptors[0]), "fingerprint": vector.tolist(),
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_id": MANIFEST["model_id"],
            "bundle_id": MANIFEST["bundle_id"], "feature_schema_id": MANIFEST["feature_schema_id"]}


@app.post("/fingerprint")
def feature(request: FeatureRequest):
    if request.feature_schema_id != MANIFEST["feature_schema_id"]:
        raise HTTPException(409, detail={"code": "FEATURE_SCHEMA_MISMATCH", "message": "Versi API dan model aplikasi berbeda."})
    smiles = (request.smiles or "").strip()
    name = (request.compound_name or "").strip()
    if bool(smiles) == bool(name):
        raise HTTPException(422, detail={"code": "INVALID_INPUT", "message": "Masukkan SMILES atau nama senyawa."})
    iupac = None
    lookup_source = None
    if name:
        smiles, iupac, lookup_source = lookup_name(name)
    result = calculate(smiles)
    return {**result, "compound_name": name or None, "iupac_name": iupac,
            "lookup_source": lookup_source}
