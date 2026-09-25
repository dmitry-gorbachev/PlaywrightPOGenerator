// DOM Elements
const htmlInput = document.getElementById('htmlInput');
const fileInput = document.getElementById('fileInput');
const classNameInput = document.getElementById('className');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const codeOutput = document.getElementById('codeOutput');
const classNameDisplay = document.getElementById('classNameDisplay');
const loading = document.getElementById('loading');
const warnings = document.getElementById('warnings');
const warningsContent = document.getElementById('warningsContent');
const elementsContainer = document.getElementById('elementsContainer');
const extractedElements = document.getElementById('extractedElements');
const elementCount = document.getElementById('elementCount');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// State
let currentDownloadId = null;

// Event Listeners
generateBtn.addEventListener('click', handleGenerate);
clearBtn.addEventListener('click', handleClear);
copyBtn.addEventListener('click', handleCopy);
downloadBtn.addEventListener('click', handleDownload);
fileInput.addEventListener('change', handleFileSelect);
tabButtons.forEach(btn => btn.addEventListener('click', handleTabClick));

// Drag and drop
const fileLabel = document.querySelector('.file-upload label');
if (fileLabel) {
  fileLabel.addEventListener('dragover', e => {
    e.preventDefault();
    fileLabel.style.background = '#f0f0ff';
  });
  fileLabel.addEventListener('dragleave', () => {
    fileLabel.style.background = '#f9f9ff';
  });
  fileLabel.addEventListener('drop', e => {
    e.preventDefault();
    fileLabel.style.background = '#f9f9ff';
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.html')) {
      fileInput.files = files;
      handleFileSelect();
    }
  });
}

// Handle tab switching
function handleTabClick(e) {
  const tabName = e.target.dataset.tab;

  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));

  e.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// Handle file selection
function handleFileSelect() {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      htmlInput.value = e.target.result;
    };
    reader.readAsText(file);
  }
}

// Handle generate
async function handleGenerate() {
  const htmlContent = htmlInput.value.trim();

  if (!htmlContent) {
    alert('Please enter HTML content or upload a file');
    return;
  }

  generateBtn.disabled = true;
  loading.style.display = 'block';

  try {
    const formData = new FormData();
    formData.append('html', htmlContent);
    formData.append('className', classNameInput.value);

    const response = await fetch('/api/generate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate Page Object');
    }

    const result = await response.json();
    displayResult(result);
    currentDownloadId = result.downloadId;
  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error('Generation error:', error);
  } finally {
    generateBtn.disabled = false;
    loading.style.display = 'none';
  }
}

// Display result
function displayResult(result) {
  // Update code display
  codeOutput.textContent = result.code;
  classNameDisplay.textContent = result.className;

  // Show/hide warnings
  if (result.warnings && result.warnings.length > 0) {
    warningsContent.innerHTML = result.warnings.map(w => `<div>⚠️ ${escapeHtml(w)}</div>`).join('');
    warnings.classList.remove('hidden');
  } else {
    warnings.classList.add('hidden');
  }

  // Show/hide extracted elements
  if (result.extractedElements && result.extractedElements.length > 0) {
    elementCount.textContent = result.extractedElements.length;
    extractedElements.innerHTML = result.extractedElements
      .map(el => `
        <div class="element-item">
          <span class="element-badge">${escapeHtml(el.type)}</span>
          <strong>${escapeHtml(el.name)}</strong>
          <span style="color: #999;">← ${escapeHtml(el.locatorStrategy)}</span>
        </div>
      `)
      .join('');
    elementsContainer.classList.remove('hidden');
  } else {
    elementsContainer.classList.add('hidden');
  }

  // Enable download button
  downloadBtn.disabled = false;
}

// Handle copy
function handleCopy() {
  const code = codeOutput.textContent.trim();

  if (!code || code === '// Generated code will appear here...') {
    alert('Generate code first');
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }).catch(() => {
      fallbackCopy(code);
    });
  } else {
    fallbackCopy(code);
  }
}

// Fallback copy method for older browsers
function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    alert('Failed to copy to clipboard');
  }
  document.body.removeChild(textArea);
}

// Handle download
function handleDownload() {
  if (!currentDownloadId) {
    alert('Generate code first');
    return;
  }

  const link = document.createElement('a');
  link.href = `/api/download/${currentDownloadId}`;
  link.download = `${classNameDisplay.textContent}.ts`;
  link.click();
}

// Handle clear
function handleClear() {
  htmlInput.value = '';
  fileInput.value = '';
  classNameInput.value = '';
  codeOutput.textContent = '// Generated code will appear here...';
  classNameDisplay.textContent = '-';
  warnings.classList.add('hidden');
  elementsContainer.classList.add('hidden');
  downloadBtn.disabled = true;
  currentDownloadId = null;
}

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
console.log('Playwright Page Object Generator UI loaded');
