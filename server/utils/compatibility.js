// Roommate compatibility scoring.
//
// Each dimension is scored 0..1 and weighted; the weights sum to 100 so a score
// reads directly as a percentage. Dimensions where either student has left the
// field blank are skipped and their weight is redistributed across the rest —
// an incomplete profile lowers `confidence`, it does not drag the score down.

const WEIGHTS = {
  sleepSchedule: 30,
  studyHabits: 25,
  socialStyle: 20,
  hobbies: 15,
  year: 10
};

const LABELS = {
  sleepSchedule: 'Sleep schedule',
  studyHabits: 'Study habits',
  socialStyle: 'Social style',
  hobbies: 'Shared interests',
  year: 'Year'
};

const SLEEP_PLURAL = { 'early bird': 'early birds', 'night owl': 'night owls' };
const STUDY_ADVERB = { 'quiet studier': 'quietly', 'group studier': 'in groups' };

// Shared hobbies needed for full marks on that dimension
const HOBBY_TARGET = 3;

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

// 'flexible' and 'mixed' sit between the two extremes, so they part-match anything
const scoreEnum = (a, b, neutral, clash) => {
  if (a === b) return 1;
  if (a === neutral || b === neutral) return 0.75;
  return clash;
};

const sleepScore = (a, b) => {
  const score = scoreEnum(a, b, 'flexible', 0);
  if (a === b) {
    return {
      score,
      detail: a === 'flexible'
        ? "You're both flexible about sleep"
        : `You're both ${SLEEP_PLURAL[a] || a}`
    };
  }
  if (score === 0.75) return { score, detail: 'One of you is flexible about sleep' };
  return { score, detail: `${capitalize(a)} vs ${b}` };
};

const studyScore = (a, b) => {
  const score = scoreEnum(a, b, 'flexible', 0);
  if (a === b) {
    return {
      score,
      detail: a === 'flexible'
        ? "You're both flexible about studying"
        : `You both study ${STUDY_ADVERB[a] || a}`
    };
  }
  if (score === 0.75) return { score, detail: 'One of you is flexible about studying' };
  return { score, detail: 'Quiet studying vs group studying' };
};

const socialScore = (a, b) => {
  const score = scoreEnum(a, b, 'mixed', 0.25);
  if (a === b) {
    return { score, detail: a === 'mixed' ? "You're both a mix of both" : `You're both ${a}` };
  }
  if (score === 0.75) return { score, detail: 'One of you is a mix of both' };
  return { score, detail: 'Introverted vs extroverted' };
};

// Case-insensitive overlap, but the viewer's own spelling is what gets displayed
const hobbyScore = (mine, theirs) => {
  const theirSet = new Set(
    theirs.map((hobby) => String(hobby).trim().toLowerCase()).filter(Boolean)
  );

  const shared = [];
  const seen = new Set();
  for (const hobby of mine) {
    const key = String(hobby).trim().toLowerCase();
    if (key && theirSet.has(key) && !seen.has(key)) {
      seen.add(key);
      shared.push(String(hobby).trim());
    }
  }

  return {
    score: Math.min(shared.length / HOBBY_TARGET, 1),
    detail: shared.length ? `Both into ${shared.slice(0, 3).join(', ')}` : 'Nothing in common yet',
    shared
  };
};

const yearScore = (a, b) => {
  const gap = Math.abs(a - b);
  if (gap === 0) return { score: 1, detail: `You're both in year ${a}` };
  const span = `Years ${Math.min(a, b)} and ${Math.max(a, b)}`;
  return { score: gap === 1 ? 0.5 : 0, detail: span };
};

const MAX_WEIGHT = Object.values(WEIGHTS).reduce((sum, weight) => sum + weight, 0);

/**
 * Compare two profiles.
 *
 * Returns `score` as a 0-100 integer, or null when the two profiles share no
 * comparable fields. `confidence` is the fraction of the total weight that was
 * actually comparable, and `breakdown` explains the score dimension by dimension.
 */
function computeCompatibility(mine, theirs) {
  const a = mine || {};
  const b = theirs || {};

  const breakdown = [];
  const add = (key, result) => breakdown.push({
    key,
    label: LABELS[key],
    weight: WEIGHTS[key],
    score: result.score,
    detail: result.detail
  });

  if (a.sleepSchedule && b.sleepSchedule) add('sleepSchedule', sleepScore(a.sleepSchedule, b.sleepSchedule));
  if (a.studyHabits && b.studyHabits) add('studyHabits', studyScore(a.studyHabits, b.studyHabits));
  if (a.socialStyle && b.socialStyle) add('socialStyle', socialScore(a.socialStyle, b.socialStyle));

  let sharedHobbies = [];
  if (a.hobbies?.length && b.hobbies?.length) {
    const result = hobbyScore(a.hobbies, b.hobbies);
    sharedHobbies = result.shared;
    add('hobbies', result);
  }

  if (a.year && b.year) add('year', yearScore(a.year, b.year));

  const scoredWeight = breakdown.reduce((sum, dim) => sum + dim.weight, 0);
  if (!scoredWeight) {
    return { score: null, confidence: 0, sharedHobbies: [], breakdown: [] };
  }

  const earned = breakdown.reduce((sum, dim) => sum + dim.weight * dim.score, 0);

  return {
    score: Math.round((earned / scoredWeight) * 100),
    confidence: Number((scoredWeight / MAX_WEIGHT).toFixed(2)),
    sharedHobbies,
    breakdown
  };
}

module.exports = { computeCompatibility, WEIGHTS };
