/**
 * LabelPlugin - Custom Chart.js plugin for vertical zone labeling
 * 
 * Purpose:
 * Places a vertical rotated label to the left of the Y-axis, centered within
 * a specified zone (e.g., "Critical" zone). The label is drawn only if there
 * is sufficient vertical space to accommodate the rotated text.
 * 
 * Plugin ID: 'labelPlugin'
 * 
 * Hook: beforeDatasetsDraw
 * Executes before datasets are rendered, allowing the label to appear behind chart elements.
 * 
 * Configuration Options (passed via plugins.labelPlugin):
 * @param {number} criticalMin - Bottom Y-value of the zone to label (required)
 * @param {number} criticalMax - Top Y-value of the zone to label (required)
 * @param {string} label - Text to display (defaults to 'Custom Label')
 * @param {string} color - Text color in CSS format (defaults to 'red')
 * @param {number} fontSize - Font size in pixels (defaults to 18)
 * 
 * Behavior:
 * - Calculates the pixel height of the zone defined by criticalMin/criticalMax
 * - Measures the text width to ensure it fits when rotated 270 degrees
 * - Skips rendering if zone height is insufficient (< text width + 10px padding)
 * - Positions the label to the left of the Y-axis, centered vertically within the zone
 * - Rotates text 270 degrees (vertical, reading from bottom to top)
 * 
 * Coordinate System:
 * - Rotation: 270 degrees (Math.PI / 180 * 270)
 * - After rotation: negative Y canvas coordinate maps to positive Y screen position
 * - X position: 45px left of the x-axis start (_startPixel - 45)
 * - Y position: Centered between pixelMin and pixelMax, negated due to rotation
 * 
 * Integration:
 * Must be registered with Chart.js:
 * ChartJS.register(LabelPlugin)
 * 
 * @example
 * // Chart configuration
 * options: {
 *   plugins: {
 *     labelPlugin: {
 *       criticalMin: 80,
 *       criticalMax: 100,
 *       label: 'Critical',
 *       color: '#ff0000',
 *       fontSize: 18
 *     }
 *   }
 * }
 */
const LabelPlugin = {
  id: 'labelPlugin',
  
  /**
   * beforeDatasetsDraw hook - Draws the vertical label before datasets render
   * 
   * @param {Chart} chart - Chart.js chart instance with ctx, scales, and options
   * @param {Object} args - Hook arguments (unused in this implementation)
   * @param {Object} options - Plugin configuration object from chart options
   * @param {number} options.criticalMin - Bottom Y-value of labeled zone
   * @param {number} options.criticalMax - Top Y-value of labeled zone
   * @param {string} [options.label='Custom Label'] - Text to display
   * @param {string} [options.color='red'] - Text color
   * @param {number} [options.fontSize=18] - Font size in pixels
   * 
   * @returns {void} - Modifies canvas context directly, no return value
   */
  beforeDatasetsDraw: (chart, args, options) => {
    const {
      ctx,
      scales: {x, y},
    } = chart;

    // Access plugin options passed from component
    const {criticalMin, criticalMax, label, color, fontSize} = options;

    // Early exit: no zone defined
    if (!criticalMin || !criticalMax) return;

    // Early exit: zero-height zone (threshold equals max)
    if (criticalMin === criticalMax) return;

    // Calculate pixel height of the critical zone
    // pixelMin is bottom (higher value), pixelMax is top (lower value)
    const pixelMin = y.getPixelForValue(criticalMin);
    const pixelMax = y.getPixelForValue(criticalMax);
    const zoneHeight = Math.abs(pixelMin - pixelMax);

    // Save canvas state before transformations
    ctx.save();

    // Configure font early to measure text dimensions
    const fontOptions = {
      size: fontSize || 18,
      weight: 'bold',
      family: chart.options.font?.family || ChartJS.defaults.font.family,
    };
    const font = toFont(fontOptions); // Convert to Chart.js font object
    ctx.font = font.string;

    // Measure text width (becomes effective height after 270° rotation)
    const textWidth = ctx.measureText(label || 'Custom Label').width;
    const minRequiredSpace = textWidth + 10; // Add padding for readability

    // Early exit: insufficient vertical space for rotated text
    if (zoneHeight < minRequiredSpace) {
      ctx.restore();
      return;
    }

    // Apply 270-degree rotation for vertical text (reading bottom to top)
    const angle = Math.PI / 180;
    ctx.translate(0, 0); // Set rotation origin at canvas top-left
    ctx.rotate(270 * angle);

    // Configure text rendering properties
    ctx.fillStyle = color || 'red';
    ctx.font = font.string; // Reapply font after rotation
    ctx.textAlign = 'center';
    
    // Draw text centered within the zone
    // Y-coordinate (after rotation): average of min/max pixels, negated for rotation coordinate system
    // X-coordinate (after rotation): 45px left of x-axis start position
    ctx.fillText(
      label || 'Custom Label',
      (y.getPixelForValue(criticalMin) + y.getPixelForValue(criticalMax)) / -2,
      x._startPixel - 45,
    );

    // Restore canvas state (removes rotation and resets properties)
    ctx.restore();
  },
};
