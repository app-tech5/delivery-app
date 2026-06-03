import React, { createContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { config } from '../config';
import { useDriver } from './DriverContext';

export const OrdersContext = createContext({
  orders: [],
  setOrders: () => {},
  socket: null,
});

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const { driver, hasCompletedOnboarding } = useDriver();

  const userId = useMemo(() => driver?.userId?._id || driver?.userId || null, [driver?.userId]);

  useEffect(() => {
    if (!hasCompletedOnboarding || !userId) return;

    const url = String(config.API_BASE_URL).replace(/\/api\/?$/, '');
    const s = io(url);
    setSocket(s);

    s.on('connect', () => {
      s.emit('joinOrderRoom', String(userId));
    });

    s.on('order-updated', (data) => {
      const nextOrder = data?.order;
      if (!nextOrder?._id) return;
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o._id === nextOrder._id);
        if (idx === -1) return [nextOrder, ...prev];
        const copy = [...prev];
        copy[idx] = nextOrder;
        return copy;
      });
    });

    return () => {
      s.emit('leaveOrderRoom', String(userId));
      s.disconnect();
      setSocket(null);
    };
  }, [hasCompletedOnboarding, userId]);

  return (
    <OrdersContext.Provider value={{ orders, setOrders, socket }}>
      {children}
    </OrdersContext.Provider>
  );
};
