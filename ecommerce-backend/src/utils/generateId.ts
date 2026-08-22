import crypto from 'crypto';

export const generateOrderId = (): string => {
  // A non-sequential, 8 character alphanumeric string, e.g., 'AB39K2M9'
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};
