import { scoreColor } from '../utils/compatibility'

export default function CompatibilityBadge({ compatibility, large = false }) {
  const score = compatibility?.score
  if (score == null) return null

  return (
    <div style={{ textAlign: 'right', lineHeight: 1, flexShrink: 0 }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: large ? '44px' : '22px',
        letterSpacing: '-0.02em',
        color: scoreColor(score)
      }}>
        {score}<span style={{ fontSize: large ? '22px' : '12px' }}>%</span>
      </div>
      <div style={{
        fontSize: large ? '11px' : '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        marginTop: large ? '8px' : '3px'
      }}>
        Match
      </div>
    </div>
  )
}
