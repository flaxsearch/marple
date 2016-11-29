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

export function loadTermsData(segment, field, termsFilter, onSuccess, onError) {
  // add a wildcard to the end of the filter
  const filter = termsFilter ? termsFilter + '.*' : '';
  const url = MARPLE_BASE + `/api/terms/${field}?` + makeQueryStr({ segment, filter });
  console.log('FIXME url=' + url);
  fetch(url)
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading terms data: ' + error); });
}
