import ReactTestUtils from 'react-addons-test-utils';

export function renderShallow(component) {
  const renderer = ReactTestUtils.createRenderer();
  renderer.render(component);
  return renderer.getRenderOutput();
}
