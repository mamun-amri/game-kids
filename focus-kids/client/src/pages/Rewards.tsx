import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toasts';
import { Modal } from '../components/Modal';
import { DEFAULT_AVATARS, defaultAvatar, BACKGROUNDS } from '../lib/catalog';
import { REWARDS, openMysteryBox as openBoxLogic } from '../lib/rewards';

export function Rewards() {
  const { currentChild, openMysteryBox, updateProfile } = useApp();
  const { toast } = useToast();
  const [prize, setPrize] = useState<string | null>(null);

  if (!currentChild) return null;
  const owned = new Set(currentChild.rewards);
  const state = currentChild;

  const openBox = () => {
    const { reward } = openMysteryBox();
    if (!reward) {
      toast('📭', 'Tidak ada kotak misteri tersisa!');
      return;
    }
    setPrize(reward.name);
    toast(reward.icon, `Dapat: ${reward.name}!`);
  };

  const applyAvatar = (avatarId: string) => {
    updateProfile({ avatarId });
    toast(defaultAvatar(avatarId).emoji, 'Avatar berubah!');
  };

  const applyBackground = (bgId: string) => {
    updateProfile({ backgroundId: bgId });
    const bg = BACKGROUNDS.find((b) => b.id === bgId);
    toast(bg?.emoji ?? '🎨', `Background: ${bg?.name}`);
  };

  const avatars = [
    ...DEFAULT_AVATARS.map((a) => ({ code: a.id, icon: a.emoji, name: a.name, type: 'avatar' })),
    ...REWARDS.filter((r) => r.type === 'avatar').map((r) => ({ code: r.code, icon: r.icon, name: r.name, type: 'avatar' })),
  ];
  const backgrounds = [
    ...BACKGROUNDS.filter((b) => b.id === 'bg_default' || b.id === 'bg_sky' || b.id === 'bg_forest' || b.id === 'bg_sunset').map((b) => ({
      code: b.id,
      icon: b.emoji,
      name: b.name,
      type: 'background',
    })),
    ...REWARDS.filter((r) => r.type === 'background').map((r) => ({ code: r.code, icon: r.icon, name: r.name, type: 'background' })),
  ];
  const worlds = REWARDS.filter((r) => r.type === 'world');

  return (
    <div>
      <h1 className="h1">🎁 Hadiah</h1>

      <div className="card mb-16">
        <div className="between wrap">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>🎁 Kotak Misteri</div>
            <div className="muted" style={{ fontSize: 14 }}>
              Selesaikan Daily Challenge atau kumpulkan bintang untuk dapat kotak misteri.
            </div>
          </div>
          <div className="row">
            <span className="chip">🎁 x{state.mysteryBoxes}</span>
            <button className="btn orange" disabled={state.mysteryBoxes <= 0} onClick={openBox}>
              🎲 Buka
            </button>
          </div>
        </div>
      </div>

      <div className="section-title">🧑‍🎤 Avatar</div>
      <div className="avatar-grid mb-16">
        {avatars.map((a) => {
          const isDefault = DEFAULT_AVATARS.some((d) => d.id === a.code);
          const isOwned = isDefault || owned.has(a.code);
          const active = state.profile.avatarId === a.code;
          return (
            <button
              key={a.code}
              className={`avatar-option ${active ? 'selected' : ''}`}
              style={{ width: 74, height: 74, fontSize: 38, position: 'relative' }}
              disabled={!isOwned}
              onClick={() => applyAvatar(a.code)}
              title={a.name}
            >
              {a.icon}
              {!isOwned && <span style={{ position: 'absolute', fontSize: 16 }}>🔒</span>}
            </button>
          );
        })}
      </div>

      <div className="section-title">🖼️ Background</div>
      <div className="avatar-grid mb-16">
        {backgrounds.map((b) => {
          const isDefault = ['bg_default', 'bg_sky', 'bg_forest', 'bg_sunset'].includes(b.code);
          const isOwned = isDefault || owned.has(b.code);
          const active = state.profile.backgroundId === b.code;
          return (
            <button
              key={b.code}
              className={`avatar-option ${active ? 'selected' : ''}`}
              style={{ width: 74, height: 74, fontSize: 38, position: 'relative' }}
              disabled={!isOwned}
              onClick={() => applyBackground(b.code)}
              title={b.name}
            >
              {b.icon}
              {!isOwned && <span style={{ position: 'absolute', fontSize: 16 }}>🔒</span>}
            </button>
          );
        })}
      </div>

      <div className="section-title">🌍 Dunia</div>
      <div className="game-grid">
        {worlds.map((w) => {
          const got = owned.has(w.code);
          return (
            <div className={`reward-tile ${got ? '' : 'unowned'}`} key={w.code}>
              <div className="r-icon">{w.icon}</div>
              <div style={{ fontWeight: 800 }}>{w.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {w.description}
              </div>
              {got ? <div className="success-text mt-8">Dibuka ✓</div> : <div className="muted mt-8">🔒 Terkunci</div>}
            </div>
          );
        })}
      </div>

      {prize && (
        <Modal onClose={() => setPrize(null)}>
          <div className="big-emoji">🎉</div>
          <h2 className="center">Kamu dapat:</h2>
          <div className="center" style={{ fontSize: 64 }}>{'🎁'}</div>
          <p className="center" style={{ fontWeight: 900, fontSize: 20 }}>
            {prize}
          </p>
          <button className="btn" style={{ width: '100%' }} onClick={() => setPrize(null)}>
            Senangnya! 🎉
          </button>
        </Modal>
      )}
    </div>
  );
}
