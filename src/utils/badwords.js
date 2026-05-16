const BAD_WORDS = [
  "abuse", "abused", "bastard", "idiot", "stupid", "fool", "bloody",
  "damn", "shit", "fuck", "bitch", "asshole", "crap", "hell", "sex",
  "rape", "kill", "murder", "ugly", "hate", "harass", "loser"
];

export function containsBadWords(text) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some(word => lower.includes(word));
}
