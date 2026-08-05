import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { defaultAvatar, DEFAULT_AVATARS } from '../lib/catalog';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toasts';

export function Home() {
  const { profiles, selectChild, createProfile, deleteProfile } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATARS[0].id);
  const { toast } = useToast();

  const submit = () => {
    const trimmed = name.trim();
    const ageNum = parseInt(age, 10);
    if (!trimmed) {
      toast('✏️', 'Tuliskan nama dulu ya!');
      return;
    }
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 12) {
      toast('🎂', 'Umur harus 3-12 tahun ya!');
      return;
    }
    const profile = createProfile({ name: trimmed, age: ageNum, avatarId });
    selectChild(profile.id);
    setShowForm(false);
    navigate('/dashboard');
  };

  return (
    <div>
      <h1 className="hero-title">🧠 Focus Kids</h1>
      <p className="hero-sub">
        Game edukasi seru untuk melatih fokus, konsentrasi, dan daya ingat anak!
      </p>

      {profiles.length === 0 ? (
        <div className="card center">
          <div style={{ fontSize: 60 }}>👋</div>
          <h2 style={{ margin: '8px 0 4px' }}>Halo, si kecil!</h2>
          <p className="muted" style={{ margin: '0 0 18px' }}>
            Ayo buat profilmu dulu supaya kita bisa main bersama!
          </p>
          <button className="btn big" onClick={() => setShowForm(true)}>
            🎈 Buat Profil
          </button>
        </div>
      ) : (
        <>
          <div className="profile-cards">
            {profiles.map((p) => (
              <div
                className="profile-card"
                key={p.id}
                onClick={() => {
                  selectChild(p.id);
                  navigate('/dashboard');
                }}
              >
                <button
                  className="p-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus profil ${p.name}?`)) deleteProfile(p.id);
                  }}
                >
                  ✕
                </button>
                <div className="p-avatar">{defaultAvatar(p.avatarId).emoji}</div>
                <div className="p-name">{p.name}</div>
                <div className="p-age">{p.age} tahun</div>
              </div>
            ))}
          </div>
          <div className="center">
            <button className="btn big pink" onClick={() => setShowForm(true)}>
              ➕ Tambah Anak
            </button>
            <div className="mt-16">
              <Link className="btn ghost" to="/parent">
                👨‍👩‍👧 Halaman Orang Tua
              </Link>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2 className="center">Buat Profil Baru</h2>
          <div className="field">
            <label>Nama anak</label>
            <input
              className="input"
              placeholder="Contoh: Aisyah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
            />
          </div>
          <div className="field">
            <label>Umur</label>
            <input
              className="input"
              type="number"
              min={3}
              max={12}
              placeholder="3 - 12 tahun"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Pilih avatar</label>
            <div className="avatar-grid">
              {DEFAULT_AVATARS.map((a) => (
                <button
                  key={a.id}
                  className={`avatar-option ${avatarId === a.id ? 'selected' : ''}`}
                  onClick={() => setAvatarId(a.id)}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>
          <button className="btn big" style={{ width: '100%' }} onClick={submit}>
            🚀 Mulai Bermain
          </button>
        </Modal>
      )}
    </div>
  );
}
