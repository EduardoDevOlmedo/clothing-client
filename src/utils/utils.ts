const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatNumberToCurrency = (amount: number) => {
  const numericAmount = Number(amount) || 0;

  return currencyFormatter.format(numericAmount);
};