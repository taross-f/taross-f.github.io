---
layout: page
title: JWT解析ツール
permalink: /jwt-analyzer/
---

<div class="jwt-analyzer">
  <div class="tool-section">
    <h3>🔐 JWT入力</h3>
    <textarea id="jwtInput" placeholder="JWT トークンを入力してください...
例: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" rows="4"></textarea>
    <div class="button-group">
      <button id="parseBtn" class="btn btn-primary">解析</button>
      <button id="clearBtn" class="btn">クリア</button>
      <button id="sampleBtn" class="btn">サンプルJWT</button>
    </div>
    <div id="parseStatus" class="status-message"></div>
  </div>
  
  <div class="results-container" id="resultsContainer" style="display: none;">
    <div class="tool-section">
      <h3>📋 ヘッダー</h3>
      <pre id="headerOutput" class="json-output"></pre>
      <div class="button-group">
        <button id="copyHeaderBtn" class="btn btn-sm">ヘッダーをコピー</button>
      </div>
      <div id="headerAnalysis" class="analysis-section"></div>
    </div>
    
    <div class="tool-section">
      <h3>📄 ペイロード</h3>
      <pre id="payloadOutput" class="json-output"></pre>
      <div class="button-group">
        <button id="copyPayloadBtn" class="btn btn-sm">ペイロードをコピー</button>
      </div>
      <div id="payloadAnalysis" class="analysis-section"></div>
    </div>
    
    <div class="tool-section">
      <h3>🔏 署名</h3>
      <div class="signature-section">
        <p><strong>署名:</strong> <code id="signatureOutput"></code></p>
        <div class="verification-section">
          <h4>署名検証 (オプション)</h4>
          <div class="input-group">
            <label for="secretInput">秘密鍵/公開鍵:</label>
            <textarea id="secretInput" placeholder="HS256の場合は秘密鍵、RS256の場合は公開鍵を入力..." rows="3"></textarea>
          </div>
          <button id="verifyBtn" class="btn btn-secondary">署名を検証</button>
          <div id="verificationResult" class="verification-result"></div>
        </div>
      </div>
    </div>
    
    <div class="tool-section">
      <h3>🔍 セキュリティ分析</h3>
      <div id="securityAnalysis" class="security-analysis"></div>
    </div>
  </div>
  
  <div class="info-section">
    <h4>💡 JWTについて</h4>
    <p>JWT (JSON Web Token) は、安全にパーティ間で情報を転送するためのオープンスタンダードです。主な用途：</p>
    <ul>
      <li><strong>認証:</strong> ユーザーがログイン後、リクエストに含めてサーバーに送信</li>
      <li><strong>情報交換:</strong> デジタル署名により改ざんを検出可能</li>
      <li><strong>無状態認証:</strong> サーバー側でセッション状態を保持不要</li>
    </ul>
    <p><strong>⚠️ セキュリティ注意:</strong> このツールはブラウザ内でのみ動作し、JWT は外部に送信されません。</p>
  </div>
</div>

<style>
.jwt-analyzer {
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

.tool-section h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

#jwtInput {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
  margin-bottom: 15px;
}

#jwtInput:focus {
  outline: none;
  border-color: #007acc;
}

.json-output {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  max-height: 300px;
  overflow-y: auto;
}

.signature-section {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.verification-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.input-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007acc;
}

.btn-secondary {
  background: #28a745;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(1px);
}

.status-message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.analysis-section {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #007acc;
  margin-top: 10px;
}

.security-analysis {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.security-warning {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: 0 4px 4px 0;
}

.security-danger {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: 0 4px 4px 0;
}

.security-good {
  background: #d4edda;
  border-left: 4px solid #28a745;
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: 0 4px 4px 0;
}

.verification-result {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
}

.verification-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.verification-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info-section {
  background: #e7f3ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007acc;
  margin-top: 30px;
}

.info-section h4 {
  margin-top: 0;
  color: #333;
}

.info-section ul {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .json-output {
    font-size: 12px;
  }
}
</style>

<script>
(function() {
  const jwtInput = document.getElementById('jwtInput');
  const parseBtn = document.getElementById('parseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const sampleBtn = document.getElementById('sampleBtn');
  const parseStatus = document.getElementById('parseStatus');
  const resultsContainer = document.getElementById('resultsContainer');
  const headerOutput = document.getElementById('headerOutput');
  const payloadOutput = document.getElementById('payloadOutput');
  const signatureOutput = document.getElementById('signatureOutput');
  const headerAnalysis = document.getElementById('headerAnalysis');
  const payloadAnalysis = document.getElementById('payloadAnalysis');
  const securityAnalysis = document.getElementById('securityAnalysis');
  const copyHeaderBtn = document.getElementById('copyHeaderBtn');
  const copyPayloadBtn = document.getElementById('copyPayloadBtn');
  const secretInput = document.getElementById('secretInput');
  const verifyBtn = document.getElementById('verifyBtn');
  const verificationResult = document.getElementById('verificationResult');

  let currentJWT = null;

  const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';

  function showStatus(message, type = 'success') {
    parseStatus.className = `status-message status-${type}`;
    parseStatus.textContent = message;
    parseStatus.style.display = 'block';
  }

  function hideStatus() {
    parseStatus.style.display = 'none';
  }

  function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    try {
      return JSON.parse(decodeURIComponent(escape(atob(str))));
    } catch (e) {
      throw new Error('Invalid base64url encoding');
    }
  }

  function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  function analyzeHeader(header) {
    const analysis = [];
    
    if (header.alg === 'none') {
      analysis.push({
        type: 'danger',
        message: '⚠️ 危険: アルゴリズムが "none" に設定されています。署名検証が無効化されています。'
      });
    } else if (header.alg && header.alg.startsWith('HS')) {
      analysis.push({
        type: 'warning',
        message: `📝 対称鍵アルゴリズム (${header.alg}) が使用されています。秘密鍵の管理に注意してください。`
      });
    } else if (header.alg && (header.alg.startsWith('RS') || header.alg.startsWith('ES'))) {
      analysis.push({
        type: 'good',
        message: `✅ 非対称鍵アルゴリズム (${header.alg}) が使用されています。`
      });
    }

    if (!header.typ || header.typ !== 'JWT') {
      analysis.push({
        type: 'warning',
        message: '📝 typ クレームが "JWT" ではありません。'
      });
    }

    return analysis;
  }

  function analyzePayload(payload) {
    const analysis = [];
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      if (payload.exp < now) {
        analysis.push({
          type: 'danger',
          message: `⚠️ トークンは期限切れです (${expDate.toLocaleString()})`
        });
      } else {
        const timeLeft = payload.exp - now;
        const hoursLeft = Math.floor(timeLeft / 3600);
        const minutesLeft = Math.floor((timeLeft % 3600) / 60);
        analysis.push({
          type: 'good',
          message: `✅ トークンは有効です。有効期限: ${expDate.toLocaleString()} (残り ${hoursLeft}時間${minutesLeft}分)`
        });
      }
    } else {
      analysis.push({
        type: 'warning',
        message: '📝 exp (有効期限) クレームが設定されていません。'
      });
    }

    if (payload.iat) {
      const iatDate = new Date(payload.iat * 1000);
      analysis.push({
        type: 'good',
        message: `📅 発行日時: ${iatDate.toLocaleString()}`
      });
    }

    if (payload.nbf) {
      const nbfDate = new Date(payload.nbf * 1000);
      if (payload.nbf > now) {
        analysis.push({
          type: 'warning',
          message: `⏰ トークンはまだ有効になっていません (${nbfDate.toLocaleString()}から有効)`
        });
      }
    }

    if (payload.iss) {
      analysis.push({
        type: 'good',
        message: `🏢 発行者: ${payload.iss}`
      });
    }

    if (payload.aud) {
      const audience = Array.isArray(payload.aud) ? payload.aud.join(', ') : payload.aud;
      analysis.push({
        type: 'good',
        message: `👥 対象者: ${audience}`
      });
    }

    return analysis;
  }

  function analyzeSecurityIssues(header, payload) {
    const issues = [];

    if (header.alg === 'none') {
      issues.push({
        type: 'danger',
        message: '🚨 致命的: "none" アルゴリズムは本番環境では使用しないでください。'
      });
    }

    if (header.alg && header.alg.startsWith('HS') && (!secretInput.value || secretInput.value.length < 32)) {
      issues.push({
        type: 'warning',
        message: '📝 HS256/HS384/HS512を使用する場合は、十分に長い（32文字以上）の強力な秘密鍵を使用してください。'
      });
    }

    if (!payload.exp) {
      issues.push({
        type: 'warning',
        message: '⏰ 有効期限(exp)が設定されていません。セキュリティリスクとなる可能性があります。'
      });
    }

    if (payload.exp && payload.iat && (payload.exp - payload.iat) > 86400 * 30) { // 30日以上
      issues.push({
        type: 'warning',
        message: '📅 トークンの有効期間が30日以上と長すぎます。短い有効期間の設定を推奨します。'
      });
    }

    if (!payload.iss) {
      issues.push({
        type: 'warning',
        message: '🏢 発行者(iss)クレームが設定されていません。'
      });
    }

    if (!payload.aud) {
      issues.push({
        type: 'warning',
        message: '👥 対象者(aud)クレームが設定されていません。'
      });
    }

    return issues;
  }

  function renderAnalysis(container, analyses) {
    container.innerHTML = '';
    analyses.forEach(analysis => {
      const div = document.createElement('div');
      div.className = `security-${analysis.type}`;
      div.textContent = analysis.message;
      container.appendChild(div);
    });
  }

  function parseJWT() {
    const jwt = jwtInput.value.trim();
    if (!jwt) {
      showStatus('JWT を入力してください', 'error');
      resultsContainer.style.display = 'none';
      return;
    }

    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT の形式が正しくありません。3つの部分（ヘッダー、ペイロード、署名）が必要です。');
      }

      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      const signature = parts[2];

      currentJWT = { jwt, header, payload, signature, parts };

      headerOutput.textContent = formatJSON(header);
      payloadOutput.textContent = formatJSON(payload);
      signatureOutput.textContent = signature;

      const headerAnalyses = analyzeHeader(header);
      const payloadAnalyses = analyzePayload(payload);
      const securityIssues = analyzeSecurityIssues(header, payload);

      renderAnalysis(headerAnalysis, headerAnalyses);
      renderAnalysis(payloadAnalysis, payloadAnalyses);
      renderAnalysis(securityAnalysis, securityIssues);

      resultsContainer.style.display = 'block';
      showStatus('JWT の解析が完了しました', 'success');

    } catch (error) {
      showStatus(`解析エラー: ${error.message}`, 'error');
      resultsContainer.style.display = 'none';
    }
  }

  async function verifySignature() {
    if (!currentJWT) {
      showVerificationResult('JWT を先に解析してください', 'error');
      return;
    }

    const secret = secretInput.value.trim();
    if (!secret) {
      showVerificationResult('秘密鍵/公開鍵を入力してください', 'error');
      return;
    }

    try {
      const { header, parts } = currentJWT;
      const algorithm = header.alg;

      if (algorithm === 'none') {
        showVerificationResult('アルゴリズムが "none" のため署名検証はできません', 'error');
        return;
      }

      if (algorithm.startsWith('HS')) {
        await verifyHMAC(parts, secret, algorithm);
      } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
        showVerificationResult('RS256/ES256等の公開鍵検証は、セキュリティ上ブラウザでは実装していません。サーバーサイドで検証してください。', 'error');
      } else {
        showVerificationResult(`未対応のアルゴリズム: ${algorithm}`, 'error');
      }

    } catch (error) {
      showVerificationResult(`検証エラー: ${error.message}`, 'error');
    }
  }

  async function verifyHMAC(parts, secret, algorithm) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(parts[0] + '.' + parts[1]);
      const key = encoder.encode(secret);

      let hashAlgorithm;
      switch (algorithm) {
        case 'HS256': hashAlgorithm = 'SHA-256'; break;
        case 'HS384': hashAlgorithm = 'SHA-384'; break;
        case 'HS512': hashAlgorithm = 'SHA-512'; break;
        default: throw new Error(`未対応のHMACアルゴリズム: ${algorithm}`);
      }

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: hashAlgorithm },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
      const signatureArray = new Uint8Array(signature);
      
      const base64Signature = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      if (base64Signature === parts[2]) {
        showVerificationResult('✅ 署名検証に成功しました！', 'success');
      } else {
        showVerificationResult('❌ 署名検証に失敗しました。秘密鍵が正しくない可能性があります。', 'error');
      }

    } catch (error) {
      showVerificationResult(`HMAC検証エラー: ${error.message}`, 'error');
    }
  }

  function showVerificationResult(message, type) {
    verificationResult.className = `verification-result verification-${type}`;
    verificationResult.textContent = message;
    verificationResult.style.display = 'block';
  }

  function copyToClipboard(text, button, originalText) {
    try {
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'コピーしました!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      });
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      button.textContent = 'コピーしました!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  }

  // Event listeners
  parseBtn.addEventListener('click', parseJWT);
  
  clearBtn.addEventListener('click', () => {
    jwtInput.value = '';
    resultsContainer.style.display = 'none';
    hideStatus();
    verificationResult.style.display = 'none';
    jwtInput.focus();
  });

  sampleBtn.addEventListener('click', () => {
    jwtInput.value = sampleJWT;
    parseJWT();
  });

  copyHeaderBtn.addEventListener('click', () => {
    if (currentJWT) {
      copyToClipboard(formatJSON(currentJWT.header), copyHeaderBtn, 'ヘッダーをコピー');
    }
  });

  copyPayloadBtn.addEventListener('click', () => {
    if (currentJWT) {
      copyToClipboard(formatJSON(currentJWT.payload), copyPayloadBtn, 'ペイロードをコピー');
    }
  });

  verifyBtn.addEventListener('click', verifySignature);

  // Auto-parse on input (debounced)
  let parseTimeout;
  jwtInput.addEventListener('input', () => {
    clearTimeout(parseTimeout);
    parseTimeout = setTimeout(() => {
      if (jwtInput.value.trim()) {
        parseJWT();
      } else {
        resultsContainer.style.display = 'none';
        hideStatus();
      }
    }, 500);
  });

  // Keyboard shortcuts
  jwtInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      parseJWT();
    }
  });

})();
</script>