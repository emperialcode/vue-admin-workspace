import { describe, expect, it } from 'vitest';
import { csvEscape, money, toCSV, validateInvoice } from './records';
describe('invoice helpers',()=>{
 it('formats currency',()=>expect(money(1200)).toContain('1,200'));
 it('requires client',()=>expect(validateInvoice('','Service','10')).toMatch(/client/i));
 it('requires positive amount',()=>expect(validateInvoice('A','Service','0')).toMatch(/amount/i));
 it('accepts valid entry',()=>expect(validateInvoice('A','Service','25.50')).toBeNull());
 it('escapes CSV quotes',()=>expect(csvEscape('A "quoted" name')).toBe('"A ""quoted"" name"'));
 it('generates headers',()=>expect(toCSV([])).toContain('Client,Service'));
});
