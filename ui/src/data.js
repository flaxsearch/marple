import store from 'store';
import { MARPLE_BASE } from 'config';


export function makeQueryStr(params) {
  const filt = k => params[k] || params[k] === 0;   // allows 0s into params
  return Object.keys(params).filter(filt).map(
      k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
  ).join('&');
}

export function loadIndexData(onSuccess, onError) {
  fetch(MARPLE_BASE + "/api/index")
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading index data: ' + error) });
}

export function loadFieldsData(segment, onSuccess, onError) {
  const url = MARPLE_BASE + "/api/fields?" + makeQueryStr({ segment });
  fetch(url)
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading fields data: ' + error); });
}

export function loadDocument(segment, docid, maxFields, maxFieldLength,
                             onSuccess, onError) {
    const url = MARPLE_BASE + "/api/document/" + docid + "?"
        + makeQueryStr({ segment, maxFields, maxFieldLength })
    fetch(url)
    .then(response => response.json())
    .then(data => onSuccess(data))
    .catch(error => onError('error loading document: ' + error));
}

export function loadTermsData({ segment, field, termsFilter, encoding,
                                from, count, onSuccess, onError }) {
  const filter = normaliseFilter(termsFilter);
  const url = MARPLE_BASE + `/api/terms/${field}?` + makeQueryStr({
    segment, filter, encoding, from, count: count + 1 });

  fetch(url)
  .then(response => response.json())
  .then(body => {
    // this relies on the error response containing the 'code' property
    if (body.code) {
      if (body.code == 400 && body.message.includes('cannot be decoded as')) {
        // cope with encoding error by defaulting to utf8
        loadTermsData({ segment, field, termsFilter, encoding: 'utf8',
          from, count, onSuccess, onError });
      }
      else {
        onError(body.message);
      }
    }
    else {
      // did we get more than 'count' items back?
      let termsData = {
        termCount: body.termCount,
        docCount: body.docCount,
        minTerm: body.minTerm,
        maxTerm: body.maxTerm,
        terms: body.terms
      };

      if (body.terms.length > count) {
        termsData.terms = body.terms.slice(0, -1);
        termsData.moreFrom = body.terms[count].term;
      }

      onSuccess(termsData, encoding);    // return encoding in case it defaulted
    }
  })
  .catch(error => {
    onError(error);
  });
}

export function loadDocValuesByDoc({ segment, field, docs, encoding, onSuccess, onError }) {
  const url = MARPLE_BASE + `/api/docvalues/${field}?`+ makeQueryStr({ segment, docs, encoding });
  fetch(url)
  .then(response => response.json())
  .then(body => {
    // this relies on the error response containing the 'code' property
    if (body.code) {
      if (body.code == 400 && body.message.includes('cannot be decoded as')) {
        // cope with encoding error by defaulting to utf8
        loadDocValuesByDoc({ segment, field, docs, encoding: 'utf8', onSuccess, onError });
      }
      else {
        onError(body.message);
      }
    }
    else {
      onSuccess(body, encoding);    // return encoding in case it defaulted
    }
  })
  .catch(error => { onError('error loading docvalues: ' + error); });
}

export function loadDocValuesByValue({ segment, field, valFilter, encoding,
                                       offset, count, onSuccess, onError }) {
  const filter = normaliseFilter(valFilter);
  const url = MARPLE_BASE + `/api/docvalues/${field}/ordered?`+ makeQueryStr({
    offset, count: count + 1, segment, filter, encoding });

  fetch(url)
  .then(response => response.json())
  .then(body => {
    // this relies on the error response containing the 'code' property
    if (body.code) {
      if (body.code == 400 && body.message.includes('cannot be decoded as')) {
        // cope with encoding error by defaulting to utf8
        loadDocValuesByValue({ segment, field, filter, encoding: 'utf8',
                               offset, count, onSuccess, onError });
      }
      else {
        onError(body.message);
      }
    }
    else {
      // did we get more than 'count' items back?
      let valuesData = {
        type: body.type,
        values: body.values
      };

      if (body.values.length > count) {
        valuesData.values = body.values.slice(0, -1);
        valuesData.moreFrom = body.values[count].value;
        // (we don't use the value of .moreFrom, just its presence)
      }

      onSuccess(valuesData, encoding);    // return encoding in case it defaulted
    }
  })
  .catch(error => { onError('error loading docvalues: ' + error); });
}

export function getFieldEncoding(indexpath, field, item) {
  const local = store.get('marple');
  if (local == undefined ||
      local.encodings == undefined ||
      local.encodings[field] == undefined ||
      local.encodings[field][item] == undefined) {
    return 'utf8';
  }
  return local.encodings[field][item];
}

export function setFieldEncoding(indexpath, field, item, encoding) {
  const local = store.get('marple') || {};
  if (local.encodings == undefined) {
    local.encodings = {};
  }
  if (local.encodings[field] == undefined) {
    local.encodings[field] = {};
  }
  local.encodings[field][item] = encoding;
  store.set('marple', local);
}

export function loadPostings(segment, field, term, encoding,
                             offset, count, onSuccess, onError) {
    term = encodeURIComponent(term);
	const url = MARPLE_BASE + `/api/postings/${field}/${term}?` +
        makeQueryStr({ segment, encoding, offset, count: count + 1 });

	fetch(url)
	.then(response => response.json())
	.then(body => {
		if (body.code) {
			onError(body.message);
		} else {
			onSuccess({
                postings: body,
                moreFrom: body.length > count ?
                    offset + body.length : undefined
            });
		}
	})
	.catch(error => { onError('error loading postings: ' + error); });
}

export function loadPositions(segment, field, term, encoding, docid,
                              onSuccess, onError) {
    term = encodeURIComponent(term);
    const url = MARPLE_BASE + `/api/positions/${field}/${term}/${docid}?` +
        makeQueryStr({ segment, encoding });

	fetch(url)
	.then(response => response.json())
	.then(body => {
		if (body.code) {
			onError(body.message);
		} else {
			onSuccess(body);
		}
	})
	.catch(error => { onError('error loading positions: ' + error); });
}

export function loadPointsTree(segment, field, encoding, onSuccess, onError) {
    const url = MARPLE_BASE + `/api/points/${field}/tree?` + makeQueryStr({
        segment,
        encoding: (encoding == 'binary') ? null : encoding
    });

    fetch(url)
    .then(response => response.json())
    .then(body => {
        // this relies on the error response containing the 'code' property
        if (body.code) {
            if (body.code == 400 && body.message.includes('encoding')) {
                // cope with encoding error by defaulting to binary
                loadPointsTree(segment, field, 'binary', onSuccess, onError);
            }
            else {
                onError(body.message);
            }
        }
        else {
            onSuccess(body, encoding);
        }
    })
    .catch(error => { onError('error loading points tree: ' + error); });
}

export function loadPointsValues(segment, field, encoding, minVal, maxVal,
                                 onSuccess, onError) {
    const url = MARPLE_BASE + `/api/points/${field}/values?` + makeQueryStr({
        segment, min: minVal, max: maxVal,
        encoding: (encoding == 'binary') ? null : encoding
    });

    fetch(url)
    .then(response => response.json())
    .then(body => {
        // this relies on the error response containing the 'code' property
        if (body.code) {
            if (body.code == 400 && body.message.includes('encoding')) {
                // cope with encoding error by defaulting to binary
                loadPointsValues(segment, field, 'binary', minVal, maxVal, onSuccess, onError);
            }
            else {
                onError(body.message);
            }
        }
        else {
            onSuccess(body, encoding);
        }
    })
    .catch(error => { onError('error loading points values: ' + error); });
}

function normaliseFilter(filter) {
  if (filter) {
    if (filter.endsWith('.*')) {
      return filter;
    }
    else {
      return filter + '.*';
    }
  }
  return '';
}
