---
layout: page
title: カラーパレット生成ツール
permalink: /color-palette/
---

<div class="color-palette-tool">
  <div class="tool-section">
    <h3>🎨 基準色の選択</h3>
    <div class="color-input-group">
      <label for="colorPicker">カラーピッカー:</label>
      <input type="color" id="colorPicker" value="#3498db">
      <label for="hexInput">HEXコード:</label>
      <input type="text" id="hexInput" value="#3498db" placeholder="#RRGGBB">
    </div>
  </div>
  
  <div class="tool-section">
    <h3>📊 配色パターン</h3>
    <div class="pattern-buttons">
      <button id="complementaryBtn" class="btn btn-primary">補色</button>
      <button id="analogousBtn" class="btn btn-primary">類似色</button>
      <button id="triadicBtn" class="btn btn-primary">トライアド</button>
      <button id="tetradicBtn" class="btn btn-primary">テトラード</button>
      <button id="monochromaticBtn" class="btn btn-primary">単色階調</button>
      <button id="splitComplementaryBtn" class="btn btn-primary">分裂補色</button>
    </div>
  </div>
  
  <div class="tool-section">
    <h3>🎭 生成されたパレット</h3>
    <div id="paletteContainer" class="palette-container">
      <p>配色パターンを選択してパレットを生成してください</p>
    </div>
    <div class="palette-actions">
      <button id="copyAllColorsBtn" class="btn">全色をコピー</button>
      <button id="exportCSSBtn" class="btn">CSS変数で出力</button>
      <button id="exportJSONBtn" class="btn">JSON形式で出力</button>
    </div>
  </div>
  
  <div class="tool-section">
    <h3>📋 エクスポート結果</h3>
    <textarea id="exportResult" placeholder="エクスポート結果がここに表示されます..." rows="8" readonly></textarea>
    <button id="copyExportBtn" class="btn">結果をコピー</button>
  </div>
  
  <div class="info-section">
    <h4>💡 配色について</h4>
    <div class="color-theory">
      <p><strong>補色:</strong> 色相環の反対側にある色。コントラストが強く、目立つ配色</p>
      <p><strong>類似色:</strong> 色相環で隣り合う色。調和的で落ち着いた配色</p>
      <p><strong>トライアド:</strong> 色相環を3等分した位置の色。バランスの良い配色</p>
      <p><strong>テトラード:</strong> 色相環を4等分した位置の色。豊かで多様な配色</p>
      <p><strong>単色階調:</strong> 同じ色相で明度・彩度を変えた配色</p>
      <p><strong>分裂補色:</strong> 補色の両隣の色を使った配色</p>
    </div>
  </div>
</div>

<style>
.color-palette-tool {
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

.color-input-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.color-input-group label {
  font-weight: 600;
  color: #555;
}

.color-input-group input[type="color"] {
  width: 60px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.color-input-group input[type="text"] {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  width: 120px;
}

.pattern-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

.palette-container {
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.color-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-item:hover {
  transform: scale(1.05);
}

.color-swatch {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 8px;
}

.color-codes {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.3;
}

.color-codes div {
  margin: 2px 0;
  padding: 2px 4px;
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}

.palette-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.tool-section textarea {
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
  background-color: #f8f9fa;
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

.color-theory p {
  margin: 10px 0;
  line-height: 1.6;
}

.success {
  color: #155724;
  background: #d4edda;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .color-input-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pattern-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .palette-actions {
    flex-direction: column;
  }
  
  .color-swatch {
    width: 60px;
    height: 60px;
  }
}
</style>

<script>
(function() {
  const colorPicker = document.getElementById('colorPicker');
  const hexInput = document.getElementById('hexInput');
  const paletteContainer = document.getElementById('paletteContainer');
  const exportResult = document.getElementById('exportResult');
  
  let currentPalette = [];

  // 色変換関数
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    if (s === 0) {
      return { r: l * 255, g: l * 255, b: l * 255 };
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
      };
    }
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function generatePalette(baseColor, type) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [];

    switch (type) {
      case 'complementary':
        colors = [
          baseColor,
          hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
        ];
        break;
      
      case 'analogous':
        colors = [
          hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
          baseColor,
          hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l)
        ];
        break;
      
      case 'triadic':
        colors = [
          baseColor,
          hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
        ];
        break;
      
      case 'tetradic':
        colors = [
          baseColor,
          hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
        ];
        break;
      
      case 'monochromatic':
        colors = [
          hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 40, 10)),
          hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 10)),
          baseColor,
          hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90)),
          hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 40, 90))
        ];
        break;
      
      case 'splitComplementary':
        colors = [
          baseColor,
          hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
        ];
        break;
    }

    return colors;
  }

  function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  function displayPalette(colors) {
    currentPalette = colors;
    paletteContainer.innerHTML = '';
    
    colors.forEach((color, index) => {
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      const colorItem = document.createElement('div');
      colorItem.className = 'color-item';
      colorItem.onclick = () => copyColorCode(color);
      
      colorItem.innerHTML = `
        <div class="color-swatch" style="background-color: ${color}"></div>
        <div class="color-codes">
          <div>HEX: ${color.toUpperCase()}</div>
          <div>RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}</div>
          <div>HSL: ${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%</div>
        </div>
      `;
      
      paletteContainer.appendChild(colorItem);
    });
  }

  function copyColorCode(color) {
    navigator.clipboard.writeText(color).then(() => {
      showMessage(paletteContainer, `色コード ${color} をコピーしました`);
    });
  }

  function showMessage(element, message) {
    const existingMsg = element.parentNode.querySelector('.success');
    if (existingMsg) {
      existingMsg.remove();
    }
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'success';
    msgDiv.textContent = message;
    element.parentNode.appendChild(msgDiv);
    
    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.remove();
      }
    }, 3000);
  }

  // イベントリスナー
  colorPicker.addEventListener('change', function() {
    hexInput.value = this.value;
  });

  hexInput.addEventListener('input', function() {
    if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
      colorPicker.value = this.value;
    }
  });

  // パターンボタン
  document.getElementById('complementaryBtn').addEventListener('click', () => {
    const colors = generatePalette(hexInput.value, 'complementary');
    displayPalette(colors);
  });

  document.getElementById('analogousBtn').addEventListener('click', () => {
    const colors = generatePalette(hexInput.value, 'analogous');
    displayPalette(colors);
  });

  document.getElementById('triadicBtn').addEventListener('click', () => {
    const colors = generatePalette(hexInput.value, 'triadic');
    displayPalette(colors);
  });

  document.getElementById('tetradicBtn').addEventListener('click', () => {
    const colors = generatePalette(hexInput.value, 'tetradic');
    displayPalette(colors);
  });

  document.getElementById('monochromaticBtn').addEventListener('click', () => {
    const colors = generatePalette(hexInput.value, 'monochromatic');
    displayPalette(colors);
  });

  document.getElementById('splitComplementaryBtn').addEventListener('click', () => {
    const colors = generatePalette(hexInput.value, 'splitComplementary');
    displayPalette(colors);
  });

  // エクスポート機能
  document.getElementById('copyAllColorsBtn').addEventListener('click', () => {
    if (currentPalette.length === 0) return;
    const colorList = currentPalette.join('\n');
    navigator.clipboard.writeText(colorList).then(() => {
      showMessage(paletteContainer, '全色をコピーしました');
    });
  });

  document.getElementById('exportCSSBtn').addEventListener('click', () => {
    if (currentPalette.length === 0) return;
    let css = ':root {\n';
    currentPalette.forEach((color, index) => {
      css += `  --color-${index + 1}: ${color};\n`;
    });
    css += '}';
    exportResult.value = css;
  });

  document.getElementById('exportJSONBtn').addEventListener('click', () => {
    if (currentPalette.length === 0) return;
    const palette = {};
    currentPalette.forEach((color, index) => {
      const rgb = hexToRgb(color);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      palette[`color${index + 1}`] = {
        hex: color,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
      };
    });
    exportResult.value = JSON.stringify(palette, null, 2);
  });

  document.getElementById('copyExportBtn').addEventListener('click', () => {
    if (!exportResult.value) return;
    navigator.clipboard.writeText(exportResult.value).then(() => {
      showMessage(exportResult, 'エクスポート結果をコピーしました');
    });
  });
})();
</script>