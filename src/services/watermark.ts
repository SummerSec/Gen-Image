export async function applyWatermark(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      // Font size proportional to image width, clamped to readable range
      const fontSize = Math.max(12, Math.round(canvas.width * 0.025));
      const padding = Math.round(fontSize * 0.8);

      const text = 'gen-img.sumsec.me';
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'right';

      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;

      // Background pill
      const bgX = canvas.width - textWidth - padding * 2.5;
      const bgY = canvas.height - fontSize - padding * 2;
      const bgW = textWidth + padding * 2;
      const bgH = fontSize + padding;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      const radius = bgH / 2;
      ctx.moveTo(bgX + radius, bgY);
      ctx.lineTo(bgX + bgW - radius, bgY);
      ctx.arcTo(bgX + bgW, bgY, bgX + bgW, bgY + radius, radius);
      ctx.arcTo(bgX + bgW, bgY + bgH, bgX + bgW - radius, bgY + bgH, radius);
      ctx.arcTo(bgX, bgY + bgH, bgX, bgY + bgH - radius, radius);
      ctx.arcTo(bgX, bgY, bgX + radius, bgY, radius);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(text, canvas.width - padding, canvas.height - padding);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}