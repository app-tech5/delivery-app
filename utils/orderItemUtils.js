export const toOrderAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const getOrderItemExtrasTotal = (extras = []) =>
  extras.reduce(
    (sum, extra) => sum + toOrderAmount(extra.price) * (toOrderAmount(extra.quantity) || 1),
    0
  );

export const getOrderItemVariantsTotal = (variants = []) =>
  variants.reduce(
    (sum, variant) => sum + toOrderAmount(variant.extra ?? variant.price),
    0
  );

export const getOrderItemLineTotal = (item) => {
  const storedTotal = toOrderAmount(item?.total);
  if (storedTotal > 0) {
    return storedTotal;
  }

  const quantity = toOrderAmount(item?.quantity) || 1;
  const unitPrice = toOrderAmount(item?.price);
  return (
    unitPrice * quantity +
    getOrderItemExtrasTotal(item?.extras) +
    getOrderItemVariantsTotal(item?.variants)
  );
};

export const getOrderItemUnitPrice = (item) => {
  const unitPrice = toOrderAmount(item?.price);
  if (unitPrice > 0) {
    return unitPrice;
  }

  const quantity = toOrderAmount(item?.quantity) || 1;
  const lineTotal = getOrderItemLineTotal(item);
  if (lineTotal > 0 && quantity > 0) {
    return lineTotal / quantity;
  }

  return 0;
};

export const getOrderItemVariantAmount = (variant) =>
  toOrderAmount(variant?.extra ?? variant?.price);

export const getOrderItemExtraAmount = (extra) =>
  toOrderAmount(extra?.price) * (toOrderAmount(extra?.quantity) || 1);
