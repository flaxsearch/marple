import { MARPLE_BASE } from 'config';

export function segmentFilter(segment) {
  if (segment === null)
    return "";
  return "?segment=" + segment;
}

export function loadIndexData(onSuccess, onError) {
  const url = MARPLE_BASE + "/api/index";
  fetch(url)
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading index data: ' + error) });
}

export function loadFieldsData(segment, onSuccess, onError) {
  const url = MARPLE_BASE + "/api/fields" + segmentFilter(segment);
  fetch(url)
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading fields data: ' + error); });
}

export function loadTermsData(segment, field, onSuccess, onError) {
  fetch(MARPLE_BASE + "/api/terms/" + field + segmentFilter(segment))
  .then(response => response.json())
  .then(data => { onSuccess(data); })
  .catch(error => { onError('error loading terms data: ' + error); });
}
