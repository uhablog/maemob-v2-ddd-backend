export const isPositiveInteger = (value: string): boolean => {
  const num = Number(value);
  return /^[1-9]\d*$/.test(value) && Number.isInteger(num);
}