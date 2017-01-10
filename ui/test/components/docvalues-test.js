import expect from 'expect.js';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import fetchMock from 'fetch-mock';
import jsdom from 'mocha-jsdom';

import DocValues from '../../src/components/docvalues';
import { MARPLE_BASE } from 'config';

let alertMsg = null;
const indexData = { indexpath: '/some/path' };
const showAlert = msg => { alertMsg = msg };

function getRenderedDOM(reactComponent, callback) {
  const component = TestUtils.renderIntoDocument(reactComponent);
  setTimeout(() => {
    callback(ReactDOM.findDOMNode(component));
  }, 100);    // allow async stuff to happen
}

describe('components/docvalues', function() {

  jsdom();  // create the DOM

  it('renders docvalues by doc without ords', function(done) {
    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo?segment=0&docs=0-50&encoding=utf8', {
      "type": "BINARY",
      "values": {
        "0": "austen-emma.txt",
        "1": "austen-persuasion.txt",
        "2": "austen-sense.txt"
      }
    });

    getRenderedDOM(<DocValues segment={0} field={'foo'}
                    docValuesType={'BINARY'}
                    indexData={indexData} showAlert={showAlert} />,
      function(renderedDOM) {
        const items = renderedDOM.getElementsByClassName('marple-dv-item');
        expect(items.length).to.eql(3);
        expect(items[0].children.length).to.eql(3);
        expect(items[0].children[0].innerHTML).to.eql('0');
        expect(items[0].children[1].innerHTML).to.eql('-');
        expect(items[0].children[2].innerHTML).to.eql('austen-emma.txt');

        const radios = renderedDOM.getElementsByClassName('marple-radio');
        expect(radios.length).to.eql(0);
        done();
    });
  });

  it('renders docvalues by doc with ords', function(done) {
    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo?segment=0&docs=0-50&encoding=utf8', {
      "type": "SORTED_SET",
      "values": {
        "0": [
          { "value": "dog", "ord": 5 },
          { "value": "cat", "ord": 18 }
        ]
      }
    });

    getRenderedDOM(<DocValues segment={0} field={'foo'}
                    docValuesType={'SORTED_SET'}
                    indexData={indexData} showAlert={showAlert} />,
      function(renderedDOM) {
        const items = renderedDOM.getElementsByClassName('marple-dv-item')
        expect(items.length).to.eql(2);
        expect(items[0].children.length).to.eql(3);
        expect(items[0].children[0].innerHTML).to.eql('0');
        expect(items[0].children[1].innerHTML).to.eql('5');
        expect(items[0].children[2].innerHTML).to.eql('dog');
        expect(items[1].children[0].innerHTML).to.eql('');
        expect(items[1].children[1].innerHTML).to.eql('18');
        expect(items[1].children[2].innerHTML).to.eql('cat');

        const radios = renderedDOM.getElementsByClassName('marple-radio');
        expect(radios.length).to.eql(2);
        expect(radios[0].firstChild.disabled).to.be(false);
        expect(radios[0].firstChild.checked).to.be(true);
        done();
    });
  });

  it('renders docvalues by value', function(done) {
    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo?segment=0&docs=0-50&encoding=utf8', {
      "type": "SORTED_SET", "values": { }
    });

    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo/ordered?count=51&segment=0&encoding=utf8', {
      "type": "SORTED_SET",
      "values": [
        { "value": "prosecco", "ord": 0 },
        { "value": "gin", "ord": 1 },
        { "value": "beer", "ord": 2 }
      ]
    });

    getRenderedDOM(<DocValues segment={0} field={'foo'}
                    docValuesType={'SORTED_SET'}
                    indexData={indexData} showAlert={showAlert} />,
      function(renderedDOM) {
        // switch to view by value
        let radios = renderedDOM.getElementsByClassName('marple-radio');
        expect(radios[1].firstChild.value).to.eql('values');
        TestUtils.Simulate.change(radios[1].firstChild, { target: { value: 'values' }});
        setTimeout(() => {
          expect(radios[0].firstChild.checked).to.be(false);
          expect(radios[1].firstChild.checked).to.be(true);
          const items = renderedDOM.getElementsByClassName('marple-dv-item');
          expect(items.length).to.eql(3);
          expect(items[1].children.length).to.eql(2);
          expect(items[1].children[0].innerHTML).to.eql('1');
          expect(items[1].children[1].innerHTML).to.eql('gin');

          done();
        }, 100);
    });
  });

  it('loads more by doc', function(done) {
    let values = {};
    for (let i = 0; i < 51; i++) {
      values['' + i] = 'val' + i;
    }
    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo?segment=0&docs=0-50&encoding=utf8', {
      type: "BINARY", values
    });

    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo?segment=0&docs=50-100&encoding=utf8', {
      type: "BINARY",
      values: {
        "50": "val50", "51": "val51"
      }
    });

    getRenderedDOM(<DocValues segment={0} field={'foo'}
                    docValuesType={'BINARY'}
                    indexData={indexData} showAlert={showAlert} />,
      function(renderedDOM) {
        const items = renderedDOM.getElementsByClassName('marple-dv-item');
        expect(items.length).to.eql(50);
        expect(items[11].children[2].innerHTML).to.eql('val11');

        const buttons = renderedDOM.getElementsByClassName('btn-primary');
        expect(buttons.length).to.eql(1);

        TestUtils.Simulate.click(buttons[0]);
        setTimeout(() => {
          const items = renderedDOM.getElementsByClassName('marple-dv-item');
          expect(items.length).to.eql(52);
          expect(items[51].children[2].innerHTML).to.eql('val51');

          done();
        }, 100);

    });
  });

  it('loads more by value', function(done) {
    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo?segment=0&docs=0-50&encoding=utf8', {
      type: "SORTED_SET", values: {}
    });

    let values = [];
    for (let i = 0; i < 51; i++) {
      values.push({
        value: "val" + i,
        ord: i
      });
    }

    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo/ordered?count=51&segment=0&encoding=utf8', {
      type: "SORTED_SET", values
    });

    fetchMock.get(MARPLE_BASE + '/api/docvalues/foo/ordered?from=val50&count=51&segment=0&encoding=utf8', {
      type: "SORTED_SET", values: [
        { "value": "prosecco", "ord": 50 },
        { "value": "gin", "ord": 51 },
        { "value": "beer", "ord": 52 }
      ]
    });

    getRenderedDOM(<DocValues segment={0} field={'foo'}
                    docValuesType={'SORTED_SET'}
                    indexData={indexData} showAlert={showAlert} />,
      function(renderedDOM) {
        // switch to view by value
        let radios = renderedDOM.getElementsByClassName('marple-radio');
        TestUtils.Simulate.change(radios[1].firstChild, { target: { value: 'values' }});
        setTimeout(() => {
          const items = renderedDOM.getElementsByClassName('marple-dv-item');
          expect(items.length).to.eql(50);

          const buttons = renderedDOM.getElementsByClassName('btn-primary');
          expect(buttons.length).to.eql(1);

          TestUtils.Simulate.click(buttons[0]);
          setTimeout(() => {
            const items = renderedDOM.getElementsByClassName('marple-dv-item');
            expect(items.length).to.eql(53);
            expect(items[51].children[1].innerHTML).to.eql('gin');
          }, 100);

          done();
        }, 100);
    });
  });

  afterEach(function() {
    fetchMock.restore();
  });

});
