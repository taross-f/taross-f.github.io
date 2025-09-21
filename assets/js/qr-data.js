/*
 UMD module exposing pure helpers for QR data creation and validation.
 Works in both browser (window.QRData) and Node (module.exports).
*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QRData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function isValidUrl(url) {
    if (typeof url !== 'string') return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }

  function buildWiFiString(opts) {
    const ssid = (opts && opts.ssid) ? String(opts.ssid).trim() : '';
    const password = opts && typeof opts.password !== 'undefined' ? String(opts.password) : '';
    const security = (opts && opts.security) ? String(opts.security) : 'WPA';
    const hidden = !!(opts && opts.hidden);
    if (!ssid) throw new Error('SSID is required');
    return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
  }

  function buildVCard(opts) {
    const name = (opts && opts.name) ? String(opts.name).trim() : '';
    if (!name) throw new Error('Name is required');
    let v = 'BEGIN:VCARD\nVERSION:3.0\n';
    v += `FN:${name}\n`;
    if (opts && opts.phone && String(opts.phone).trim()) v += `TEL:${String(opts.phone).trim()}\n`;
    if (opts && opts.email && String(opts.email).trim()) v += `EMAIL:${String(opts.email).trim()}\n`;
    if (opts && opts.org && String(opts.org).trim()) v += `ORG:${String(opts.org).trim()}\n`;
    if (opts && opts.url && String(opts.url).trim()) v += `URL:${String(opts.url).trim()}\n`;
    v += 'END:VCARD';
    return v;
  }

  return { isValidUrl, buildWiFiString, buildVCard };
});

