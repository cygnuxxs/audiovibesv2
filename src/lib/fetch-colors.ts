import { Vibrant } from "node-vibrant/node";
/**
 * Extracts the overall tone (average color) from an image URL.
 * Useful for blurred backgrounds or hover effects (like YouTube thumbnails).
 */
export async function getAverageColor(
  imageUrl: string
): Promise<{ color1: string; color2: string }> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    return {
      color1: palette.Muted?.hex as string,
      color2: palette.Vibrant?.hex as string,
    };
  } catch (err) {
    console.error("Error extracting average color:", err);
    throw err;
  }
}
