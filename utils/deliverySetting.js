/**
 * Coût livraison côté driver : formule distance uniquement.
 * Sans promos client (FREE, seuil), sans minFee/maxFee, sans maxDeliveryDistance.
 */
export function calculateDriverDeliveryFeeFromSetting(
  setting,
  distanceKm = null,
  deliveryType = 'delivery',
) {
  if (deliveryType === 'pickup') {
    return 0;
  }

  if (!setting || setting.isDeliveryEnabled === false) {
    return 0;
  }

  const { deliveryFeeType, fixedDeliveryFee, dynamicDeliveryFee } = setting;

  if (['DYNAMIC', 'RESTAURANT_DEFINED', 'FREE'].includes(deliveryFeeType)) {
    if (distanceKm == null) {
      return 0;
    }

    const dyn = dynamicDeliveryFee || {};
    const baseFee = Number(dyn.baseFee);
    const perKmFee = Number(dyn.perKmFee);

    if (Number.isFinite(baseFee) && Number.isFinite(perKmFee)) {
      return Number((baseFee + distanceKm * perKmFee).toFixed(2));
    }

    const fixed = Number(fixedDeliveryFee);
    return Number.isFinite(fixed) ? Number(fixed.toFixed(2)) : 0;
  }

  const fixed = Number(fixedDeliveryFee);
  return Number.isFinite(fixed) ? Number(fixed.toFixed(2)) : 0;
}
