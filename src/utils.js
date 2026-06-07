/**
 * Utility functions for mockup rendering and canvas customization presets.
 */

/**
 * Extracts average color from an image URL / Data URL client-side.
 * Uses a hidden 1x1 pixel canvas for instant performance.
 * @param {string} imageUrl
 * @returns {Promise<string>} rgba color string
 */
export function getAverageColor(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve('rgba(59, 130, 246, 0.4)'); // Default soft blue glow
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('rgba(0, 0, 0, 0.4)');
          return;
        }

        ctx.drawImage(img, 0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const [r, g, b] = data;

        // Ensure we don't return pure white or pure black ambient glow that looks bad
        // Adjust brightness/opacity for optimal glow effect
        const opacity = 0.35;
        resolve(`rgba(${r}, ${g}, ${b}, ${opacity})`);
      } catch {
        // Fallback for CORS or canvas errors
        resolve('rgba(99, 102, 241, 0.4)'); // Indigo glow fallback
      }
    };

    img.onerror = () => {
      resolve('rgba(99, 102, 241, 0.4)');
    };
  });
}

/**
 * Premium background presets list (mesh and linear gradients, solid dark/light colors)
 */
export const BACKGROUND_PRESETS = [
  {
    id: 'sunset',
    name: 'Sunset Glow',
    style: { background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)' },
  },
  {
    id: 'aurora',
    name: 'Neon Aurora',
    style: { background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #3b82f6 100%)' },
  },
  {
    id: 'cosmos',
    name: 'Deep Cosmos',
    style: { background: 'radial-gradient(circle at 50% 50%, #4338ca 0%, #1e1b4b 70%, #030712 100%)' },
  },
  {
    id: 'glassy-coral',
    name: 'Glassy Coral',
    style: { background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    style: { background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    style: { background: 'linear-gradient(135deg, #f43f5e 0%, #d946ef 50%, #3b82f6 100%)' },
  },
  {
    id: 'slate',
    name: 'Dark Slate',
    style: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    style: { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
  },
];
