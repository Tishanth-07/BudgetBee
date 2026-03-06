/**
 * Formats a given number as Sri Lankan Rupees (LKR).
 * E.g. formatLKR(1500) => "LKR 1,500.00"
 */
export const formatLKR = (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    }).format(amount);
};
