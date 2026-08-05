import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../lib/achievements';

export function Achievements() {
  const { currentChild } = useApp();
  if (!currentChild) return null;

  const unlocked = new Set(currentChild.achievements);

  return (
    <div>
      <h1 className="h1">🏅 Lencana</h1>
      <p className="hero-sub" style={{ textAlign: 'left', margin: '0 0 18px' }}>
        Kamu sudah mengumpulkan <b>{unlocked.size}</b> dari {ACHIEVEMENTS.length} lencana!
      </p>

      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.code);
          return (
            <div className={`ach-card ${got ? '' : 'locked'}`} key={a.code}>
              <div className="a-icon">{a.icon}</div>
              <div className="a-name">{a.name}</div>
              <div className="a-desc">{a.description}</div>
              {got && <div className="success-text mt-8">Diraih ✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
