import { config } from '../config';

const API_ORIGIN = String(config.API_BASE_URL).replace(/\/api\/?$/, '');

export function resolveUploadUrl(url) {
  if (!url) return null;
  if (
    url.startsWith('file://') ||
    url.startsWith('content://') ||
    url.startsWith('ph://')
  ) {
    return url;
  }

  const publicPath = url.match(/\/api\/public\/[^?#]+$/)?.[0];
  if (publicPath) return `${API_ORIGIN}${publicPath}`;

  const uploadPath = url.match(/\/api\/uploads\/[^?#]+$/)?.[0];
  if (uploadPath) return `${API_ORIGIN}${uploadPath}`;

  return url;
}
