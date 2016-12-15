import expect from 'expect.js';
import React from 'react';
import { renderShallow } from '../test-helper';
import { Fields } from '../../src/components/misc';


describe('components/misc/Fields', function() {
  it('works', function() {
    const fields = [
      { name: 'Alice' },
      { name: 'Bob' }
    ];

    const rendered = renderShallow(
      <Fields fields={fields} onSelect={x => x} />);

    const children = rendered.props.children;
    expect(children.length).to.eql(2);
    expect(children[0].props.eventKey).to.eql('Alice');
    expect(children[0].props.children).to.eql('Alice');
    expect(children[1].props.eventKey).to.eql('Bob');
    expect(children[1].props.children).to.eql('Bob');
  });
});
