let img;
let pixelData = [];
let minSlider, maxSlider, densitySlider;
let canvas;
const MARGIN = 40;

function setup() {
  canvas = createCanvas(windowWidth - MARGIN * 2, windowHeight - MARGIN * 2);
  canvas.position(MARGIN, MARGIN);
  noLoop();

  minSlider = document.getElementById('minLength');
  maxSlider = document.getElementById('maxLength');
  densitySlider = document.getElementById('density');

  minSlider.addEventListener('input', drawStrokes);
  maxSlider.addEventListener('input', drawStrokes);
  densitySlider.addEventListener('input', drawStrokes);

  document.getElementById('imgInput').addEventListener('change', handleImageUpload);
  document.getElementById('exportBtn').addEventListener('click', () => saveCanvas('myCanvas', 'png'));
}

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
