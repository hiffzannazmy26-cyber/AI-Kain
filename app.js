const LABELS = [
  'Kain Tenun Sidan',
  'Kain Tenun Kelingai',
  'Kain Batik',
  'Corak Bunga'
];

const MODEL_URL = './savedModel.json';
const IMAGE_SIZE = 224;

let model = null;
let currentImageReady = false;
let stream = null;

const modelStatus = document.getElementById('modelStatus');
const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');
const emptyPreview = document.getElementById('emptyPreview');
const predictBtn = document.getElementById('predictBtn');
const resetBtn = document.getElementById('resetBtn');
const resultCard = document.getElementById('resultCard');
const topLabel = document.getElementById('topLabel');
const topConfidence = document.getElementById('topConfidence');
const allScores = document.getElementById('allScores');
const cameraBtn = document.getElementById('cameraBtn');
const cameraPanel = document.getElementById('cameraPanel');
const camera = document.getElementById('camera');
const captureBtn = document.getElementById('captureBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const captureCanvas = document.getElementById('captureCanvas');

window.addEventListener('load', async () => {
  await loadModel();
  registerServiceWorker();
});

async function loadModel() {
  try {
    modelStatus.textContent = 'Memuatkan model AI...';
    model = await tf.loadLayersModel(MODEL_URL);
    tf.tidy(() => model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])));
    modelStatus.textContent = 'Model AI sedia digunakan ✅';
    modelStatus.classList.remove('error');
    modelStatus.classList.add('ready');
    updatePredictButton();
  } catch (error) {
    console.error(error);
    modelStatus.textContent = 'Model gagal dimuatkan. Pastikan savedModel.json dan weight.bin berada di halaman utama repository.';
    modelStatus.classList.add('error');
  }
}

imageUpload.addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  setPreview(url);
});

function setPreview(src) {
  preview.onload = () => {
    currentImageReady = true;
    if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    updatePredictButton();
  };
  preview.src = src;
  preview.style.display = 'block';
  emptyPreview.classList.add('hidden');
  resultCard.classList.add('hidden');
}

predictBtn.addEventListener('click', async () => {
  if (!model || !currentImageReady) return;
  await predictImage();
});

async function predictImage() {
  try {
    predictBtn.disabled = true;
    predictBtn.textContent = '🤖 Sedang menganalisis...';

    const input = tf.tidy(() => {
      const tensor = tf.browser.fromPixels(preview)
        .resizeBilinear([IMAGE_SIZE, IMAGE_SIZE])
        .toFloat();

      return tensor.div(127.5).sub(1).expandDims(0);
    });

    const prediction = model.predict(input);
    const rawScores = await prediction.data();

    input.dispose();
    prediction.dispose();

    const scores = Array.from(rawScores).map((score, index) => ({
      label: LABELS[index] || `Kelas ${index + 1}`,
      score: Number(score)
    })).sort((a, b) => b.score - a.score);

    showResult(scores);
  } catch (error) {
    console.error(error);
    alert('Maaf, berlaku ralat semasa klasifikasi. Sila cuba gambar lain.');
  } finally {
    predictBtn.textContent = '🤖 Kenal Pasti Corak';
    updatePredictButton();
  }
}

function showResult(scores) {
  const best = scores[0];
  topLabel.textContent = best.label;
  topConfidence.textContent = toPercent(best.score);

  allScores.innerHTML = '';
  scores.forEach(item => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `<span class="score-name">${item.label}</span><span class="score-value">${toPercent(item.score)}</span>`;
    allScores.appendChild(row);
  });

  resultCard.classList.remove('hidden');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function updatePredictButton() {
  predictBtn.disabled = !(model && currentImageReady);
}

resetBtn.addEventListener('click', () => {
  currentImageReady = false;
  preview.removeAttribute('src');
  preview.style.display = 'none';
  emptyPreview.classList.remove('hidden');
  resultCard.classList.add('hidden');
  imageUpload.value = '';
  updatePredictButton();
});

cameraBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    camera.srcObject = stream;
    cameraPanel.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    alert('Kamera tidak dapat dibuka. Pastikan laman ini dibuka melalui HTTPS/GitHub Pages dan beri permission kamera.');
  }
});

captureBtn.addEventListener('click', () => {
  const context = captureCanvas.getContext('2d');
  captureCanvas.width = camera.videoWidth || IMAGE_SIZE;
  captureCanvas.height = camera.videoHeight || IMAGE_SIZE;
  context.drawImage(camera, 0, 0, captureCanvas.width, captureCanvas.height);

  const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.92);
  preview.onload = () => {
    currentImageReady = true;
    updatePredictButton();
  };

  preview.src = dataUrl;
  preview.style.display = 'block';
  emptyPreview.classList.add('hidden');
  resultCard.classList.add('hidden');
  stopCamera();
});

closeCameraBtn.addEventListener('click', stopCamera);

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  camera.srcObject = null;
  cameraPanel.classList.add('hidden');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(console.warn);
  }
}
