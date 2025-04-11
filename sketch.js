let img;
let pixelData = [];
let minSlider, maxSlider, densitySlider;
let canvas;
const MARGIN = 40;
let bgColor = '#191916';

function setup() {
  canvas = createCanvas(windowWidth - MARGIN * 2, windowHeight - MARGIN * 2);
  canvas.position(MARGIN, MARGIN);
  noLoop();

  minSlider = document.getElementById('minLength');
  maxSlider = document.getElementById('maxLength');
  densitySlider = document.getElementById('density');

  minSlider.addEventListener('input', drawStrokes);
  maxSlider.addEventListener('input', drawStrokes);
  densitySlider.addEventListener('input', function() {
    updateDensityDisplay();
    drawStrokes(); // Make sure the strokes are redrawn when density slider changes
  });

  document.getElementById('imgInput').addEventListener('change', handleImageUpload);
  document.getElementById('exportBtn').addEventListener('click', exportTransparentPNG);
}

// Function to update the density display
function updateDensityDisplay() {
  const densityDisplay = document.getElementById('densityDisplay');
  densityDisplay.textContent = densitySlider.value;
}

// Initialize the sliders and input fields
const minLengthSlider = document.getElementById("minLength");
const maxLengthSlider = document.getElementById("maxLength");
const minLengthInput = document.getElementById("minLengthInput");
const maxLengthInput = document.getElementById("maxLengthInput");

// Update the slider min/max values when the input fields change
minLengthInput.addEventListener("input", function() {
  const minValue = parseInt(minLengthInput.value);
  minLengthSlider.min = minValue; // Update the slider's min value
  minLengthSlider.value = minValue; // Set the slider value to the new min
});

maxLengthInput.addEventListener("input", function() {
  const maxValue = parseInt(maxLengthInput.value);
  maxLengthSlider.max = maxValue; // Update the slider's max value
  maxLengthSlider.value = maxValue; // Set the slider value to the new max
});

// Update the input fields when the sliders change
minLengthSlider.addEventListener("input", function() {
  minLengthInput.value = minLengthSlider.value; // Update the input to match the slider value
});

maxLengthSlider.addEventListener("input", function() {
  maxLengthInput.value = maxLengthSlider.value; // Update the input to match the slider value
});

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image')) {
    const reader = new FileReader();
    reader.onload = function (f) {
      loadImage(f.target.result, imgLoaded);
    };
    reader.readAsDataURL(file);
  }
}

function imgLoaded(loadedImage) {
  img = loadedImage;

  const aspect = img.width / img.height;
  const maxW = width;
  const maxH = height;

  let newW, newH;
  if (aspect > maxW / maxH) {
    newW = maxW;
    newH = maxW / aspect;
  } else {
    newH = maxH;
    newW = maxH * aspect;
  }

  img.resize(floor(newW), floor(newH));
  img.loadPixels();

  pixelData = [];
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let idx = (x + y * img.width) * 4;
      let r = img.pixels[idx];
      let g = img.pixels[idx + 1];
      let b = img.pixels[idx + 2];
      let a = img.pixels[idx + 3];
      if (a > 0) {
        pixelData.push({ x, y, r, g, b });
      }
    }
  }

  drawStrokes();
}

function drawStrokes() {
  clear();
  background(bgColor);
  if (!img) return;

  let offsetX = (width - img.width) / 2;
  let offsetY = (height - img.height) / 2;

  let minLen = parseInt(minSlider.value);
  let maxLen = parseInt(maxSlider.value);
  let density = parseInt(densitySlider.value) / 100;

  const numToDraw = int(density * pixelData.length);
  for (let i = 0; i < numToDraw; i++) {
    let p = random(pixelData);
    let col = color(p.r, p.g, p.b);
    let h = hue(col);

    let baseAngle = map(h, 0, 360, 0, TWO_PI);
    let angle = baseAngle + random(-PI / 6, PI / 6);

    let len = random(minLen, maxLen);
    let cx = p.x + offsetX;
    let cy = p.y + offsetY;

    let x1 = cx - cos(angle) * len / 2;
    let y1 = cy - sin(angle) * len / 2;
    let x2 = cx + cos(angle) * len / 2;
    let y2 = cy + sin(angle) * len / 2;

    stroke(col);
    strokeWeight(1);
    noFill();

    if (random(1) < 0.5) {
      line(x1, y1, x2, y2);
    } else {
      let ctrlX = (x1 + x2) / 2 + random(-10, 10);
      let ctrlY = (y1 + y2) / 2 + random(-10, 10);
      bezier(x1, y1, ctrlX, ctrlY, ctrlX, ctrlY, x2, y2);
    }
  }
}

function exportTransparentPNG() {
  // Temporarily clear background to make export transparent
  clear(); // clears with alpha
  if (img) drawStrokesWithoutBackground();
  saveCanvas('myCanvas', 'png');
  // Redraw with visible background
  drawStrokes();
}

function drawStrokesWithoutBackground() {
  if (!img) return;

  let offsetX = (width - img.width) / 2;
  let offsetY = (height - img.height) / 2;

  let minLen = parseInt(minSlider.value);
  let maxLen = parseInt(maxSlider.value);
  let density = parseInt(densitySlider.value) / 100;

  const numToDraw = int(density * pixelData.length);
  for (let i = 0; i < numToDraw; i++) {
    let p = random(pixelData);
    let col = color(p.r, p.g, p.b);
    let h = hue(col);

    let baseAngle = map(h, 0, 360, 0, TWO_PI);
    let angle = baseAngle + random(-PI / 6, PI / 6);

    let len = random(minLen, maxLen);
    let cx = p.x + offsetX;
    let cy = p.y + offsetY;

    let x1 = cx - cos(angle) * len / 2;
    let y1 = cy - sin(angle) * len / 2;
    let x2 = cx + cos(angle) * len / 2;
    let y2 = cy + sin(angle) * len / 2;

    stroke(col);
    strokeWeight(1);
    noFill();

    if (random(1) < 0.5) {
      line(x1, y1, x2, y2);
    } else {
      let ctrlX = (x1 + x2) / 2 + random(-10, 10);
      let ctrlY = (y1 + y2) / 2 + random(-10, 10);
      bezier(x1, y1, ctrlX, ctrlY, ctrlX, ctrlY, x2, y2);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth - MARGIN * 2, windowHeight - MARGIN * 2);
  canvas.position(MARGIN, MARGIN);
  if (img) {
    imgLoaded(img);
  }
}
