import { inputError } from '../domain/analysis';
/** Hand-authored UI fixtures, not predictions or experimentally measured odor data. */
export const EXAMPLES = [
  {
    name: 'Linalool',
    smiles: 'CC(=CCCC(C)(C=C)O)C',
    description: 'Contoh hasil multi-label',
    labels: [
      { label: 'floral', score: 0.82 },
      { label: 'sweet', score: 0.64 },
      { label: 'citrus', score: 0.43 },
    ],
  },
  {
    name: 'Geraniol',
    smiles: 'CC(C)=CCC/C(C)=C/CO',
    description: 'Contoh molekul kedua',
    labels: [
      { label: 'floral', score: 0.78 },
      { label: 'rose', score: 0.71 },
      { label: 'sweet', score: 0.38 },
    ],
  },
  {
    name: 'Vanillin',
    smiles: 'COc1cc(C=O)ccc1O',
    description: 'Contoh molekul ketiga',
    labels: [
      { label: 'vanilla', score: 0.88 },
      { label: 'sweet', score: 0.73 },
      { label: 'powdery', score: 0.32 },
    ],
  },
  {
    name: 'Contoh tanpa label',
    smiles: 'CCO',
    description: 'Uji tampilan hasil kosong',
    labels: [],
  },
];
let sequence = 0;
export const demoPredictionService = {
  async predict({ smiles, sampleName }) {
    const error = inputError(smiles);
    if (error) {
      throw new Error(error);
    }
    const example = EXAMPLES.find(item => item.smiles === smiles.trim());
    if (!example) {
      throw new Error(
        'SMILES ini belum tersedia dalam contoh demo. Pilih molekul contoh di bawah. Validasi struktur dan prediksi SMILES baru memerlukan API.',
      );
    }
    await new Promise(resolve => setTimeout(resolve, 650));
    sequence += 1;
    return {
      id: `demo-${Date.now()}-${sequence}`,
      sampleName: sampleName.trim().slice(0, 80) || example.name,
      inputSmiles: smiles.trim(),
      canonicalSmiles: null,
      createdAt: new Date().toISOString(),
      demo: true,
      modelId: 'demo-fixtures-v1',
      structureValidated: false,
      labels: example.labels.map(label => ({ ...label })),
    };
  },
};
