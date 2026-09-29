"""Build a named mobile catalog from the frozen v7 dataset; never edit research files."""

import argparse
import csv
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

from rdkit import Chem


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/assets/catalog/compounds.json"
SOURCES = ("goodscents", "ifra_2019", "leffingwell", "arctander_1960", "sigma_2014")
CAS = re.compile(r"\d{2,7}-\d{2}-\d")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(smiles):
    molecule = Chem.MolFromSmiles(smiles)
    if molecule is None:
        raise ValueError(f"Invalid source SMILES: {smiles}")
    return Chem.MolToSmiles(molecule, isomericSmiles=True)


def choose_name(entries):
    candidates = []
    for source, name, iupac, _ in entries:
        for value in (name, iupac):
            if value and not CAS.fullmatch(value):
                common = value == name and value.casefold() != iupac.casefold()
                candidates.append((not common, "," in value, len(value), SOURCES.index(source), value))
    if not candidates:
        return None
    chosen = min(candidates)[-1]
    return chosen[0].upper() + chosen[1:]


def build(backend_root):
    build_dir = backend_root / "data/builds/perfume-five-grouped-v2"
    manifest = json.loads((build_dir / "dataset_manifest.json").read_text(encoding="utf-8"))
    sources = json.loads((build_dir / "sources.json").read_text(encoding="utf-8"))
    if manifest["source_revision"] != "8054ea98ed675005ec10e67359902f500e4911b0":
        raise ValueError("Unexpected source revision")
    records_path = build_dir / "records.csv"
    if digest(records_path) != manifest["files"]["records.csv"]:
        raise ValueError("Frozen dataset records checksum mismatch")
    snapshots = backend_root / "data/snapshots/perfume-five-v1" / manifest["source_revision"]
    by_smiles = defaultdict(list)
    for source in SOURCES:
        relative = f"{source}/molecules.csv"
        path = snapshots / relative
        if digest(path) != sources[relative]["sha256"]:
            raise ValueError(f"Source checksum mismatch: {relative}")
        with path.open(encoding="utf-8-sig", newline="") as stream:
            for row in csv.DictReader(stream):
                raw = (row.get("IsomericSMILES") or "").strip()
                if not raw:
                    continue
                molecule = Chem.MolFromSmiles(raw)
                if molecule is None:
                    continue
                key = Chem.MolToSmiles(molecule, isomericSmiles=True)
                by_smiles[key].append((source, (row.get("name") or "").strip(),
                                       (row.get("IUPACName") or "").strip(),
                                       (row.get("CID") or "").strip()))
    compounds = []
    with records_path.open(encoding="utf-8", newline="") as stream:
        for row in csv.DictReader(stream):
            smiles = row["smiles"]
            if canonical(smiles) != smiles:
                raise ValueError(f"Non-canonical dataset SMILES: {smiles}")
            entries = by_smiles.get(smiles)
            if not entries:
                raise ValueError(f"No source metadata for {smiles}")
            name = choose_name(entries)
            cid = next((entry[3] for entry in entries if entry[3].isdigit()), None)
            if not name:
                name = f"Senyawa CID {cid}" if cid else f"Senyawa {row['source_row']}"
            aliases = sorted({value for _, other, iupac, _ in entries
                              for value in (other, iupac)
                              if value and value.casefold() != name.casefold()},
                             key=str.casefold)
            compounds.append({
                "id": int(row["source_row"]), "name": name, "smiles": smiles,
                "cid": cid, "aliases": aliases,
            })
    if len(compounds) != 6686 or len({entry["smiles"] for entry in compounds}) != 6686:
        raise ValueError("Expected 6686 unique v7 dataset molecules")
    compounds.sort(key=lambda entry: (entry["name"].casefold(), entry["id"]))
    return {
        "version": 1,
        "source": "perfume-five-grouped-v2 records used by v7",
        "source_records_sha256": digest(records_path),
        "source_revision": manifest["source_revision"],
        "count": len(compounds),
        "compounds": compounds,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend-root", required=True, type=Path)
    args = parser.parse_args()
    catalog = build(args.backend_root.resolve())
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")) + "\n",
                      encoding="utf-8")
    print(f"Wrote {catalog['count']} catalog entries to {OUTPUT}")
