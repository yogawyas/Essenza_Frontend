import {useEffect, useRef, useState} from 'react';
import {InferenceService, PredictionResult, ServiceError} from '../services/InferenceService';
const messages: Record<string, {title: string; tip: string}> = {
  TIMEOUT: {title: 'Service timed out', tip: 'Please try again later.'},
  NETWORK: {title: 'No connection', tip: 'Check your internet connection.'},
  INVALID_SMILES: {title: 'Invalid SMILES', tip: 'Check the molecular structure.'},
  UNSUPPORTED_MIXTURE: {title: 'One molecule at a time', tip: 'Mixture odor prediction has not been validated.'},
  FEATURE_SCHEMA_MISMATCH: {title: 'Model version mismatch', tip: 'The model bundle and API must be updated together.'},
  MODEL_ERROR: {title: 'Model unavailable', tip: 'The installed model bundle could not be used.'},
};
export function useMolecularAnalysis() {
  const [smilesInput, setInput] = useState('');
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
  const [moleculeInfo, setMoleculeInfo] = useState<any>(null);
  const [warningText, setWarningText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorModal, setErrorModal] = useState({visible: false, title: '', reason: '', tip: ''});
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const invalidate = () => {
    generation.current++;
    controller.current?.abort();
    setPredictions(null); setMoleculeInfo(null); setWarningText(null);
    setIsLoading(false); setStatusText('');
    setErrorModal({visible: false, title: '', reason: '', tip: ''});
  };
  const handleSmilesChange = (value: string) => { invalidate(); setInput(value); };
  const handleClear = () => handleSmilesChange('');
  useEffect(() => () => {
    generation.current++; controller.current?.abort();
    InferenceService.releaseAll().catch(() => undefined);
  }, []);
  const handlePredict = async () => {
    const input = smilesInput.trim();
    if (!input) { return; }
    invalidate();
    const id = generation.current;
    const request = new AbortController();
    controller.current = request;
    setIsLoading(true);
    setStatusText('Calculating molecular features...');
    const current = () => id === generation.current && !request.signal.aborted;
    try {
      const data = await InferenceService.getFingerprint(input, request.signal);
      if (!current()) { return; }
      setStatusText('Running the models on this device...');
      const result = await InferenceService.predict(data.fingerprint, request.signal);
      if (!current()) { return; }
      setMoleculeInfo({formula: data.molecular_formula, weight: data.molecular_weight, iupacName: data.iupac_name});
      setWarningText(data.warning); setPredictions(result);
    } catch (error: any) {
      if (!current() || error?.code === 'CANCELLED') { return; }
      const kind = error instanceof ServiceError ? error.code : 'SERVICE_ERROR';
      const message = messages[kind] || {title: 'Analysis failed', tip: 'Please try again later.'};
      setErrorModal({visible: true, ...message, reason: error.message || 'Analysis could not be completed.'});
    } finally {
      if (current()) { setIsLoading(false); setStatusText(''); }
    }
  };
  return {smilesInput, predictions, moleculeInfo, warningText, isLoading, statusText, errorModal,
    setErrorModal, handlePredict, handleClear, handleSmilesChange};
}
