// Score bands. Low scores stay muted rather than red — this is a person, not an error.
export const scoreColor = (score) => {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--accent)'
  if (score >= 40) return 'var(--text)'
  return 'var(--text-muted)'
}
