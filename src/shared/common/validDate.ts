export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false; // yyyy-mm-dd形式でない場合はfalse
  }

  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) && // 日付が有効かチェック
    dateString === date.toISOString().split('T')[0] // 日付の正規化確認
  );
};