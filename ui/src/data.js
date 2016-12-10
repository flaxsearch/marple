import store from 'store';
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
      onSuccess(body, encoding);    // return encoding in case it defaulted
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
      onSuccess(body, encoding);    // return encoding in case it defaulted
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
  console.log('FIXME set local to ' + JSON.stringify(local));
}
