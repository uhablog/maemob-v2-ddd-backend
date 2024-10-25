/**
 * 本日日付をyyyy-mm-dd形式で取得
 * @returns yyyy-mm-dd形式
 */
export const getToday = (): string => {
  const today = new Date();
  today.setDate(today.getDate()); // 1日を加える

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので+1
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;

};
/**
 * 明日日付をyyyy-mm-dd形式で取得
 * @returns yyyy-mm-dd形式
 */
export const getTomorrowDate = (): string => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // 1日を加える

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので+1
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;

};