import { MARPLE_BASE } from 'config';

function makeQueryStr(params) {
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

export function loadTermsData(segment, field, termsFilter, encoding, onSuccess, onError) {
    // add a wildcard to the end of the filter
  const filter = termsFilter ? termsFilter + '.*' : '';
  const url = MARPLE_BASE + `/api/terms/${field}?` + makeQueryStr({ segment, filter, encoding });
  fetch(url)
  .then(response => response.json())
  .then(body => {
    // this relies on the error response containing the 'code' property
    if (body.code) {
      if (body.code == 400 && body.message.includes('cannot be decoded as')) {
        // cope with encoding error by defaulting to utf8
        loadTermsData(segment, field, termsFilter, 'utf8', onSuccess, onError);
      }
      else {
        onError(body.message);
      }
    }
    else {
      onSuccess(body);
    }
  })
  .catch(error => {
    onError(error);
  });
}

export function loadDocValues(segment, field, docs, encoding, onSuccess, onError) {
  const url = MARPLE_BASE + `/api/docvalues/${field}?`+ makeQueryStr({ segment, docs, encoding });
  fetch(url)
  .then(response => response.json())
  .then(body => {
    // this relies on the error response containing the 'code' property
    if (body.code) {
      if (body.code == 400 && body.message.includes('cannot be decoded as')) {
        // cope with encoding error by defaulting to utf8
        loadDocValues(segment, field, docs, 'utf8', onSuccess, onError);
      }
      else {
        onError(body.message);
      }
    }
    else {
      onSuccess(body);
    }
  })
  .catch(error => { onError('error loading docvalues: ' + error); });
}
