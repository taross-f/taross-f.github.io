---
layout: page
title: QRコード生成ツール
permalink: /qr-generator/
---

<div class="qr-generator">
  <div class="tool-section">
    <h3>📱 QRコード生成</h3>
    <div class="input-tabs">
      <button id="textTab" class="tab-btn active">テキスト</button>
      <button id="urlTab" class="tab-btn">URL</button>
      <button id="wifiTab" class="tab-btn">WiFi</button>
      <button id="vcardTab" class="tab-btn">連絡先</button>
    </div>
    
    <div id="textPanel" class="input-panel active">
      <textarea id="textInput" placeholder="QRコードに変換するテキストを入力してください..." rows="6"></textarea>
    </div>
    
    <div id="urlPanel" class="input-panel">
      <input type="url" id="urlInput" placeholder="https://example.com">
      <small>URLを入力してください（https://から始まる必要があります）</small>
    </div>
    
    <div id="wifiPanel" class="input-panel">
      <div class="form-group">
        <label for="wifiSSID">ネットワーク名 (SSID):</label>
        <input type="text" id="wifiSSID" placeholder="WiFiネットワーク名">
      </div>
      <div class="form-group">
        <label for="wifiPassword">パスワード:</label>
        <input type="password" id="wifiPassword" placeholder="WiFiパスワード">
      </div>
      <div class="form-group">
        <label for="wifiSecurity">セキュリティ:</label>
        <select id="wifiSecurity">
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">なし</option>
        </select>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="wifiHidden"> ネットワークが非表示
        </label>
      </div>
    </div>
    
    <div id="vcardPanel" class="input-panel">
      <div class="form-group">
        <label for="vcardName">名前:</label>
        <input type="text" id="vcardName" placeholder="山田 太郎">
      </div>
      <div class="form-group">
        <label for="vcardPhone">電話番号:</label>
        <input type="tel" id="vcardPhone" placeholder="090-1234-5678">
      </div>
      <div class="form-group">
        <label for="vcardEmail">メールアドレス:</label>
        <input type="email" id="vcardEmail" placeholder="example@example.com">
      </div>
      <div class="form-group">
        <label for="vcardOrg">会社/組織:</label>
        <input type="text" id="vcardOrg" placeholder="株式会社サンプル">
      </div>
      <div class="form-group">
        <label for="vcardUrl">ウェブサイト:</label>
        <input type="url" id="vcardUrl" placeholder="https://example.com">
      </div>
    </div>
  </div>
  
  <div class="tool-section">
    <h3>⚙️ 設定</h3>
    <div class="settings-grid">
      <div class="setting-item">
        <label for="qrSize">サイズ:</label>
        <select id="qrSize">
          <option value="200">200x200</option>
          <option value="300" selected>300x300</option>
          <option value="400">400x400</option>
          <option value="500">500x500</option>
        </select>
      </div>
      <div class="setting-item">
        <label for="errorLevel">エラー訂正:</label>
        <select id="errorLevel">
          <option value="L">Low (7%)</option>
          <option value="M" selected>Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
      </div>
      <div class="setting-item">
        <label for="colorDark">前景色:</label>
        <input type="color" id="colorDark" value="#000000">
      </div>
      <div class="setting-item">
        <label for="colorLight">背景色:</label>
        <input type="color" id="colorLight" value="#ffffff">
      </div>
    </div>
    <div class="button-group">
      <button id="generateBtn" class="btn btn-primary">QRコード生成</button>
      <button id="clearBtn" class="btn">クリア</button>
    </div>
  </div>
  
  <div class="tool-section">
    <h3>📸 生成されたQRコード</h3>
    <div id="qrDisplay" class="qr-display">
      <p>設定を行い「QRコード生成」ボタンを押してください</p>
    </div>
    <div class="qr-actions">
      <button id="downloadBtn" class="btn" style="display: none;">PNG形式でダウンロード</button>
      <button id="copySVGBtn" class="btn" style="display: none;">SVG形式でコピー</button>
    </div>
  </div>
  
  <div class="info-section">
    <h4>💡 QRコードについて</h4>
    <p>QRコード（Quick Response Code）は、1994年にデンソーウェーブが開発した二次元バーコードです。</p>
    <div class="qr-info">
      <p><strong>エラー訂正レベル:</strong></p>
      <ul>
        <li><strong>Low (7%):</strong> 最小サイズ、汚れに弱い</li>
        <li><strong>Medium (15%):</strong> 標準的な用途におすすめ</li>
        <li><strong>Quartile (25%):</strong> やや汚れても読み取り可能</li>
        <li><strong>High (30%):</strong> 最も汚れに強い、サイズが大きくなる</li>
      </ul>
      <p><strong>用途例:</strong> URL共有、WiFi設定、連絡先交換、決済、イベント参加など</p>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>

<style>
.qr-generator {
  max-width: none;
  margin: 0;
}

.tool-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tool-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.input-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #007acc;
  border-bottom-color: #007acc;
}

.tab-btn:hover {
  background: rgba(0, 122, 204, 0.1);
}

.input-panel {
  display: none;
}

.input-panel.active {
  display: block;
}

.input-panel textarea,
.input-panel input[type="text"],
.input-panel input[type="url"],
.input-panel input[type="tel"],
.input-panel input[type="email"],
.input-panel input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  margin-bottom: 10px;
}

.input-panel textarea {
  resize: vertical;
}

.input-panel small {
  color: #666;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
}

.setting-item select {
  width: 100%;
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.setting-item input[type="color"] {
  width: 60px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background: #007acc;
}

.btn:hover {
  opacity: 0.8;
}

.btn:active {
  transform: translateY(1px);
}

.qr-display {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-display canvas {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.qr-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
  justify-content: center;
}

.info-section {
  background: #e7f3ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007acc;
}

.info-section h4 {
  margin-top: 0;
  color: #333;
}

.qr-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.qr-info li {
  margin: 5px 0;
}

.success {
  color: #155724;
  background: #d4edda;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.error {
  color: #721c24;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .input-tabs {
    flex-wrap: wrap;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group,
  .qr-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

<script>
function initQRGenerator() {
  // QRCodeライブラリの読み込み確認
  if (typeof QRCode === 'undefined') {
    console.error('QRCode library is not loaded');
    document.getElementById('qrDisplay').innerHTML = '<p style="color: red;">QRCodeライブラリの読み込みに失敗しました。ページを再読み込みしてください。</p>';
    return;
  }
  const tabs = {
    text: document.getElementById('textTab'),
    url: document.getElementById('urlTab'),
    wifi: document.getElementById('wifiTab'),
    vcard: document.getElementById('vcardTab')
  };
  
  const panels = {
    text: document.getElementById('textPanel'),
    url: document.getElementById('urlPanel'),
    wifi: document.getElementById('wifiPanel'),
    vcard: document.getElementById('vcardPanel')
  };
  
  const inputs = {
    text: document.getElementById('textInput'),
    url: document.getElementById('urlInput'),
    wifiSSID: document.getElementById('wifiSSID'),
    wifiPassword: document.getElementById('wifiPassword'),
    wifiSecurity: document.getElementById('wifiSecurity'),
    wifiHidden: document.getElementById('wifiHidden'),
    vcardName: document.getElementById('vcardName'),
    vcardPhone: document.getElementById('vcardPhone'),
    vcardEmail: document.getElementById('vcardEmail'),
    vcardOrg: document.getElementById('vcardOrg'),
    vcardUrl: document.getElementById('vcardUrl')
  };
  
  const settings = {
    size: document.getElementById('qrSize'),
    errorLevel: document.getElementById('errorLevel'),
    colorDark: document.getElementById('colorDark'),
    colorLight: document.getElementById('colorLight')
  };
  
  const qrDisplay = document.getElementById('qrDisplay');
  const generateBtn = document.getElementById('generateBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const copySVGBtn = document.getElementById('copySVGBtn');
  
  let currentTab = 'text';
  let currentQRData = null;

  function showMessage(element, message, type = 'success') {
    const existingMsg = element.parentNode.querySelector('.error, .success');
    if (existingMsg) {
      existingMsg.remove();
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = type;
    msgDiv.textContent = message;
    element.parentNode.appendChild(msgDiv);
    
    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.remove();
      }
    }, 3000);
  }

  function switchTab(tabName) {
    // タブの切り替え
    Object.keys(tabs).forEach(key => {
      tabs[key].classList.toggle('active', key === tabName);
      panels[key].classList.toggle('active', key === tabName);
    });
    currentTab = tabName;
  }

  function getQRData() {
    switch (currentTab) {
      case 'text':
        return inputs.text.value.trim();
      
      case 'url':
        const url = inputs.url.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          throw new Error('URLは http:// または https:// から始まる必要があります');
        }
        return url;
      
      case 'wifi':
        const ssid = inputs.wifiSSID.value.trim();
        const password = inputs.wifiPassword.value;
        const security = inputs.wifiSecurity.value;
        const hidden = inputs.wifiHidden.checked;
        
        if (!ssid) {
          throw new Error('WiFiネットワーク名を入力してください');
        }
        
        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
      
      case 'vcard':
        const name = inputs.vcardName.value.trim();
        if (!name) {
          throw new Error('名前を入力してください');
        }
        
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcard += `FN:${name}\n`;
        if (inputs.vcardPhone.value.trim()) {
          vcard += `TEL:${inputs.vcardPhone.value.trim()}\n`;
        }
        if (inputs.vcardEmail.value.trim()) {
          vcard += `EMAIL:${inputs.vcardEmail.value.trim()}\n`;
        }
        if (inputs.vcardOrg.value.trim()) {
          vcard += `ORG:${inputs.vcardOrg.value.trim()}\n`;
        }
        if (inputs.vcardUrl.value.trim()) {
          vcard += `URL:${inputs.vcardUrl.value.trim()}\n`;
        }
        vcard += 'END:VCARD';
        return vcard;
      
      default:
        throw new Error('不明なタブです');
    }
  }

  function generateQR() {
    try {
      const data = getQRData();
      if (!data) {
        throw new Error('データを入力してください');
      }
      
      const size = parseInt(settings.size.value);
      const errorCorrectionLevel = settings.errorLevel.value;
      const colorDark = settings.colorDark.value;
      const colorLight = settings.colorLight.value;
      
      // QRコード生成
      qrDisplay.innerHTML = '';
      const canvas = document.createElement('canvas');
      
      QRCode.toCanvas(canvas, data, {
        width: size,
        errorCorrectionLevel: errorCorrectionLevel,
        color: {
          dark: colorDark,
          light: colorLight
        },
        margin: 2
      }, function(error) {
        if (error) {
          showMessage(qrDisplay, 'QRコード生成に失敗しました: ' + error.message, 'error');
        } else {
          qrDisplay.appendChild(canvas);
          currentQRData = { canvas, data, size, errorCorrectionLevel, colorDark, colorLight };
          downloadBtn.style.display = 'inline-block';
          copySVGBtn.style.display = 'inline-block';
          showMessage(qrDisplay, 'QRコードを生成しました');
        }
      });
      
    } catch (error) {
      showMessage(qrDisplay, error.message, 'error');
    }
  }

  function downloadQR() {
    if (!currentQRData) return;
    
    const link = document.createElement('a');
    link.download = `qrcode_${Date.now()}.png`;
    link.href = currentQRData.canvas.toDataURL();
    link.click();
    showMessage(qrDisplay, 'QRコードをダウンロードしました');
  }

  function copyQRSVG() {
    if (!currentQRData) return;
    
    QRCode.toString(currentQRData.data, {
      type: 'svg',
      width: currentQRData.size,
      errorCorrectionLevel: currentQRData.errorCorrectionLevel,
      color: {
        dark: currentQRData.colorDark,
        light: currentQRData.colorLight
      }
    }, function(error, svg) {
      if (error) {
        showMessage(qrDisplay, 'SVG生成に失敗しました', 'error');
      } else {
        navigator.clipboard.writeText(svg).then(() => {
          showMessage(qrDisplay, 'SVG形式でクリップボードにコピーしました');
        });
      }
    });
  }

  function clearAll() {
    Object.values(inputs).forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
    qrDisplay.innerHTML = '<p>設定を行い「QRコード生成」ボタンを押してください</p>';
    downloadBtn.style.display = 'none';
    copySVGBtn.style.display = 'none';
    currentQRData = null;
  }

  // イベントリスナー
  Object.keys(tabs).forEach(tabName => {
    tabs[tabName].addEventListener('click', () => switchTab(tabName));
  });

  generateBtn.addEventListener('click', generateQR);
  clearBtn.addEventListener('click', clearAll);
  downloadBtn.addEventListener('click', downloadQR);
  copySVGBtn.addEventListener('click', copyQRSVG);

  // Enterキーで生成
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      generateQR();
    }
  });

  // 初期化
  switchTab('text');
}

// ページ読み込み後とライブラリ読み込み後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initQRGenerator, 100);
  });
} else {
  setTimeout(initQRGenerator, 100);
}
</script>