export const MAX_HISTORY = 100;
function validScore(item) {
  return item && typeof item.label === 'string' && item.label.length > 0 &&
    Number.isFinite(item.score) && item.score >= 0 && item.score <= 1;
}

export function inputError(smiles) {
  const value = smiles.trim();
  if (!value) {
    return 'Masukkan SMILES satu molekul.';
  }
  if (value.length > 2000) {
    return 'SMILES maksimal 2.000 karakter.';
  }
  // RDKit validates chemistry in the feature API; this only guards text input.
  if (/\s/.test(value)) {
    return 'Hapus spasi atau baris baru di dalam SMILES.';
  }
  return null;
}
export function isAnalysis(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value;
  const shared = (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.sampleName === 'string' &&
    v.sampleName.length <= 80 &&
    typeof v.inputSmiles === 'string' &&
    inputError(v.inputSmiles) === null &&
    typeof v.createdAt === 'string' &&
    Number.isFinite(Date.parse(v.createdAt)) &&
    Array.isArray(v.labels) &&
    v.labels.length <= 109 &&
    v.labels.every(validScore)
  );
  if (!shared) {
    return false;
  }
  if (v.demo === true) {
    return v.modelId === 'demo-fixtures-v1' &&
      v.structureValidated === false && v.canonicalSmiles === null;
  }
  if (v.demo !== false || v.structureValidated !== true ||
      typeof v.modelId !== 'string' || !v.modelId ||
      !(v.inputName == null || (typeof v.inputName === 'string' && v.inputName.length <= 200)) ||
      !/^[a-f0-9]{64}$/.test(v.bundleId) ||
      typeof v.canonicalSmiles !== 'string' || !v.canonicalSmiles ||
      !Array.isArray(v.scores) || v.scores.length !== 109 ||
      !v.scores.every(validScore)) {
    return false;
  }
  const byLabel = new Map(v.scores.map(item => [item.label, item.score]));
  const positives = v.scores.filter(item => item.score >= 0.5);
  return byLabel.size === 109 && v.labels.length === positives.length &&
    v.labels.every(item => item.score >= 0.5 && byLabel.get(item.label) === item.score);
}
