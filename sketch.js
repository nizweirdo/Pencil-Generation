let img;
let pixelData = [];
let minSlider, maxSlider, densitySlider, angleSlider, angleInput;
let canvas;
const MARGIN = 40;
let bgColor = '#191916';

function setup() {
  canvas = createCanvas(windowWidth - MARGIN * 2, windowHeight - MARGIN * 2);
  canvas.position(MARGIN, MARGIN);
  noLoop();

  // Initialize sliders
  minSlider = document.getElementById('minLength');
  maxSlider = document.getElementById('maxLength');
  densitySlider = document.getElementById('density');
  angleSlider = document.getElementById('angle');  // New angle slider
  angleInput = document.getElementById('angleInput');  // New angle input

  // Add event listeners
  minSlider.addEventListener('input', drawStrokes);
  maxSlider.addEventListener('input', drawStrokes);
  densitySlider.addEventListener('input', function() {
    updateDensityDisplay();
    drawStrokes();
  });

  // Event listener for the angle slider and input
  angleSlider.addEventListener('input', function() {
    updateAngleDisplay();
    drawStrokes();  // Redraw when angle changes
  });

  angleInput.addEventListener('input', function() {
    const angleValue = parseFloat(angleInput.value);
    angleSlider.value = map(angleValue, -90, 90, -PI / 2, PI / 2); // Map input to slider range
    drawStrokes();  // Redraw when angle input changes
  });

  document.getElementById('imgInput').addEventListener('change', handleImageUpload);
  document.getElementById('exportBtn').addEventListener('click', exportTransparentPNG);
}

// Function to update the density display
function updateDensityDisplay() {
  const densityDisplay = document.getElementById('densityDisplay');
  densityDisplay.textContent = densitySlider.value;
}

// Function to update the angle display (convert slider value to degrees)
function updateAngleDisplay() {
  const angleValue = angleSlider.value;
  angleInput.value = map(angleValue, -PI / 2, PI / 2, -90, 90).toFixed(1); // Convert to degrees
}

// Image upload handler
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

// Process the uploaded image
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

// Function to draw strokes on the canvas
function drawStrokes() {
  clear();
  background(bgColor);
  if (!img) return;

  let offsetX = (width - img.width) / 2;
  let offsetY = (height - img.height) / 2;

  let minLen = parseInt(minSlider.value);
  let maxLen = parseInt(maxSlider.value);
  let density = parseInt(densitySlider.value) / 100;
  let angleControl = parseFloat(angleSlider.value); // Get angle from slider

  const numToDraw = int(density * pixelData.length);
  for (let i = 0; i < numToDraw; i++) {
    let p = random(pixelData);
    let col = color(p.r, p.g, p.b);
    let h = hue(col);

    let baseAngle = map(h, 0, 360, 0, TWO_PI);
    let angle = baseAngle + angleControl; // Apply angle control here

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

// Function to export the canvas as a PNG with transparency
function exportTransparentPNG() {
  clear(); // clears with alpha
  if (img) drawStrokesWithoutBackground();
  saveCanvas('myCanvas', 'png');
  drawStrokes();
}

// Function to draw strokes without background for export
function drawStrokesWithoutBackground() {
  if (!img) return;

  let offsetX = (width - img.width) / 2;
  let offsetY = (height - img.height) / 2;

  let minLen = parseInt(minSlider.value);
  let maxLen = parseInt(maxSlider.value);
  let density = parseInt(densitySlider.value) / 100;
  let angleControl = parseFloat(angleSlider.value); // Get angle from slider

  const numToDraw = int(density * pixelData.length);
  for (let i = 0; i < numToDraw; i++) {
    let p = random(pixelData);
    let col = color(p.r, p.g, p.b);
    let h = hue(col);

    let baseAngle = map(h, 0, 360, 0, TWO_PI);
    let angle = baseAngle + angleControl;

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

// Window resize handling
function windowResized() {
  resizeCanvas(windowWidth - MARGIN * 2, windowHeight - MARGIN * 2);
  canvas.position(MARGIN, MARGIN);
  if (img) {
    imgLoaded(img);
  }
}
