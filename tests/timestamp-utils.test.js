const assert = (cond, msg) => { if (!cond) throw new Error(msg || 'Assertion failed'); };
const assertEquals = (actual, expected, msg) => {
  if (actual !== expected) {
    throw new Error(msg || `Expected ${expected}, got ${actual}`);
  }
};

const TimestampUtils = require('../timestamp-converter/timestamp-utils.js');

function test_isMilliseconds() {
  // 秒単位のタイムスタンプ（10桁）
  assert(!TimestampUtils.isMilliseconds(1730000000), '10桁は秒単位');
  assert(!TimestampUtils.isMilliseconds('1730000000'), '10桁文字列は秒単位');

  // ミリ秒単位のタイムスタンプ（13桁）
  assert(TimestampUtils.isMilliseconds(1730000000000), '13桁はミリ秒単位');
  assert(TimestampUtils.isMilliseconds('1730000000000'), '13桁文字列はミリ秒単位');

  // 境界値テスト
  assert(!TimestampUtils.isMilliseconds(999999999999), '12桁は秒単位');
  assert(TimestampUtils.isMilliseconds(1000000000000), '13桁はミリ秒単位');
}

function test_timestampToDate() {
  // 秒単位のタイムスタンプ
  const date1 = TimestampUtils.timestampToDate(1730000000);
  assert(date1 instanceof Date, '結果はDateオブジェクト');
  assertEquals(date1.getTime(), 1730000000000, '秒単位のタイムスタンプを正しく変換');

  // ミリ秒単位のタイムスタンプ
  const date2 = TimestampUtils.timestampToDate(1730000000000);
  assertEquals(date2.getTime(), 1730000000000, 'ミリ秒単位のタイムスタンプを正しく変換');

  // 文字列入力
  const date3 = TimestampUtils.timestampToDate('1730000000');
  assertEquals(date3.getTime(), 1730000000000, '文字列のタイムスタンプを正しく変換');

  // エラーケース：無効な入力
  let threw = false;
  try {
    TimestampUtils.timestampToDate('invalid');
  } catch (e) {
    threw = true;
    assert(e.message.includes('not a number'), 'エラーメッセージが適切');
  }
  assert(threw, '無効な入力でエラーを投げる');
}

function test_dateToUnixSeconds() {
  const date = new Date('2024-10-27T12:00:00Z');
  const seconds = TimestampUtils.dateToUnixSeconds(date);

  assert(typeof seconds === 'number', '結果は数値');
  assertEquals(seconds, Math.floor(date.getTime() / 1000), '秒単位のタイムスタンプを正しく取得');

  // エラーケース：無効な入力
  let threw = false;
  try {
    TimestampUtils.dateToUnixSeconds('not a date');
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Dateオブジェクトでない入力でエラーを投げる');

  // 無効な日付
  threw = false;
  try {
    TimestampUtils.dateToUnixSeconds(new Date('invalid'));
  } catch (e) {
    threw = true;
  }
  assert(threw, '無効な日付でエラーを投げる');
}

function test_dateToUnixMs() {
  const date = new Date('2024-10-27T12:00:00Z');
  const ms = TimestampUtils.dateToUnixMs(date);

  assert(typeof ms === 'number', '結果は数値');
  assertEquals(ms, date.getTime(), 'ミリ秒単位のタイムスタンプを正しく取得');

  // エラーケース
  let threw = false;
  try {
    TimestampUtils.dateToUnixMs('not a date');
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Dateオブジェクトでない入力でエラーを投げる');
}

function test_formatDateTime() {
  const date = new Date(2024, 9, 27, 12, 34, 56); // ローカルタイムゾーンで2024-10-27 12:34:56
  const formatted = TimestampUtils.formatDateTime(date);

  assert(typeof formatted === 'string', '結果は文字列');
  assert(formatted.includes('2024年'), '年が含まれる');
  assert(formatted.includes('10月'), '月が含まれる');
  assert(formatted.includes('27日'), '日が含まれる');
  assert(formatted.includes('12:34:56'), '時刻が含まれる');
  assert(formatted.includes('日') || formatted.includes('月') || formatted.includes('火') || formatted.includes('水') || formatted.includes('木') || formatted.includes('金') || formatted.includes('土'), '曜日が含まれる');

  // フォーマットの検証
  const regex = /\d{4}年\d{2}月\d{2}日 \([日月火水木金土]\) \d{2}:\d{2}:\d{2}/;
  assert(regex.test(formatted), 'フォーマットが正しい');

  // エラーケース
  let threw = false;
  try {
    TimestampUtils.formatDateTime(new Date('invalid'));
  } catch (e) {
    threw = true;
  }
  assert(threw, '無効な日付でエラーを投げる');
}

function test_formatISO() {
  const date = new Date('2024-10-27T12:00:00Z');
  const iso = TimestampUtils.formatISO(date);

  assert(typeof iso === 'string', '結果は文字列');
  assert(iso.includes('2024-10-27'), '日付が含まれる');
  assert(iso.includes('T'), 'ISO形式の区切り文字が含まれる');
  assert(iso.endsWith('Z') || iso.includes('+') || iso.includes('-'), 'タイムゾーン情報が含まれる');

  // エラーケース
  let threw = false;
  try {
    TimestampUtils.formatISO('not a date');
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Dateオブジェクトでない入力でエラーを投げる');
}

function test_formatUTC() {
  const date = new Date('2024-10-27T12:00:00Z');
  const utc = TimestampUtils.formatUTC(date);

  assert(typeof utc === 'string', '結果は文字列');
  assert(utc.includes('2024'), '年が含まれる');
  assert(utc.includes('GMT') || utc.includes('UTC'), 'タイムゾーン情報が含まれる');

  // エラーケース
  let threw = false;
  try {
    TimestampUtils.formatUTC({});
  } catch (e) {
    threw = true;
  }
  assert(threw, 'Dateオブジェクトでない入力でエラーを投げる');
}

function test_formatDateTimeLocal() {
  const date = new Date('2024-10-27T12:34:00');
  const local = TimestampUtils.formatDateTimeLocal(date);

  assert(typeof local === 'string', '結果は文字列');
  assert(local.includes('2024-10-27'), '日付部分が含まれる');
  assert(local.includes('T'), 'datetime-local形式の区切り文字が含まれる');
  assert(local.includes('12:34'), '時刻部分が含まれる');

  // フォーマット検証
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  assert(regex.test(local), 'datetime-local形式に準拠');

  // エラーケース
  let threw = false;
  try {
    TimestampUtils.formatDateTimeLocal(null);
  } catch (e) {
    threw = true;
  }
  assert(threw, 'nullでエラーを投げる');
}

function test_convertTimestampToFormats() {
  const timestamp = 1730000000;
  const result = TimestampUtils.convertTimestampToFormats(timestamp);

  assert(result.inputFormat === '秒', '入力形式が正しく判定される');
  assert(typeof result.dateTimeJa === 'string', '日本語日時が文字列');
  assert(typeof result.iso8601 === 'string', 'ISO8601が文字列');
  assert(typeof result.utc === 'string', 'UTCが文字列');
  assert(typeof result.unixSeconds === 'number', 'Unix秒が数値');
  assert(typeof result.unixMs === 'number', 'Unixミリ秒が数値');
  assertEquals(result.unixSeconds, 1730000000, 'Unix秒が正しい');
  assertEquals(result.unixMs, 1730000000000, 'Unixミリ秒が正しい');

  // ミリ秒単位のテスト
  const resultMs = TimestampUtils.convertTimestampToFormats(1730000000000);
  assert(resultMs.inputFormat === 'ミリ秒', 'ミリ秒として判定される');
  assertEquals(resultMs.unixSeconds, 1730000000, 'ミリ秒からUnix秒が正しく変換される');
}

function test_convertDateToFormats() {
  const date = new Date('2024-10-27T12:00:00Z');
  const result = TimestampUtils.convertDateToFormats(date);

  assert(typeof result.dateTimeJa === 'string', '日本語日時が文字列');
  assert(typeof result.iso8601 === 'string', 'ISO8601が文字列');
  assert(typeof result.unixSeconds === 'number', 'Unix秒が数値');
  assert(typeof result.unixMs === 'number', 'Unixミリ秒が数値');

  // 文字列入力のテスト
  const resultStr = TimestampUtils.convertDateToFormats('2024-10-27T12:00:00Z');
  assert(resultStr.unixSeconds === result.unixSeconds, '文字列入力でも同じ結果');

  // エラーケース
  let threw = false;
  try {
    TimestampUtils.convertDateToFormats('invalid date');
  } catch (e) {
    threw = true;
  }
  assert(threw, '無効な日付文字列でエラーを投げる');
}

function test_roundTrip() {
  // 往復変換のテスト
  const originalTimestamp = 1730000000;
  const date = TimestampUtils.timestampToDate(originalTimestamp);
  const convertedBack = TimestampUtils.dateToUnixSeconds(date);

  assertEquals(convertedBack, originalTimestamp, '往復変換で元の値に戻る');

  // ミリ秒の往復変換
  const originalMs = 1730000000000;
  const date2 = TimestampUtils.timestampToDate(originalMs);
  const convertedBackMs = TimestampUtils.dateToUnixMs(date2);

  assertEquals(convertedBackMs, originalMs, 'ミリ秒の往復変換で元の値に戻る');
}

function test_edgeCases() {
  // Unixエポック（1970-01-01 00:00:00）
  const epoch = TimestampUtils.timestampToDate(0);
  assertEquals(epoch.getTime(), 0, 'エポック時刻を正しく処理');

  // 負のタイムスタンプ（1970年以前）
  const before1970 = TimestampUtils.timestampToDate(-86400);
  assertEquals(before1970.getTime(), -86400000, '1970年以前の日付を正しく処理');

  // 大きなタイムスタンプ（未来の日付）
  const future = TimestampUtils.timestampToDate(2000000000);
  assert(future.getTime() > Date.now(), '未来の日付を正しく処理');
}

module.exports = {
  test_isMilliseconds,
  test_timestampToDate,
  test_dateToUnixSeconds,
  test_dateToUnixMs,
  test_formatDateTime,
  test_formatISO,
  test_formatUTC,
  test_formatDateTimeLocal,
  test_convertTimestampToFormats,
  test_convertDateToFormats,
  test_roundTrip,
  test_edgeCases
};
