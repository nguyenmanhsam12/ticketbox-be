export enum PAYMENT_METHOD {
  CARD = 'card',
  EWALLET = 'ewallet',
  BANK_TRANSFER = 'bank_transfer',
  QR = 'qr',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
