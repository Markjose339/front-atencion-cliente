const integerFormatter = new Intl.NumberFormat("es-BO");
const decimalFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const safeNumber = (value: number): number =>
  Number.isFinite(value) ? value : 0;

export const formatInteger = (value: number): string =>
  integerFormatter.format(safeNumber(value));

export const formatMinutes = (value: number): string =>
  `${decimalFormatter.format(safeNumber(value))} min`;

export const formatPercent = (value: number): string =>
  `${percentFormatter.format(safeNumber(value))}%`;

export const formatCompactDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
  });
};
