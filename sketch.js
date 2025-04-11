let img;
let imgWidth, imgHeight;
const margin = 40; // 20px margin on all sides (20px * 2 = 40px total)
let pixelData = [];
let numStrokesToDraw = 0; // Default number of strokes to draw
let minLineLengthSlider, maxLineLengthSlider; // Sliders for min and max stroke length

function setup() {
  // Set the canvas size, accounting for the margin
  createCanvas(windowWidth - margin * 2, windowHeight - margin * 2);
  clear(); // Clear the canvas with transparency

  // Create the file input
  let fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);  // Position the file input on the screen
  
  // Create export button
  let exportButton = createButton('Export Canvas as PNG');
  exportButton.position(10, 40); // Position it below the file input
  exportButton.mousePressed(exportCanvas); // Trigger the export function when clicked

  // Create a min and max length slider for controlling the line length
  minLineLengthSlider = createSlider(5, 30, 10); // Min length = 5, Max length = 30, Default = 10
  minLineLengthSlider.position(10, 70); // Position it on the screen
  minLineLengthSlider.style('width', '200px');
  
  maxLineLengthSlider = createSlider(30, 200, 50); // Min length = 30, Max length = 100, Default = 50
  maxLineLengthSlider.position(10, 100); // Position it below the min slider
  maxLineLengthSlider.style('width', '200px');
  
  // Add event listeners to sliders to trigger update when values change
  minLineLengthSlider.input(updateCanvas);
  maxLineLengthSlider.input(updateCanvas);
}

// Handle the file once it’s uploaded
function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      // Once the image is loaded, calculate the correct size while maintaining aspect ratio
      let aspectRatio = img.width / img.height;

      // Ensure image fits within canvas (accounting for margin)
      let availableWidth = width - margin * 2;
      let availableHeight = height - margin * 2;

      // Resize image to fit the canvas, maintaining aspect ratio
      if (img.width > img.height) {
        imgWidth = min(availableWidth, img.width);
        imgHeight = imgWidth / aspectRatio;
      } else {
        imgHeight = min(availableHeight, img.height);
        imgWidth = imgHeight * aspectRatio;
      }

      // If the image exceeds the available space, we scale it down accordingly
      if (imgWidth > availableWidth) {
        imgWidth = availableWidth;
        imgHeight = imgWidth / aspectRatio;
      }
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // Get pixel data from the image (for defining the image bounds)
      img.loadPixels();
      pixelData = [];
      
      // Store pixel information (position and color)
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          let index = (x + y * img.width) * 4; // Calculate pixel index in the pixel array
          let r = img.pixels[index];
          let g = img.pixels[index + 1];
          let b = img.pixels[index + 2];
          let a = img.pixels[index + 3];
          
          if (a > 0) { // Only store non-transparent pixels
            pixelData.push({x, y, r, g, b});
          }
        }
      }

      // Set the number of strokes to 90% of the total pixels
      numStrokesToDraw = int(0.9 * pixelData.length);

      // Initial drawing of the strokes
      updateCanvas();
    });
  } else {
    console.log("Not an image file!");
  }
}

// Function to update the canvas whenever a slider value changes
function updateCanvas() {
  // Clear the canvas before redrawing the strokes
  clear();
  drawRandomStrokes();
}

function drawRandomStrokes() {
  // Calculate the image's center position on the canvas
  let offsetX = (width - imgWidth) / 2;  // x offset to center image
  let offsetY = (height - imgHeight) / 2;  // y offset to center image

  // Get the min and max line length from the sliders
  let minLineLength = minLineLengthSlider.value();
  let maxLineLength = maxLineLengthSlider.value();

  // Draw the specified percentage of strokes (90% of the pixels)
  for (let i = 0; i < numStrokesToDraw; i++) {
    // Pick a random pixel from the pixelData array to get the position
    let randomPixel = random(pixelData);

    // Get the original (x, y) position of the pixel
    let imgX = randomPixel.x;
    let imgY = randomPixel.y;

    // Get the pixel color and convert it to Hue, Saturation, Lightness (HSL)
    let c = color(randomPixel.r, randomPixel.g, randomPixel.b);
    let h = hue(c); // Extract the hue (0 to 360 degrees)

    // Map the hue value to an angle (we could adjust this for better distribution)
    let baseAngle = map(h, 0, 360, 0, TWO_PI); // Map hue (0-360) to angle (0 to 2*PI)

    // Add randomness to the angle (a slight variation around the base angle)
    let angleVariation = random(-PI / 6, PI / 6); // Random angle variation (-30° to +30°)
    let angle = baseAngle + angleVariation;

    // Randomize the length of the stroke within the range of the sliders
    let strokeLength = random(minLineLength, maxLineLength); // Random length based on slider values

    // Calculate the start and end points of the stroke based on random length and mapped angle
    // The pixel location will be the midpoint of the stroke
    let xStart = imgX + offsetX - cos(angle) * strokeLength / 2; // Offset to make the pixel the center
    let yStart = imgY + offsetY - sin(angle) * strokeLength / 2; // Offset to make the pixel the center

    let xEnd = imgX + offsetX + cos(angle) * strokeLength / 2; // Endpoint on the other side of the midpoint
    let yEnd = imgY + offsetY + sin(angle) * strokeLength / 2; // Endpoint on the other side of the midpoint

    // Randomize stroke color to match the pixel
    let strokeColor = color(randomPixel.r, randomPixel.g, randomPixel.b);

    // Determine whether the stroke should be straight or curved (50/50 chance)
    if (random(1) > 0.5) {
      // Draw a straight line
      stroke(strokeColor);
      line(xStart, yStart, xEnd, yEnd);
    } else {
      // Draw a curved line (Bezier curve) with reduced curvature
      let controlX = random(xStart - 10, xEnd + 10); // Reduced random control point X (-10 to +10)
      let controlY = random(yStart - 10, yEnd + 10); // Reduced random control point Y (-10 to +10)

      stroke(strokeColor);
      noFill();
      bezier(xStart, yStart, controlX, controlY, controlX, controlY, xEnd, yEnd);
    }
  }
}

// Function to export the canvas as a PNG
function exportCanvas() {
  // Save the canvas as a PNG image
  saveCanvas('myCanvas', 'png');
}
