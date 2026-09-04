// Explicit bundle import after native/ONNX parity has passed. Metadata is committed last.
const fs = require('node:fs');
const path = require('node:path');
const {validateBundle} = require('./verify-assets.cjs');
const input = process.argv[2];
if (!input) throw Error('Usage: node scripts/import-models.cjs PATH_TO_VALIDATED_BUNDLE');
const source = path.resolve(input);
const manifest = JSON.parse(fs.readFileSync(path.join(source,'manifest.json')));
validateBundle(manifest,source);
if (!Array.isArray(manifest.parity) || manifest.parity.length !== manifest.models.length ||
    manifest.parity.some((p,i) => p.label !== manifest.models[i].label || p.threshold_disagreements !== 0 || !p.n_samples)) {
  throw Error('Complete native/ONNX parity evidence is required');
}
const root=path.resolve(__dirname,'..');
const target=path.join(root,'android/app/src/main/assets/models',manifest.bundle_id);
if (fs.existsSync(target)) throw Error('Bundle directory exists; verify it before retrying');
fs.mkdirSync(target);
for (const m of manifest.models) fs.copyFileSync(path.join(source,m.filename),path.join(target,m.filename));
validateBundle(manifest,target);
const destination=path.join(root,'src/assets/metadata/model_manifest.json');
fs.writeFileSync(destination+'.tmp',JSON.stringify({...manifest,asset_subdir:manifest.bundle_id},null,2)+'\n');
fs.renameSync(destination+'.tmp',destination);
console.log('Imported ' + manifest.bundle_id + '. Deploy its feature_spec.json to the API and complete device tests before release.');
