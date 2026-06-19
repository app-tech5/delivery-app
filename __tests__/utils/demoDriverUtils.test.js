import { isDemoDriverAccount, getAccountEmail } from '../../utils/demoDriverUtils';

jest.mock('../../config', () => ({
  config: {
    DEMO_EMAIL: 'driver@demo.com',
  },
}));

describe('demoDriverUtils', () => {
  it('identifies the demo driver account by email', () => {
    expect(isDemoDriverAccount({ email: 'driver@demo.com' }, null)).toBe(true);
    expect(isDemoDriverAccount(null, { userId: { email: 'driver@demo.com' } })).toBe(true);
  });

  it('does not treat other accounts as demo driver', () => {
    expect(isDemoDriverAccount({ email: 'real.driver@example.com' }, null)).toBe(false);
    expect(isDemoDriverAccount(null, { userId: { email: 'real.driver@example.com' } })).toBe(false);
  });

  it('normalizes email casing and whitespace', () => {
    expect(getAccountEmail({ email: ' Driver@Demo.com ' }, null)).toBe('driver@demo.com');
  });
});
