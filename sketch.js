let img;
let pixelData = [];
let minSlider, maxSlider, densitySlider, angleSlider, angleInput, curvatureSlider, curvatureInput;
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
  angleSlider = document.getElementById('angle');
  angleInput = document.getElementById('angleInput');
  curvatureSlider = document.getElementById('curvature');
  curvatureInput = document.getElementById('curvatureInput');

  // Initialize input fields
  minLengthInput = document.getElementById('minLengthInput');
  maxLengthInput = document.getElementById('maxLengthInput');

  // Add event listeners
  minSlider.addEventListener('input', function() {
    minLengthInput.value = minSlider.value; // Sync the input field with slider
    drawStrokes();
  });
  maxSlider.addEventListener('input', function() {
    maxLengthInput.value = maxSlider.value; // Sync the input field with slider
    drawStrokes();
  });
  
  densitySlider.addEventListener('input', function() {
    updateDensityDisplay();
    drawStrokes();
  });

  angleSlider.addEventListener('input', function() {
    updateAngleDisplay();
    drawStrokes();
  });

  angleInput.addEventListener('input', function() {
    const angleValue = parseFloat(angleInput.value);
    angleSlider.value = map(angleValue, -90, 90, -PI / 2, PI / 2);
    drawStrokes();
  });

  curvatureSlider.addEventListener('input', function() {
    updateCurvatureDisplay();
    drawStrokes();
  });

  curvatureInput.addEventListener('input', function() {
    const curvatureValue = parseFloat(curvatureInput.value);
    curvatureSlider.value = curvatureValue;
    drawStrokes();
  });

  document.getElementById('imgInput').addEventListener('change', handleImageUpload);
  document.getElementById('exportBtn').addEventListener('click', exportTransparentPNG);

  // Add event listener for export resolution input
  document.getElementById('exportResolutionInput').addEventListener('input', updateExportResolutionDisplay);

  // Add event listeners for number input fields
  minLengthInput.addEventListener('input', function() {
    minSlider.value = parseInt(minLengthInput.value); // Sync the slider with the input field
    drawStrokes();
  });

  maxLengthInput.addEventListener('input', function() {
    maxSlider.value = parseInt(maxLengthInput.value); // Sync the slider with the input field
    drawStrokes();
  });
}



// Function to update the density display
function updateDensityDisplay() {
  const densityDisplay = document.getElementById('densityDisplay');
  densityDisplay.textContent = densitySlider.value;
}

// Function to update the angle display (convert slider value to degrees)
function updateAngleDisplay() {
  const angleValue = angleSlider.value;
  angleInput.value = map(angleValue, -PI / 2, PI / 2, -90, 90).toFixed(1);
}

// Function to update the curvature display
function updateCurvatureDisplay() {
  const curvatureValue = curvatureSlider.value;
  curvatureInput.value = curvatureValue;
}

// Function to update the export resolution display
function updateExportResolutionDisplay() {
  const exportResolution = document.getElementById('exportResolutionInput').value;
  const display = document.getElementById('exportResolutionDisplay');
  display.textContent = `${exportResolution}x`;
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
  let angleControl = parseFloat(angleSlider.value);
  let curvatureControl = parseFloat(curvatureSlider.value);

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
      let ctrlX = (x1 + x2) / 2 + random(-curvatureControl, curvatureControl);
      let ctrlY = (y1 + y2) / 2 + random(-curvatureControl, curvatureControl);
      bezier(x1, y1, ctrlX, ctrlY, ctrlX, ctrlY, x2, y2);
    }
  }
}

// Function to export the canvas as a PNG with transparency
function exportTransparentPNG() {
  // Get the export resolution from the input
  let exportResolution = parseInt(document.getElementById('exportResolutionInput').value);

  // Temporarily clear background to make export transparent
  clear(); // clears with alpha
  
  if (img) drawStrokesWithoutBackground();

  // Create a higher-resolution canvas (2x, 3x, etc.)
  let higherResCanvas = createGraphics(width * exportResolution, height * exportResolution);

  // Scale the current canvas content to the higher resolution
  higherResCanvas.scale(exportResolution);

  // Draw on the higher-resolution canvas
  higherResCanvas.clear();
  if (img) drawStrokesWithoutBackgroundOnCanvas(higherResCanvas);

  // Save the higher-res canvas as PNG
  saveCanvas(higherResCanvas, 'myCanvas', 'png');
  
  // Redraw the original canvas after exporting
  drawStrokes();
}

// Function to draw strokes without background for export
function drawStrokesWithoutBackgroundOnCanvas(higherResCanvas) {
  if (!img) return;

  let offsetX = (width - img.width) / 2;
  let offsetY = (height - img.height) / 2;

  let minLen = parseInt(minSlider.value);
  let maxLen = parseInt(maxSlider.value);
  let density = parseInt(densitySlider.value) / 100;
  let angleControl = parseFloat(angleSlider.value);
  let curvatureControl = parseFloat(curvatureSlider.value); // ✅ Get the real curvature

  const numToDraw = int(density * pixelData.length);
  for (let i = 0; i < numToDraw; i++) {
    let p = random(pixelData);
    let col = color(p.r, p.g, p.b);
    let h = hue(col);

    let baseAngle = map(h, 0, 360, 0, TWO_PI);
    let angle = baseAngle + angleControl; // ✅ Use the actual angleControl

    let len = random(minLen, maxLen);
    let cx = p.x + offsetX;
    let cy = p.y + offsetY;

    let x1 = cx - cos(angle) * len / 2;
    let y1 = cy - sin(angle) * len / 2;
    let x2 = cx + cos(angle) * len / 2;
    let y2 = cy + sin(angle) * len / 2;

    higherResCanvas.stroke(col);
    higherResCanvas.strokeWeight(1);
    higherResCanvas.noFill();

    if (random(1) < 0.5) {
      higherResCanvas.line(x1, y1, x2, y2);
    } else {
      let ctrlX = (x1 + x2) / 2 + random(-curvatureControl, curvatureControl); // ✅ use real control
      let ctrlY = (y1 + y2) / 2 + random(-curvatureControl, curvatureControl);
      higherResCanvas.bezier(x1, y1, ctrlX, ctrlY, ctrlX, ctrlY, x2, y2);
    }
  }
}

// Function to draw strokes without background for export
function drawStrokesWithoutBackground() {
  if (!img) return;

  let offsetX = (width - img.width) / 2;
  let offsetY = (height - img.height) / 2;

  let minLen = parseInt(minSlider.value);
  let maxLen = parseInt(maxSlider.value);
  let density = parseInt(densitySlider.value) / 100;
  let angleControl = parseFloat(angleSlider.value);
  let curvatureControl = parseFloat(curvatureSlider.value);

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
      let ctrlX = (x1 + x2) / 2 + random(-curvatureControl, curvatureControl);
      let ctrlY = (y1 + y2) / 2 + random(-curvatureControl, curvatureControl);
      bezier(x1, y1, ctrlX, ctrlY, ctrlX, ctrlY, x2, y2);
    }
  }
}
