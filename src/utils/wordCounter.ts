export const countWords = (text: string): number => {
  if (!text || text.trim() === '') return 0;

  // Remove extra whitespace and split by spaces
  const words = text.trim().split(/\s+/);
  return words.length;
};

export const isOverWordLimit = (text: string, limit: number = 200): boolean => {
  return countWords(text) > limit;
};

export const getWordCountStatus = (count: number, limit: number = 200): {
  color: string;
  isOverLimit: boolean;
} => {
  const isOverLimit = count > limit;
  const percentage = (count / limit) * 100;

  let color = '#4CAF50'; // Green
  if (percentage >= 90 && percentage < 100) {
    color = '#FF9800'; // Orange
  } else if (isOverLimit) {
    color = '#F44336'; // Red
  }

  return { color, isOverLimit };
};
