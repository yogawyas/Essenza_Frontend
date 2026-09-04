const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
function validateBundle(manifest, directory) {
  if (manifest.version !== 1 || !['xgb','lgbm'].includes(manifest.algorithm) ||
      !/^[a-f0-9]{64}$/.test(manifest.bundle_id) || !/^[a-f0-9]{64}$/.test(manifest.feature_schema_id) ||
      !Array.isArray(manifest.models) || !manifest.models.length) throw Error('Invalid model manifest');
  const labels = new Set(), filenames = new Set();
  for (const m of manifest.models) {
    if (!m.label || labels.has(m.label) || filenames.has(m.filename) || path.basename(m.filename) !== m.filename ||
        !/^[a-zA-Z0-9_-]+\.onnx$/.test(m.filename) || !Number.isFinite(m.threshold) || m.threshold < 0 ||
        m.threshold > 1 || m.positive_index !== 1 || !m.input_name || !m.probability_output) throw Error('Invalid model entry');
    if (sha(fs.readFileSync(path.join(directory,m.filename))) !== m.sha256) throw Error('Model checksum mismatch: ' + m.filename);
    labels.add(m.label); filenames.add(m.filename);
  }
  return manifest.models.length;
}
function verify() {
  if (fs.existsSync(path.join(root,'android/app/src/main/assets/index.android.bundle'))) throw Error('Remove the stale checked-in JS bundle; Gradle generates the current release bundle.');
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'src/assets/metadata/model_manifest.json')));
  const subdir = manifest.asset_subdir || '';
  if (subdir && !/^[a-f0-9]{64}$/.test(subdir)) throw Error('Invalid model asset directory');
  const count = validateBundle(manifest,path.join(root,'android/app/src/main/assets/models',subdir));
  const catalog = JSON.parse(fs.readFileSync(path.join(root,'src/assets/perfumes.json')));
  const meta = JSON.parse(fs.readFileSync(path.join(root,'src/assets/metadata/catalog_manifest.json')));
  if (sha(fs.readFileSync(path.join(root,'src/assets/perfumes.json'))) !== meta.sha256 || catalog.length !== meta.records) throw Error('Catalog changed without a manifest update');
  console.log(JSON.stringify({models:count,bundle_id:manifest.bundle_id,catalog:catalog.length}));
}
module.exports = {validateBundle,sha};
if (require.main === module) verify();
