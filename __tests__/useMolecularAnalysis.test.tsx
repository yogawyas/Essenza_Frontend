import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {useMolecularAnalysis} from '../src/hooks/useMolecularAnalysis';
import {InferenceService} from '../src/services/InferenceService';
test('changing input discards an old response even if the transport ignores cancellation', async () => {
  let resolve: (value: any) => void = () => undefined;
  const get = jest.spyOn(InferenceService,'getFingerprint').mockImplementation(() => new Promise(r => {resolve=r;}));
  const predict = jest.spyOn(InferenceService,'predict').mockResolvedValue([]);
  let state: ReturnType<typeof useMolecularAnalysis>;
  function Harness() { state=useMolecularAnalysis(); return null; }
  let renderer: ReactTestRenderer;
  await act(async () => {renderer=create(<Harness/>);});
  await act(async () => {state.handleSmilesChange('CCO');});
  let pending: Promise<void>;
  await act(async () => {pending=state.handlePredict();});
  await act(async () => {state.handleSmilesChange('CC');});
  await act(async () => {resolve({fingerprint:new Array(2053).fill(0)});await pending;});
  expect(state!.smilesInput).toBe('CC');
  expect(state!.predictions).toBeNull();
  expect(state!.isLoading).toBe(false);
  expect(predict).not.toHaveBeenCalled();
  expect(get.mock.calls[0][1]?.aborted).toBe(true);
  await act(async () => {renderer.unmount();});
  get.mockRestore();predict.mockRestore();
});
