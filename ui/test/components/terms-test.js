import expect from 'expect.js';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import fetchMock from 'fetch-mock';
import jsdom from 'mocha-jsdom';

import Terms from '../../src/components/terms';
import { MARPLE_BASE } from 'config';

let component;
let renderedDOM;

describe('components/terms', function() {

  jsdom();  // create the DOM

  before(function() {
    fetchMock.get(MARPLE_BASE + '/api/terms/foo?segment=1&encoding=utf8',
      {
        "termCount": 101,
        "docCount": 19,
        "minTerm": "aardvark",
        "maxTerm": "zebra",
        "terms": [
          "aardvark",
          "bat",
          "cat"
        ]
      });
  });

  beforeEach(function(done) {
    const indexData = { indexpath: '/some/path' };
    const showAlert = msg => {
      console.log('FIXME msg: ' + msg);
    };

    component = ReactTestUtils.renderIntoDocument(
      <Terms segment={1} field={'foo'} indexData={indexData} showAlert={showAlert} />
    );
    setTimeout(() => {
        renderedDOM = ReactDOM.findDOMNode(component);
        done();
      }, 100);    // allow async stuff to happen
  });

  it('renders correctly', function() {
    expect(renderedDOM.children.length).to.eql(3);
    expect(renderedDOM.children[0].tagName).to.eql('TABLE');
    expect(renderedDOM.children[1].tagName).to.eql('FORM');
    expect(renderedDOM.children[2].tagName).to.eql('UL');
    const tds = renderedDOM.getElementsByTagName('TD');
    expect(tds.length).to.eql(8);
    expect(tds[1].innerHTML).to.eql('101');         // term count
    expect(tds[3].innerHTML).to.eql('19');          // docs with terms
    expect(tds[5].innerHTML).to.eql('aardvark');    // min term
    expect(tds[7].innerHTML).to.eql('zebra');       // max term
  });

  after(function() {
    fetchMock.restore();
  });

});
