/**
 * Captures a screenshot of the given URL using a client-side approach
 * @param url URL to capture screenshot of
 * @returns The screenshot as a data URL
 */
export const captureScreenshot = async (url: string): Promise<string | null> => {
  try {
    // For demo purposes, we'll create a placeholder image
    // that simulates what a screenshot might look like
    return createPlaceholderScreenshot(url);
  } catch (error) {
    console.error("Error creating screenshot:", error);
    return null;
  }
};

/**
 * Creates a placeholder image for demo purposes
 * @param url The URL that would be captured
 * @returns A data URL for a placeholder image
 */
function createPlaceholderScreenshot(url: string): string {
  // Generate a unique but deterministic color based on the URL
  const urlHash = hashCode(url);
  const hue = Math.abs(urlHash % 360);
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fill background
    ctx.fillStyle = `hsl(${hue}, 70%, 90%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw "browser" top bar
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, 40);
    
    // Draw address bar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 8, canvas.width - 160, 24);
    
    // Draw URL text
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
    ctx.fillText(displayUrl, 100, 26);
    
    // Draw page content placeholder
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 60, canvas.width - 80, canvas.height - 100);
    
    // Draw some "content" lines
    ctx.fillStyle = `hsl(${hue}, 70%, 80%)`;
    for (let i = 0; i < 10; i++) {
      const y = 100 + i * 60;
      const width = 100 + (Math.abs(hashCode(url + i)) % (canvas.width - 240));
      ctx.fillRect(80, y, width, 30);
    }
    
    // Add website name
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    try {
      const domain = new URL(url).hostname;
      ctx.fillText(`Preview of ${domain}`, 80, 80);
    } catch (e) {
      ctx.fillText(`Preview of website`, 80, 80);
    }
    
    // Add demo notice
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.fillText('Demo Mode: Screenshot simulation', 80, canvas.height - 20);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  
  return '';
}

/**
 * Simple string hash function
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}