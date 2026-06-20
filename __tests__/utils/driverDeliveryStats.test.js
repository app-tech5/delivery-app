const {
  getOrderDate,
  getDeliveredDeliveries,
  isDeliveredOnDate,
  calculateDriverStatsFromDeliveries,
} = require('../../utils/driverDeliveryStats');
const { isToday } = require('../../utils/dateUtils');

describe('driverDeliveryStats', () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const deliveredCreatedToday = {
    _id: 'order-1',
    status: 'delivered',
    delivery: { type: 'delivery' },
    createdAt: today.toISOString(),
    restaurant: { _id: 'rest-1', latitude: '48.86', longitude: '2.35' },
    user: { location: { latitude: 48.87, longitude: 2.36 } },
  };

  const deliveredCreatedYesterday = {
    _id: 'order-2',
    status: 'delivered',
    delivery: { type: 'delivery' },
    createdAt: yesterday.toISOString(),
  };

  const pickupOrder = {
    _id: 'order-3',
    status: 'delivered',
    delivery: { type: 'pickup' },
    createdAt: today.toISOString(),
  };

  it('uses createdAt as order date', () => {
    expect(getOrderDate(deliveredCreatedToday).toDateString()).toBe(today.toDateString());
  });

  it('counts delivered orders created today', () => {
    const stats = calculateDriverStatsFromDeliveries(
      [deliveredCreatedToday, deliveredCreatedYesterday, pickupOrder],
      4.8
    );

    expect(stats.todayDeliveries).toBe(1);
    expect(stats.completedOrders).toBe(2);
    expect(isDeliveredOnDate(deliveredCreatedToday)).toBe(true);
    expect(isDeliveredOnDate(deliveredCreatedYesterday)).toBe(false);
    expect(getDeliveredDeliveries([deliveredCreatedToday, pickupOrder])).toHaveLength(1);
  });

  it('does not count migrated updatedAt without createdAt today', () => {
    const migratedOnly = {
      _id: 'order-migrated',
      status: 'delivered',
      delivery: { type: 'delivery' },
      createdAt: yesterday.toISOString(),
      updatedAt: today.toISOString(),
    };

    expect(isDeliveredOnDate(migratedOnly)).toBe(false);
    expect(isToday(getOrderDate(migratedOnly))).toBe(false);
  });
});
