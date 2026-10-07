import Decimal from 'decimal.js';

// Products of two Decimal(28,8) values need about twice their 28 significant digits.
const MoneyDecimal = Decimal.clone({
  precision: 64,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -64,
  toExpPos: 64,
});

const RATE_ROUNDING = Decimal.ROUND_HALF_UP;
// Payouts and on-chain amounts never exceed what the rate implies.
const NGN_ROUNDING = Decimal.ROUND_DOWN;
const CRYPTO_ROUNDING = Decimal.ROUND_DOWN;

export function decimal(value: Decimal.Value): Decimal {
  return new MoneyDecimal(value);
}

export function roundNgn(value: Decimal.Value): Decimal {
  return decimal(value).toDecimalPlaces(2, NGN_ROUNDING);
}

export function roundRate(value: Decimal.Value): Decimal {
  return decimal(value).toDecimalPlaces(6, RATE_ROUNDING);
}

export function roundCrypto(value: Decimal.Value): Decimal {
  return decimal(value).toDecimalPlaces(8, CRYPTO_ROUNDING);
}

export function toNumber(value: Decimal.Value): number {
  return decimal(value).toNumber();
}
