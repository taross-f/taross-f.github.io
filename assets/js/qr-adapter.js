/*
 QR rendering adapter and loader.
 - Ensures a QRCode-compatible interface is available (unpkg or qrcode-generator fallback)
 - Provides helpers to render to canvas or SVG using Promises.
 This file is browser-only.
*/
(function (root) {
  function ensureQRCodeLoaded() {
    return new Promise(function (resolve) {
      if (typeof root.QRCode !== 'undefined') return resolve(root.QRCode);

      // If qrcode-generator is already present, attach an adapter
      function attachAdapterIfNeeded() {
        if (typeof root.QRCode !== 'undefined') return resolve(root.QRCode);
        if (typeof root.qrcode === 'undefined') return; // nothing to adapt yet

        root.QRCode = {
          toCanvas: function (canvas, text, options, callback) {
            try {
              var ecc = options && options.errorCorrectionLevel;
              var typeNumber = ecc === 'L' ? 1 : ecc === 'M' ? 0 : ecc === 'Q' ? 3 : 2; // map roughly
              var qr = root.qrcode(typeNumber, 'L');
              qr.addData(text);
              qr.make();

              var size = (options && options.width) || 256;
              var ctx = canvas.getContext('2d');
              canvas.width = size;
              canvas.height = size;
              var moduleCount = qr.getModuleCount();
              var cellSize = size / moduleCount;

              ctx.fillStyle = (options && options.color && options.color.light) || '#ffffff';
              ctx.fillRect(0, 0, size, size);

              ctx.fillStyle = (options && options.color && options.color.dark) || '#000000';
              for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                  if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                  }
                }
              }
              callback && callback(null);
            } catch (err) {
              callback && callback(err);
            }
          },
          toString: function (text, options, callback) {
            try {
              var qr = root.qrcode(0, 'L');
              qr.addData(text);
              qr.make();
              var cellSize = 4;
              var moduleCount = qr.getModuleCount();
              var svgSize = moduleCount * cellSize;
              var svg = '<svg width="' + svgSize + '" height="' + svgSize + '" xmlns="http://www.w3.org/2000/svg">';
              svg += '<rect width="100%" height="100%" fill="' + ((options && options.color && options.color.light) || '#ffffff') + '"/>';
              for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                  if (qr.isDark(row, col)) {
                    svg += '<rect x="' + (col * cellSize) + '" y="' + (row * cellSize) + '" width="' + cellSize + '" height="' + cellSize + '" fill="' + ((options && options.color && options.color.dark) || '#000000') + '"/>';
                  }
                }
              }
              svg += '</svg>';
              callback && callback(null, svg);
            } catch (err) {
              callback && callback(err);
            }
          }
        };
        resolve(root.QRCode);
      }

      // If QRCode and qrcode are both missing, try to load qrcode-generator as fallback
      if (typeof root.QRCode === 'undefined' && typeof root.qrcode === 'undefined') {
        var s = root.document && root.document.createElement('script');
        if (s) {
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
          s.async = true;
          s.onload = attachAdapterIfNeeded;
          (root.document.head || root.document.body).appendChild(s);
        }
      }

      // If qrcode is already present, attach immediately; otherwise wait for onload above
      attachAdapterIfNeeded();
    });
  }

  function renderToCanvas(canvas, text, options) {
    return ensureQRCodeLoaded().then(function (QRCode) {
      return new Promise(function (resolve, reject) {
        QRCode.toCanvas(canvas, text, options || {}, function (err) {
          if (err) return reject(err);
          resolve(canvas);
        });
      });
    });
  }

  function renderToSVG(text, options) {
    return ensureQRCodeLoaded().then(function (QRCode) {
      return new Promise(function (resolve, reject) {
        var opts = options || {};
        // Some libs expect options as second arg; ours wraps toString(text, opts, cb)
        QRCode.toString(text, opts, function (err, svg) {
          if (err) return reject(err);
          resolve(svg);
        });
      });
    });
  }

  root.QRAdapter = { ensureQRCodeLoaded: ensureQRCodeLoaded, renderToCanvas: renderToCanvas, renderToSVG: renderToSVG };
})(typeof window !== 'undefined' ? window : this);

