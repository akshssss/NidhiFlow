/**
 * Indian currency & numbers formatting utilities
 */

/** Format paise integer into human readable INR string (e.g. ₹5.00 Cr, ₹12.50 Lakh, ₹85,000) */
export function formatINR(paise: number | bigint | string | null | undefined): string {
  if (paise === null || paise === undefined) return '₹0';
  const amount = Number(paise) / 100;
  return formatRupees(amount);
}

/** Format raw rupees into human readable INR string */
export function formatRupees(rupees: number | null | undefined): string {
  if (!rupees || isNaN(rupees)) return '₹0';
  
  if (rupees >= 10000000) {
    const cr = rupees / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    const lk = rupees / 100000;
    return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(2)} L`;
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}k`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/** Format number into Indian comma system (e.g. 12,34,567) */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}

/** Format percentage */
export function formatGrowth(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return '0%';
  const prefix = rate > 0 ? '+' : '';
  return `${prefix}${rate}%`;
}

/** Format relative or short date */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
