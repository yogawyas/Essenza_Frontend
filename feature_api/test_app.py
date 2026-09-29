import hashlib
import unittest
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient

from feature_api.app import MANIFEST, app


class TestFeatureApi(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    def test_v7_feature_vector_matches_frozen_rdkit_reference(self):
        response = self.client.post("/fingerprint", json={
            "smiles": "COc1cc(C=O)ccc1O",
            "feature_schema_id": MANIFEST["feature_schema_id"],
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        vector = np.asarray(data["fingerprint"], dtype="<f4")
        self.assertEqual(data["model_id"], MANIFEST["model_id"])
        self.assertEqual(data["bundle_id"], MANIFEST["bundle_id"])
        self.assertEqual(data["molecular_formula"], "C8H8O3")
        self.assertEqual(vector.shape, (2056,))
        self.assertEqual(hashlib.sha256(vector.tobytes()).hexdigest(),
            "277a89f2b2e833bb7572bf827d29af362118594717d81d2f30c038b4150ea114"
        )

    def test_invalid_mixture_and_mismatched_schema_are_rejected(self):
        for smiles, expected in [("not-smiles", "INVALID_SMILES"), ("CCO.O", "UNSUPPORTED_MIXTURE")]:
            response = self.client.post("/fingerprint", json={
                "smiles": smiles, "feature_schema_id": MANIFEST["feature_schema_id"],
            })
            self.assertEqual(response.status_code, 422)
            self.assertEqual(response.json()["detail"]["code"], expected)
        mismatch = self.client.post("/fingerprint", json={
            "smiles": "CCO", "feature_schema_id": "wrong",
        })
        self.assertEqual(mismatch.status_code, 409)
        self.assertEqual(mismatch.json()["detail"]["code"], "FEATURE_SCHEMA_MISMATCH")

    def test_curated_name_resolves_to_the_same_v7_features(self):
        named = self.client.post("/fingerprint", json={
            "compound_name": "Vanillin", "feature_schema_id": MANIFEST["feature_schema_id"],
        })
        direct = self.client.post("/fingerprint", json={
            "smiles": "COc1cc(C=O)ccc1O", "feature_schema_id": MANIFEST["feature_schema_id"],
        })
        self.assertEqual(named.status_code, 200)
        self.assertEqual(named.json()["lookup_source"], "local_examples")
        self.assertEqual(named.json()["smiles"], direct.json()["smiles"])
        self.assertEqual(named.json()["fingerprint"], direct.json()["fingerprint"])

    def test_external_name_lookup_uses_pubchem_smiles(self):
        with patch("feature_api.app.requests.get") as get:
            get.return_value.status_code = 200
            get.return_value.json.return_value = {
                "PropertyTable": {"Properties": [{
                    "SMILES": "CCOC(=O)C", "IUPACName": "ethyl acetate",
                }]},
            }
            response = self.client.post("/fingerprint", json={
                "compound_name": "ethyl acetate",
                "feature_schema_id": MANIFEST["feature_schema_id"],
            })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["lookup_source"], "pubchem")
        self.assertEqual(response.json()["smiles"], "CCOC(C)=O")

    def test_resolve_common_names_and_ambiguous_formula(self):
        water = self.client.post("/resolve", json={"query": "Air"})
        self.assertEqual(water.status_code, 200)
        self.assertEqual(water.json()["candidates"][0]["smiles"], "O")
        self.assertFalse(water.json()["candidates"][0]["prediction_supported"])
        carbon_dioxide = self.client.post("/resolve", json={"query": "CO2"})
        self.assertEqual(carbon_dioxide.status_code, 200)
        self.assertEqual(carbon_dioxide.json()["candidates"][0]["smiles"], "O=C=O")
        self.assertFalse(carbon_dioxide.json()["candidates"][0]["prediction_supported"])
        formula = self.client.post("/resolve", json={"query": "C2H6O"})
        self.assertEqual(formula.status_code, 200)
        structures = {item["smiles"] for item in formula.json()["candidates"]}
        self.assertEqual(structures, {"CCO", "COC"})

    def test_resolve_catalog_name_without_network(self):
        with patch("feature_api.app.requests.get") as get:
            response = self.client.post("/resolve", json={"query": "Vanillin"})
            local_name = self.client.post("/resolve", json={"query": "vanilin"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["candidates"][0]["source"], "catalog")
        self.assertTrue(response.json()["candidates"][0]["in_catalog"])
        self.assertEqual(local_name.json()["candidates"][0]["smiles"],
                         response.json()["candidates"][0]["smiles"])
        get.assert_not_called()

    def test_resolve_external_name_requires_confirmable_structure(self):
        with patch("feature_api.app.requests.get") as get:
            get.side_effect = [
                type("Response", (), {"status_code": 200,
                    "raise_for_status": lambda self: None,
                    "json": lambda self: {"IdentifierList": {"CID": [123]}}})(),
                type("Response", (), {"status_code": 200,
                    "raise_for_status": lambda self: None,
                    "json": lambda self: {"PropertyTable": {"Properties": [{
                        "CID": 123, "Title": "Example", "SMILES": "CCO",
                        "MolecularFormula": "C2H6O"}]}}})(),
            ]
            response = self.client.post("/resolve", json={"query": "external example"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["candidates"][0]["cid"], "123")
        self.assertIn("name/external%20example/cids/JSON", get.call_args_list[0].args[0])
