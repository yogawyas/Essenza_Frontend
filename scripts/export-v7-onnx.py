"""Export the audited v7 LightGBM D bundle for Essenza Lab without retraining."""

import argparse
import hashlib
import json
from pathlib import Path
import warnings

import joblib
import numpy as np
import onnx
import onnxruntime as ort
from onnxmltools import convert_lightgbm
from onnxmltools.convert.common.data_types import FloatTensorType


ROOT = Path(__file__).resolve().parents[1]
MODELS_OUT = ROOT / "android/app/src/main/assets/models/v7"
MANIFEST_OUT = ROOT / "src/assets/metadata/v7_model_manifest.json"
DESCRIPTORS = (
    "MolWt", "MolLogP", "NumHDonors", "NumHAcceptors", "TPSA",
    "NumRotatableBonds", "HeavyAtomCount", "RingCount",
)


def digest(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def json_digest(value):
    data = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def reference_features(features_path, splits_path):
    split = read(splits_path)["train"][:32]
    with np.load(features_path, allow_pickle=False) as data:
        morgan = data["morgan"][split]
        descriptors = data["descriptors"][split]
    result = np.concatenate((morgan, descriptors), axis=1).astype(np.float32)
    if result.shape != (32, 2056) or not np.isfinite(result).all():
        raise ValueError("Expected 32 v7 training vectors with 2056 finite features")
    return result


def export(run, features_path, splits_path):
    run = Path(run).resolve()
    bundle_path = run / "inference_bundle.json"
    bundle = read(bundle_path)
    completion = read(run / "completion_manifest.json")["files"]
    if completion.get("inference_bundle.json") != digest(bundle_path):
        raise ValueError("v7 inference bundle checksum mismatch")
    spec = bundle["feature_spec"]
    if (bundle["protocol"] != "perfume-five-grouped-v7-m2048-d8"
            or bundle["selected_candidate"] != "lgbm_D"
            or bundle["algorithm"] != "lgbm"
            or bundle["models_directory"] != "lgbm_D"
            or len(bundle["labels"]) != 109
            or list(spec["descriptors"]) != list(DESCRIPTORS)
            or spec["n_bits"] != 2048 or spec["radius"] != 2
            or spec["include_chirality"] is not False
            or spec["dimensions"]["input"] != 2056
            or spec["fragment_policy"] != "single"
            or spec["dtype"] != "float32"
            or bundle["primary_threshold"] != 0.5):
        raise ValueError("This is not the audited v7 LightGBM D contract")
    if MODELS_OUT.exists() or MANIFEST_OUT.exists():
        raise FileExistsError("Generated v7 assets already exist; move them aside before re-export")

    vectors = reference_features(features_path, splits_path)
    MODELS_OUT.mkdir(parents=True)
    entries = []
    for index, label in enumerate(bundle["labels"]):
        source_name = bundle["models"][label]["file"]
        if Path(source_name).name != source_name:
            raise ValueError(f"Unsafe model path: {label}")
        relative = f"lgbm_D/{source_name}"
        source = run / relative
        expected = bundle["models"][label]["sha256"]
        if digest(source) != expected or completion.get(relative) != expected:
            raise ValueError(f"Research model checksum mismatch: {label}")
        native = joblib.load(source)
        if native.n_features_in_ != 2056 or list(native.classes_) != [0, 1]:
            raise ValueError(f"Native model input/class mismatch: {label}")
        # onnxmltools treats unsigned classes as strings; adjust only this loaded copy.
        native._classes = native.classes_.astype(np.int64)
        native._le.classes_ = native._classes
        graph = convert_lightgbm(
            native,
            initial_types=[("features", FloatTensorType([None, 2056]))],
            target_opset=15,
            zipmap=False,
        )
        onnx.checker.check_model(graph)
        filename = f"lgbm_{index:03d}.onnx"
        target = MODELS_OUT / filename
        target.write_bytes(graph.SerializeToString())
        session = ort.InferenceSession(str(target), providers=["CPUExecutionProvider"])
        outputs = [output for output in session.get_outputs()
                   if output.type == "tensor(float)" and len(output.shape) == 2
                   and output.shape[-1] == 2]
        if len(outputs) != 1:
            raise ValueError(f"Expected one dense probability output: {label}")
        input_name = session.get_inputs()[0].name
        converted = session.run([outputs[0].name], {input_name: vectors})[0][:, 1]
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message="X does not have valid feature names")
            original = native.predict_proba(vectors)[:, 1]
        np.testing.assert_allclose(converted, original, rtol=1e-5, atol=1e-6)
        if np.any((converted >= 0.5) != (original >= 0.5)):
            raise ValueError(f"ONNX changed threshold decisions: {label}")
        entries.append({
            "label": label, "filename": filename, "sha256": digest(target),
            "input_name": input_name, "probability_output": outputs[0].name,
            "positive_index": 1, "threshold": 0.5,
        })
        print(f"{index + 1}/109 {label}: max error {np.max(np.abs(converted - original)):.8g}", flush=True)
        del native, session

    manifest = {
        "version": 1,
        "model_id": "perfume-five-grouped-v7-m2048-d8/lgbm_D",
        "source_bundle_sha256": digest(bundle_path),
        "feature_schema_id": json_digest(spec),
        "feature_spec": spec,
        "labels": list(bundle["labels"]),
        "primary_threshold": 0.5,
        "models": entries,
    }
    manifest["bundle_id"] = json_digest({
        "feature_schema_id": manifest["feature_schema_id"], "models": entries,
    })
    MANIFEST_OUT.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"bundle_id={manifest['bundle_id']} size_bytes={sum(p.stat().st_size for p in MODELS_OUT.iterdir())}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", required=True, type=Path)
    parser.add_argument("--features", required=True, type=Path)
    parser.add_argument("--splits", required=True, type=Path)
    args = parser.parse_args()
    export(args.run, args.features, args.splits)


if __name__ == "__main__":
    main()
