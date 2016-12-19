import expect from 'expect.js';
import fetchMock from 'fetch-mock';
import { makeQueryStr, loadIndexData, loadFieldsData, loadTermsData,
         loadDocValues, getFieldEncoding, setFieldEncoding } from '../src/data';
import { MARPLE_BASE } from 'config';

describe('makeQueryStr', function() {
  it('works', function() {
    const qs = makeQueryStr({
      foo: undefined,
      bar: null,
      spam: '',
      eggs: 0,
      wombat: 'marsupial'
    });
    expect(qs).to.contain('eggs=0');
    expect(qs).to.contain('wombat=marsupial');
    expect(qs).to.not.contain('foo');
    expect(qs).to.not.contain('bar');
    expect(qs).to.not.contain('spam');
  });
});

describe('loadIndexData', function() {
  before(function() {
    fetchMock.get(MARPLE_BASE + '/api/index', {
      "generation": 4,
      "numDocs": 19,
      "numDeletedDocs": 0,
      "indexpath": "src/test/resources/index/",
      "segments": [
        {
          "ord": 0,
          "maxDoc": 1,
          "numDocs": 1,
          "sort": "none"
        },
        {
          "ord": 1,
          "maxDoc": 7,
          "numDocs": 7,
          "sort": "none"
        }]
    });
  });

  it('works', function(done) {
    loadIndexData(data => {
      expect(data.generation).to.eql(4);
      expect(data.indexpath).to.eql("src/test/resources/index/");
      expect(data.segments[1].maxDoc).to.eql(7);
      done();
    }, done)
  });

  after(function() {
    fetchMock.restore();
  });
});

// FIXME cover other functions?
