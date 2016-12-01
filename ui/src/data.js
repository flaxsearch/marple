import { MARPLE_BASE } from 'config';

function makeQueryStr(params) {
  return Object.keys(params).filter(k => params[k]).map(
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
  console.log('FIXME url=' + url);
  fetch(url)
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading fields data: ' + error); });
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300)
        return Promise.resolve(response);
    return response.json().then(json => Promise.reject(new Error(json.message)));
}

export function loadTermsData(segment, field, termsFilter, encoding, onSuccess, onError) {
    // add a wildcard to the end of the filter
  const filter = termsFilter ? termsFilter + '.*' : '';
    const url = MARPLE_BASE + `/api/terms/${field}?` + makeQueryStr({ segment, filter, encoding });
    fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .then(data => { onSuccess(data); })
        .catch(error => { onError('error loading terms data: ' + error); });
    console.log('FIXME url=' + url);
}
