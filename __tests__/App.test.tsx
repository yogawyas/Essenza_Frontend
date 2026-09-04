import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import App from '../App';
test('renders the home screen and can open the molecule analyzer', async () => {
  let renderer: ReactTestRenderer;
  await act(async () => {renderer=create(<App/>);});
  expect(JSON.stringify(renderer!.toJSON())).toContain('ESSENZA');
  let button=renderer!.root.findAll(n => typeof n.props.children === 'string' && n.props.children.includes('Open molecule lab'))[0];
  while (button && !button.props.onPress) { button=button.parent!; }
  expect(button).toBeDefined();
  await act(async () => {button!.props.onPress();});
  expect(renderer!.root.findAllByProps({accessibilityLabel:'SMILES molecular structure'}).length).toBeGreaterThan(0);
  await act(async () => {renderer!.unmount();});
});
