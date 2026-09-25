export const MAX_HISTORY = 100;
export function inputError(smiles) {
  const value = smiles.trim();
  if (!value) {
    return 'Masukkan SMILES atau pilih salah satu contoh molekul.';
  }
  if (value.length > 2000) {
    return 'SMILES maksimal 2.000 karakter.';
  }
  // Input hygiene only; chemistry validation belongs to RDKit in the future API.
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
  return (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.sampleName === 'string' &&
    v.sampleName.length <= 80 &&
    typeof v.inputSmiles === 'string' &&
    inputError(v.inputSmiles) === null &&
    typeof v.createdAt === 'string' &&
    Number.isFinite(Date.parse(v.createdAt)) &&
    v.demo === true &&
    v.modelId === 'demo-fixtures-v1' &&
    v.structureValidated === false &&
    v.canonicalSmiles === null &&
    Array.isArray(v.labels) &&
    v.labels.length <= 143 &&
    v.labels.every(
      item =>
        item &&
        typeof item.label === 'string' &&
        item.label.length > 0 &&
        Number.isFinite(item.score) &&
        item.score >= 0 &&
        item.score <= 1,
    )
  );
}
