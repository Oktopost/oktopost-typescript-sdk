import { parseRetryAfter } from '../../../src/http/retry-after.js';

describe('parseRetryAfter', () => {
  const now = Date.parse('2026-11-25T12:00:00Z');

  it.each([
    ['30', 30],
    [' 7 ', 7],
    ['Wed, 25 Nov 2026 12:00:42 GMT', 42],
    ['Wed, 25 Nov 2026 11:59:00 GMT', 0],
    ['Wed, 25 Xyz 2026 12:00:42 GMT', undefined],
    ['soon', undefined],
    ['1.5', undefined],
    ['-1', undefined],
    ['', undefined],
    [null, undefined],
  ])('reads %j as %j seconds', (header, expected) => {
    expect(parseRetryAfter(header, now)).toBe(expected);
  });
});
