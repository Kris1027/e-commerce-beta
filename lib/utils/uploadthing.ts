/**
 * Extract file key from UploadThing URL
 * URL format: https://utfs.io/f/{fileKey}
 */
export function extractFileKey(url: string): string | null {
  try {
    const regex = /https:\/\/utfs\.io\/f\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extract multiple file keys from URLs
 */
export function extractFileKeys(urls: string[]): string[] {
  return urls
    .map(url => extractFileKey(url))
    .filter((key): key is string => key !== null);
}