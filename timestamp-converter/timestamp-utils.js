/**
 * Unix Timestamp変換ユーティリティ
 */

/**
 * タイムスタンプがミリ秒単位かどうかを判定
 * @param {number|string} timestamp
 * @returns {boolean}
 */
function isMilliseconds(timestamp) {
  const str = String(timestamp);
  return str.length >= 13;
}

/**
 * Unix Timestampから日時オブジェクトを生成
 * @param {number|string} timestamp
 * @returns {Date}
 */
function timestampToDate(timestamp) {
  const ts = parseInt(timestamp, 10);

  if (isNaN(ts)) {
    throw new Error('Invalid timestamp: not a number');
  }

  const date = new Date(isMilliseconds(timestamp) ? ts : ts * 1000);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid timestamp: cannot convert to date');
  }

  return date;
}

/**
 * 日時オブジェクトからUnix Timestamp（秒）を取得
 * @param {Date} date
 * @returns {number}
 */
function dateToUnixSeconds(date) {
  if (!(date instanceof Date)) {
    throw new Error('Invalid input: not a Date object');
  }

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return Math.floor(date.getTime() / 1000);
}

/**
 * 日時オブジェクトからUnix Timestamp（ミリ秒）を取得
 * @param {Date} date
 * @returns {number}
 */
function dateToUnixMs(date) {
  if (!(date instanceof Date)) {
    throw new Error('Invalid input: not a Date object');
  }

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date.getTime();
}

/**
 * 日時を日本語フォーマットで表示
 * @param {Date} date
 * @returns {string}
 */
function formatDateTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const pad = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];

  return `${year}年${month}月${day}日 (${weekday}) ${hour}:${minute}:${second}`;
}

/**
 * ISO 8601形式の日時文字列を取得
 * @param {Date} date
 * @returns {string}
 */
function formatISO(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date.toISOString();
}

/**
 * UTC表示
 * @param {Date} date
 * @returns {string}
 */
function formatUTC(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date.toUTCString();
}

/**
 * datetime-local入力用のフォーマット
 * @param {Date} date
 * @returns {string}
 */
function formatDateTimeLocal(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Unix Timestampを複数のフォーマットに変換
 * @param {number|string} timestamp
 * @returns {Object}
 */
function convertTimestampToFormats(timestamp) {
  const date = timestampToDate(timestamp);
  const isMs = isMilliseconds(timestamp);

  return {
    inputFormat: isMs ? 'ミリ秒' : '秒',
    dateTimeJa: formatDateTime(date),
    iso8601: formatISO(date),
    utc: formatUTC(date),
    unixSeconds: dateToUnixSeconds(date),
    unixMs: dateToUnixMs(date)
  };
}

/**
 * 日時を複数のフォーマットに変換
 * @param {Date|string} dateInput
 * @returns {Object}
 */
function convertDateToFormats(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date input');
  }

  return {
    dateTimeJa: formatDateTime(date),
    iso8601: formatISO(date),
    unixSeconds: dateToUnixSeconds(date),
    unixMs: dateToUnixMs(date)
  };
}

// Node.js環境用のエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isMilliseconds,
    timestampToDate,
    dateToUnixSeconds,
    dateToUnixMs,
    formatDateTime,
    formatISO,
    formatUTC,
    formatDateTimeLocal,
    convertTimestampToFormats,
    convertDateToFormats
  };
}

// ブラウザ環境用のグローバル変数
if (typeof window !== 'undefined') {
  window.TimestampUtils = {
    isMilliseconds,
    timestampToDate,
    dateToUnixSeconds,
    dateToUnixMs,
    formatDateTime,
    formatISO,
    formatUTC,
    formatDateTimeLocal,
    convertTimestampToFormats,
    convertDateToFormats
  };
}
