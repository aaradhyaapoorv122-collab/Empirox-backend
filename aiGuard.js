// /lib/ai/aiGuard.js

/**
 * aiGuard checks if a user is allowed to chat and returns controls like tone and language.
 * 
 * @param {Object} params - Input parameters
 * @param {string} params.userId - User's unique ID
 * @param {string} params.tier - User tier, e.g. "EmpiCraft", "EmpiLab"
 * @param {number} params.age - User's age in years (number)
 * @param {string} params.language - User preferred language code, e.g. "en", "hi"
 * @param {number} params.dailyUsageMinutes - Number of AI chat minutes user has used today
 * @param {boolean} params.voiceAllowed - Whether voice AI is allowed for this user
 * @returns {Object} result - Result object with permission and instructions
 * 
 * Result example:
 * {
 *   allowed: true,
 *   reason: null,
 *   tone: "calm",
 *   language: "hi",
 * }
 * or
 * {
 *   allowed: false,
 *   reason: "Daily time limit exceeded",
 * }
 */

export function aiGuard({ userId, tier, age, language, dailyUsageMinutes, voiceAllowed }) {
  // 1. Check Tier
  const allowedTiers = ["EmpiCraft", "EmpiLab"];
  if (!allowedTiers.includes(tier)) {
    return {
      allowed: false,
      reason: `Tier "${tier}" is not allowed to use AI chat.`,
    };
  }

  // 2. Daily Usage Limit (e.g. max 60 minutes)
  const MAX_DAILY_MINUTES = 60;
  if (dailyUsageMinutes >= MAX_DAILY_MINUTES) {
    return {
      allowed: false,
      reason: "Daily AI chat time limit exceeded.",
    };
  }

  // 3. Age Group & Tone mapping
  let tone = "calm"; // default tone
  if (age >= 8 && age <= 12) tone = "calm"; // simple, friendly
  else if (age >= 13 && age <= 17) tone = "energetic"; // exam focused
  else if (age >= 18 && age <= 25) tone = "motivational"; // structured
  else if (age >= 26) tone = "professional"; // direct, professional

  // 4. Language support (assume app supports these)
  const supportedLanguages = ["en", "hi", "jp", "cn", "ko"]; // Add others as needed
  if (!supportedLanguages.includes(language)) {
    // fallback to English if unsupported
    language = "en";
  }

  // 5. Voice allowed check (if voice AI requested elsewhere)
  if (!voiceAllowed) {
    // For now, we just note, but don't block text chat
  }

  // 6. Additional checks like filtering inappropriate content
  // (This can be done outside or inside AI prompt filter)

  // If all checks pass
  return {
    allowed: true,
    reason: null,
    tone,
    language,
  };
}
