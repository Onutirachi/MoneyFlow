import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addMonths, addMonthsToDate, dateInMonth, isValidDate, monthRange } from '../utils/date.js';
import { splitInstallments, sum } from '../utils/money.js';

describe('utils/date', () => {
  it('soma meses atravessando o ano', () => {
    assert.equal(addMonths('2026-11', 3), '2027-02');
    assert.equal(addMonths('2026-01', -1), '2025-12');
  });

  it('limita o dia ao último dia do mês', () => {
    assert.equal(dateInMonth('2026-02', 31), '2026-02-28');
    assert.equal(dateInMonth('2028-02', 31), '2028-02-29');
    assert.equal(addMonthsToDate('2026-01-31', 1), '2026-02-28');
    assert.equal(addMonthsToDate('2026-01-31', 2), '2026-03-31');
  });

  it('gera intervalos de meses e valida datas', () => {
    assert.deepEqual(monthRange('2026-11', '2027-01'), ['2026-11', '2026-12', '2027-01']);
    assert.ok(isValidDate('2026-02-28'));
    assert.ok(!isValidDate('2026-02-30'));
    assert.ok(!isValidDate('2026-13-01'));
  });
});

describe('utils/money', () => {
  it('divide parcelas com soma exata e sobra na 1ª', () => {
    const parts = splitInstallments(100000, 3);
    assert.deepEqual(parts, [33334, 33333, 33333]);
    assert.equal(sum(parts), 100000);
  });
});
