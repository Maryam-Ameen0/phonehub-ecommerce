// The backend returns image paths like "/uploads/xyz.jpg" (relative to itself).
// The frontend runs on a different port in dev, so we need to point at the
// backend's actual origin to load the image.
import { API_ORIGIN } from '../config';

export function resolveImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path; // already a full URL
    return `${API_ORIGIN}${path}`;
}
