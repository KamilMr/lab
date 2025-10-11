/**
 * Creates a canvas element containing a colored circle with a white arrow icon.
 * The arrow is rendered as a downward-pointing chevron (stem with V-shape) and can be rotated.
 * Useful for chart indicators, map markers, or directional UI elements.
 * 
 * @param {string} color - The fill color for the circle background (CSS color value, e.g., '#FF5733', 'rgb(255,87,51)')
 * @param {number} [rotation=0] - Rotation angle in degrees (0 = arrow pointing down, 90 = right, 180 = up, 270 = left)
 * @param {number} [scale=1.2] - Scale factor for the entire icon (1.0 = base size of 30px, 1.2 = 36px)
 * 
 * @returns {HTMLCanvasElement} Canvas element containing the rendered arrow icon
 * 
 * @example
 * // Create a red downward arrow
 * const downArrow = createArrowCanvas('#FF0000');
 * 
 * @example
 * // Create a green upward arrow (rotated 180 degrees)
 * const upArrow = createArrowCanvas('#00FF00', 180);
 * 
 * @example
 * // Create a blue right-pointing arrow at 1.5x scale
 * const largeRightArrow = createArrowCanvas('#0000FF', 90, 1.5);
 */
const createArrowCanvas = (color, rotation = 0, scale = 1.2) => {
  // Create canvas element
  const canvas = document.createElement('canvas');
  
  // Calculate final size based on scale factor (base size: 30px)
  const size = 30 * scale;
  canvas.width = size;
  canvas.height = size;
  
  // Get 2D rendering context
  const ctx = canvas.getContext('2d');

  // Calculate center point for circle and arrow positioning
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Circle radius with small padding to prevent edge clipping
  const circleRadius = size / 2 - scale;

  // Draw filled circle background with specified color
  ctx.beginPath();
  ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  // Draw white circle outline (2px stroke)
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Apply rotation transformation around canvas center
  // Note: Translate to center, rotate, then translate back to maintain center-point rotation
  ctx.translate(size / 2, size / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-size / 2, -size / 2);

  // Configure arrow stroke style
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = 'round'; // Rounded line endings for smoother appearance
  ctx.lineJoin = 'round'; // Rounded corners where lines meet

  // Draw vertical arrow stem (top to middle)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 6 * scale); // Start 6 units above center
  ctx.lineTo(centerX, centerY + 2 * scale); // End 2 units below center
  ctx.stroke();

  // Draw chevron tip (V-shaped arrowhead)
  // Creates a V shape pointing downward at the bottom of the stem
  ctx.beginPath();
  ctx.moveTo(centerX - 4 * scale, centerY + 2 * scale); // Left point of V
  ctx.lineTo(centerX, centerY + 6 * scale); // Bottom point of V
  ctx.lineTo(centerX + 4 * scale, centerY + 2 * scale); // Right point of V
  ctx.stroke();

  return canvas;
};

export default createArrowCanvas;
