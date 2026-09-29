"""RDKit-only feature service for the audited v7 mobile bundle."""

import json
import os
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


class FeatureRequest(BaseModel):
    smiles: str | None = Field(default=None, max_length=2000)
    compound_name: str | None = Field(default=None, max_length=200)
    feature_schema_id: str


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
