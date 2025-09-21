const assert = (cond, msg) => { if (!cond) throw new Error(msg || 'Assertion failed'); };
const QRData = require('../assets/js/qr-data.js');

function test_isValidUrl() {
  assert(QRData.isValidUrl('http://example.com'));
  assert(QRData.isValidUrl('https://example.com'));
  assert(!QRData.isValidUrl('ftp://example.com'));
  assert(!QRData.isValidUrl('example.com'));
}

function test_buildWiFiString() {
  let str = QRData.buildWiFiString({ ssid: 'MyWiFi', password: 'pass', security: 'WPA', hidden: false });
  assert(str === 'WIFI:T:WPA;S:MyWiFi;P:pass;H:false;;', 'Unexpected WiFi string');

  let strHidden = QRData.buildWiFiString({ ssid: 'Cafe', password: '', security: 'nopass', hidden: true });
  assert(strHidden === 'WIFI:T:nopass;S:Cafe;P:;H:true;;');

  let threw = false;
  try { QRData.buildWiFiString({}); } catch (e) { threw = true; }
  assert(threw, 'Expected error for missing SSID');
}

function test_buildVCard() {
  const v = QRData.buildVCard({ name: 'Yamada Taro', phone: '090-1234-5678', email: 'a@b.com', org: 'Co', url: 'https://ex.com' });
  assert(v.includes('BEGIN:VCARD'));
  assert(v.includes('FN:Yamada Taro'));
  assert(v.includes('TEL:090-1234-5678'));
  assert(v.includes('EMAIL:a@b.com'));
  assert(v.includes('ORG:Co'));
  assert(v.includes('URL:https://ex.com'));
  assert(v.endsWith('END:VCARD'));

  let threw = false;
  try { QRData.buildVCard({ name: '' }); } catch (e) { threw = true; }
  assert(threw, 'Expected error for missing name');
}

module.exports = { test_isValidUrl, test_buildWiFiString, test_buildVCard };

