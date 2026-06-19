import { config } from '../config';

export const getAccountEmail = (user, driver) => {
  const email = user?.email || driver?.userId?.email || '';
  return email.trim().toLowerCase();
};

export const isDemoDriverAccount = (user, driver) => {
  const demoEmail = config.DEMO_EMAIL?.trim().toLowerCase();
  if (!demoEmail) {
    return false;
  }
  return getAccountEmail(user, driver) === demoEmail;
};
