import Decimal from 'decimal.js';
import { decimal, roundCrypto, roundNgn, roundRate, toNumber } from './money';

describe('money', () => {
  it('adds 0.1 and 0.2 exactly', () => {
    expect(decimal('0.1').plus('0.2').toString()).toBe('0.3');
  });

  it('leaves the global decimal.js settings alone', () => {
    expect(Decimal.precision).toBe(20);
  });

  it('rounds NGN to 2 places, dropping fractions of a kobo', () => {
    expect(roundNgn('1.005').toFixed(2)).toBe('1.00');
    expect(roundNgn('1.009').toFixed(2)).toBe('1.00');
    expect(roundNgn('1.01').toFixed(2)).toBe('1.01');
  });

  it('rounds rates to 6 places, halfway up', () => {
    expect(roundRate('1.0000005').toFixed(6)).toBe('1.000001');
    expect(roundRate('1.0000004').toFixed(6)).toBe('1.000000');
  });

  it('rounds crypto to 8 places, dropping the rest', () => {
    expect(roundCrypto('0.123456785').toFixed(8)).toBe('0.12345678');
    expect(roundCrypto('0.123456789').toFixed(8)).toBe('0.12345678');
  });

  it('handles the largest column values exactly', () => {
    expect(roundNgn('999999999999999999.999').toFixed(2)).toBe(
      '999999999999999999.99',
    );
    expect(roundCrypto('99999999999999999999.999999999').toFixed(8)).toBe(
      '99999999999999999999.99999999',
    );
    expect(decimal('99999999999999999999.99999999').times(2).toString()).toBe(
      '199999999999999999999.99999998',
    );
  });

  it('converts to a number for responses', () => {
    expect(toNumber(roundNgn('1234.5'))).toBe(1234.5);
    expect(toNumber('0')).toBe(0);
  });
});
