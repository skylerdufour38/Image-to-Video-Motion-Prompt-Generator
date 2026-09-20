const imageInput = document.getElementById('imageInput');
const audioInput = document.getElementById('audioInput');
const maskInput = document.getElementById('maskInput');
const promptInput = document.getElementById('promptInput');
const resolutionSelect = document.getElementById('resolutionSelect');
const generateButton = document.getElementById('generateButton');
const statusLabel = document.getElementById('status');
const previewVideo = document.getElementById('previewVideo');
const placeholder = document.getElementById('placeholder');
const downloadLink = document.getElementById('downloadLink');

const imageName = document.getElementById('imageName');
const audioName = document.getElementById('audioName');
const maskName = document.getElementById('maskName');

function updateFileLabel(input, labelNode, fallbackText) {
  const file = input.files && input.files[0];
  labelNode.textContent = file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)` : fallbackText;
}

imageInput.addEventListener('change', () => updateFileLabel(imageInput, imageName, 'No image selected'));
audioInput.addEventListener('change', () => updateFileLabel(audioInput, audioName, 'No audio selected'));
maskInput.addEventListener('change', () => updateFileLabel(maskInput, maskName, 'No mask selected'));

generateButton.addEventListener('click', async () => {
  const imageFile = imageInput.files && imageInput.files[0];
  if (!imageFile) {
    statusLabel.textContent = 'Please upload an image before generating the video.';
    return;
  }

  const prompt = promptInput.value.trim() || 'Slow cinematic push in, maintaining subject focus with subtle parallax and realistic natural motion.';
  const resolution = resolutionSelect.value;

  statusLabel.textContent = 'Generating preview video...';
  generateButton.disabled = true;
  downloadLink.classList.add('hidden');

  try {
    const blob = await buildMockVideo({ imageFile, prompt, resolution });
    const url = URL.createObjectURL(blob);

    previewVideo.src = url;
    previewVideo.muted = false;
    previewVideo.play().catch(() => {});
    previewVideo.classList.remove('hidden');
    placeholder.classList.add('hidden');

    downloadLink.href = url;
    downloadLink.download = `motion-prompt-${resolution}.mp4`;
    downloadLink.classList.remove('hidden');
    statusLabel.textContent = `Video generated at ${resolution}. Preview is ready to play.`;
  } catch (error) {
    console.error(error);
    statusLabel.textContent = 'Generation failed. Try a different browser or a smaller image file.';
  } finally {
    generateButton.disabled = false;
  }
});

function getSupportedMimeType() {
  const types = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=avc1.4D401E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function buildMockVideo({ imageFile, prompt, resolution }) {
  if (!window.MediaRecorder) {
    throw new Error('MediaRecorder is not supported in this browser.');
  }

  const imageUrl = await readFileAsDataURL(imageFile);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = resolution === '4k' ? 3840 : resolution === '720p' ? 1280 : 1920;
  const height = resolution === '4k' ? 2160 : resolution === '720p' ? 720 : 1080;

  canvas.width = width;
  canvas.height = height;

  const image = new Image();
  image.src = imageUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const stream = canvas.captureStream(30);
  const mimeType = getSupportedMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const durationMs = 3000;
  const start = performance.now();

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
      resolve(blob);
    };

    recorder.onerror = () => reject(new Error('The video recorder failed.'));

    recorder.start();

    const drawFrame = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const drift = Math.sin(elapsed / 500) * 18;
      const scale = 1.08 + Math.sin(elapsed / 450) * 0.06;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050a13';
      ctx.fillRect(0, 0, width, height);

      const targetWidth = width * 0.72;
      const targetHeight = height * 0.74;
      const offsetX = (width - targetWidth) / 2 + drift;
      const offsetY = (height - targetHeight) / 2 + Math.sin(elapsed / 700) * 20;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(image, offsetX, offsetY, targetWidth, targetHeight);
      ctx.restore();

      const overlay = ctx.createLinearGradient(0, height * 0.7, 0, height);
      overlay.addColorStop(0, 'rgba(7, 13, 22, 0)');
      overlay.addColorStop(1, 'rgba(7, 13, 22, 0.78)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(102, 217, 255, 0.9)';
      ctx.font = '700 44px Inter, sans-serif';
      ctx.fillText('Motion Prompt', 72, height - 150);

      ctx.fillStyle = '#f3f6ff';
      ctx.font = '500 24px Inter, sans-serif';
      const wrappedPrompt = wrapText(prompt, width - 160, 26, ctx, 2);
      wrappedPrompt.forEach((line, index) => {
        ctx.fillText(line, 72, height - 100 + index * 30);
      });

      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      } else {
        const finalDelayMs = 200;
        setTimeout(() => recorder.stop(), finalDelayMs);
      }
    };

    requestAnimationFrame(drawFrame);
  });
}

function wrapText(text, maxWidth, maxFontSize, context, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const tempLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(tempLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines) {
        break;
      }
    } else {
      currentLine = tempLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [text.slice(0, 36) + '…'];
}
