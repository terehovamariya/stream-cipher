class StreamCipher {
  constructor(key) {
    this.key = key;
    this.SCRAMBLER_SIZE = 256;
    this.state = new Array(this.SCRAMBLER_SIZE);
    this.i = this.j = 0;
    this._initialize();
  }

  _initialize() {
    for (let i = 0; i < this.SCRAMBLER_SIZE; i++) {
      this.state[i] = i;
    }

    let j = 0;
    for (let i = 0; i < this.SCRAMBLER_SIZE; i++) {
      const keyChar = this.key.charCodeAt(i % this.key.length);
      j = (j + this.state[i] + keyChar) % this.SCRAMBLER_SIZE;
      [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
    }

    this.i = this.j = 0;
  }

  _nextKeyByte() {
    this.i = (this.i + 1) % this.SCRAMBLER_SIZE;
    this.j = (this.j + this.state[this.i]) % this.SCRAMBLER_SIZE;
    [this.state[this.i], this.state[this.j]] = [
      this.state[this.j],
      this.state[this.i],
    ];
    const t = (this.state[this.i] + this.state[this.j]) % this.SCRAMBLER_SIZE;
    return this.state[t];
  }

  process(text) {
    let result = "";
    for (let char of text) {
      const charCode = char.charCodeAt(0);
      const keyByte = this._nextKeyByte();
      result += String.fromCharCode(charCode ^ keyByte);
    }
    return result;
  }

  reset() {
    this._initialize();
  }
}

let currentCipher = null;

function showStatus(message, type = "info") {
  const statusEl = document.getElementById("status");
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function textToHex(text) {
  let hex = "";
  for (let i = 0; i < text.length; i++) {
    hex += text.charCodeAt(i).toString(16).padStart(2, "0") + " ";
    if ((i + 1) % 16 === 0) hex += "\n";
  }
  return hex.trim();
}

function updateStats() {
  const text = document.getElementById("text").value;
  const key = document.getElementById("key").value;
  document.getElementById("text-length").textContent = text.length;
  document.getElementById("key-length").textContent = key.length;

  if (text.length > 0) {
    showStatus(
      "Текст введен. Выберите действие: зашифровать или расшифровать.",
      "info"
    );
  }
}

function clearResult() {
  document.getElementById("result").textContent = "Здесь появится результат...";
  document.getElementById("hex-result").textContent = "";
}

function encryptText() {
  const key = document.getElementById("key").value;
  const text = document.getElementById("text").value;

  if (!key) {
    showStatus("❌ Введите ключ шифрования", "warning");
    return;
  }

  if (!text) {
    showStatus("❌ Введите текст для шифрования", "warning");
    return;
  }

  try {
    if (!currentCipher || currentCipher.key !== key) {
      currentCipher = new StreamCipher(key);
    } else {
      currentCipher.reset();
    }

    const encrypted = currentCipher.process(text);
    document.getElementById("result").textContent = encrypted;
    document.getElementById("hex-result").textContent = textToHex(encrypted);

    showStatus(
      "✅ Текст успешно зашифрован! Для расшифрования используйте тот же ключ.",
      "success"
    );
  } catch (error) {
    showStatus("❌ Ошибка при шифровании: " + error.message, "warning");
  }
}

function decryptText() {
  const key = document.getElementById("key").value;
  const text = document.getElementById("text").value;

  if (!key) {
    showStatus("❌ Введите ключ шифрования", "warning");
    return;
  }

  if (!text) {
    showStatus("❌ Введите текст для расшифрования", "warning");
    return;
  }

  try {
    if (!currentCipher || currentCipher.key !== key) {
      currentCipher = new StreamCipher(key);
    } else {
      currentCipher.reset();
    }

    const decrypted = currentCipher.process(text);
    document.getElementById("result").textContent = decrypted;
    document.getElementById("hex-result").textContent = textToHex(decrypted);

    showStatus("✅ Текст успешно расшифрован!", "success");
  } catch (error) {
    showStatus(
      "❌ Ошибка при расшифровании. Проверьте ключ и правильность зашифрованного текста.",
      "warning"
    );
  }
}

function resetCipher() {
  const key = document.getElementById("key").value;
  if (key && currentCipher) {
    currentCipher.reset();
    clearResult();
    showStatus(
      "🔄 Состояние шифра сброшено. Можно начинать новое шифрование.",
      "info"
    );
  } else {
    showStatus("⚠️ Введите ключ для инициализации шифра", "warning");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("text").addEventListener("input", updateStats);
  document.getElementById("key").addEventListener("input", updateStats);

  updateStats();

  document.getElementById("key").addEventListener("input", function () {
    clearResult();
    showStatus("Ключ изменен. Результат очищен.", "info");
  });

  document.getElementById("text").addEventListener("input", function () {
    clearResult();
    if (this.value.length > 0) {
      showStatus("Текст изменен. Результат очищен. Выберите действие.", "info");
    }
  });
});

window.StreamCipher = StreamCipher;
window.encryptText = encryptText;
window.decryptText = decryptText;
window.resetCipher = resetCipher;

console.log("🔐 Потоковый шифр инициализирован!");
