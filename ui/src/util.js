export function parseDoclist(doclist, numDocs) {
  let ret = [];

  const keepIfValid = n => {
    if (n < numDocs && ! ret.includes(n)) {
      ret.push(n);
    }
  }

  if (doclist) {
    let chunks = doclist.split(/[, ]/);
    chunks.forEach(chunk => {
      chunk = chunk.trim();
      if (chunk) {
        if (chunk.includes('-')) {
          const range = chunk.split('-');
          if (range.length == 1) {
            keepIfValid(parseInt(range[0].trim()));
          }
          else if (range.length == 2) {
            const from = parseInt(range[0].trim());
            if (range[1].trim()) {
              const to = parseInt(range[1].trim());
              for (let i = from; i <= to; i++) {
                keepIfValid(i);
              }
            }
            else {
              keepIfValid(from);
            }
          }
        }
        else {
          keepIfValid(parseInt(chunk));
          ret.push();
        }
      }
    });
  }
  return ret;
}

/**
 * Check that regExp compiles to a valid regular expression
 */
export function isValidRegExp(regExp) {
  try {
    new RegExp(regExp);
  } catch (e){
    return false;
  }
  return true;
}
