/**
 * Normalize delivery addresses for display.
 * Handles object shapes and scrubbed demo strings like "23 undefined, 75029 Paris".
 */
export function formatDeliveryAddress(address, fallback = '') {
  if (address == null || address === '') {
    return fallback;
  }

  if (typeof address === 'object') {
    const street = [
      address.number,
      address.streetNumber,
      address.street,
      address.streetName,
      address.line1,
      address.address,
    ]
      .filter((part) => part != null && String(part).trim() && String(part) !== 'undefined')
      .join(' ')
      .trim();

    const cityLine = [
      address.zip || address.postalCode || address.zipCode,
      address.city,
    ]
      .filter((part) => part != null && String(part).trim() && String(part) !== 'undefined')
      .join(' ')
      .trim();

    const formatted = [street, cityLine].filter(Boolean).join(', ');
    return formatted || fallback;
  }

  const text = String(address)
    .replace(/\bundefined\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .trim()
    .replace(/^,\s*|,\s*$/g, '');

  return text || fallback;
}
