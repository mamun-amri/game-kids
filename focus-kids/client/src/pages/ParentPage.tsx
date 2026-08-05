import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { useToast } from '../components/Toasts';
import { BarChart } from '../components/Charts';
import { syncAllProfiles } from '../lib/sync';
import { formatSeconds } from '../lib/stats';
import { GAME_NAMES } from '../lib/catalog';

interface ReportChild {
  id: number;
  name: string;
  age: number;
  age_group: string;
  avatar_id: string;
  summary: {
    total_sessions: number;
    total_stars: number;
    total_play_seconds: number;
    avg_accuracy: number;
    avg_score: number;
    avg_session_ms: number;
    favorite_game: string;
    focus_level: string;
    areas_to_improve: string[];
  };
  timeline: { date: string; playMs: number; avgScore: number; sessions: number }[];
  achievements: { code: string; name: string; description: string; icon: string }[];
  recent_sessions: {
    game_type: string;
    level: number;
    stars: number;
    score: number;
    accuracy: number;
    played_at: string;
  }[];
}

export function ParentPage() {
  const { parentAuth, setAuth, profiles } = useApp();
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<{ generated_at: string; children: ReportChild[] } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res =
        mode === 'login'
          ? await api.login({ email, password })
          : await api.register({ name, email, password });
      setAuth({ token: res.token, user: res.user, linked: [] });
      toast('👨‍👩‍👧', `Selamat datang, ${res.user.name || 'Orang Tua'}!`);
    } catch (e) {
      toast('⚠️', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const loadReport = async () => {
    try {
      setReport((await api.report()) as { generated_at: string; children: ReportChild[] });
    } catch (e) {
      toast('⚠️', (e as Error).message);
    }
  };

  useEffect(() => {
    if (parentAuth) void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentAuth]);

  const handleSync = async () => {
    setSyncing(true);
    toast('🔄', 'Menyinkronkan data dari perangkat ini...');
    await syncAllProfiles();
    await loadReport();
    setSyncing(false);
    toast('✅', 'Sinkronisasi selesai!');
  };

  const logout = () => {
    setAuth(null);
    setReport(null);
    toast('👋', 'Sampai jumpa lagi!');
  };

  if (!parentAuth) {
    return (
      <div className="page-inner">
        <h1 className="hero-title">👨‍👩‍👧 Dashboard Orang Tua</h1>
        <p className="hero-sub">
          Pantau perkembangan fokus, akurasi, dan waktu bermain anak Anda.
        </p>
        <div className="card">
          <div className="row mb-16" style={{ justifyContent: 'center' }}>
            <button
              className={`btn ${mode === 'login' ? '' : 'ghost'}`}
              style={mode === 'login' ? {} : { color: '#3b2f63', background: '#efe9ff' }}
              onClick={() => setMode('login')}
            >
              Masuk
            </button>
            <button
              className={`btn ${mode === 'register' ? '' : 'ghost'}`}
              style={mode === 'register' ? {} : { color: '#3b2f63', background: '#efe9ff' }}
              onClick={() => setMode('register')}
            >
              Daftar
            </button>
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>Nama Anda</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bapak/Ibu..." />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="anda@email.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
          </div>
          <button className="btn big" style={{ width: '100%' }} onClick={submit} disabled={busy}>
            {busy ? 'Memproses...' : mode === 'login' ? '🚪 Masuk' : '📝 Daftar'}
          </button>
          <p className="muted center mt-16" style={{ fontSize: 13 }}>
            Data anak tetap aman tersimpan di perangkat & server pribadi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="between wrap mb-16">
        <h1 className="h1">📊 Dashboard Orang Tua</h1>
        <div className="row">
          <button className="btn sky" onClick={handleSync} disabled={syncing}>
            {syncing ? '⏳...' : '🔄 Sinkronkan'}
          </button>
          <button className="btn ghost" onClick={logout}>
            Keluar
          </button>
        </div>
      </div>
      <p className="hero-sub" style={{ textAlign: 'left', margin: '0 0 18px' }}>
        Halo, {parentAuth.user.name || 'Orang Tua'}! Berikut laporan perkembangan anak Anda.
      </p>

      {profiles.length > 0 && (
        <div className="card mb-16">
          <b>💡</b> Profil di perangkat ini belum semuanya tersinkron. Tekan <b>🔄 Sinkronkan</b> untuk mengirim data
          {profiles.length} anak ke server.
        </div>
      )}

      {!report ? (
        <div className="card center">
          <div style={{ fontSize: 48 }}>📡</div>
          <p>Memuat laporan...</p>
        </div>
      ) : report.children.length === 0 ? (
        <div className="card center">
          <div style={{ fontSize: 48 }}>👶</div>
          <h3>Belum ada data anak</h3>
          <p className="muted">
            Sinkronkan data dari perangkat tempat anak bermain, lalu tekan tombol
            &quot;Sinkronkan&quot; di atas.
          </p>
        </div>
      ) : (
        report.children.map((child) => (
          <ChildReport key={child.id} child={child} />
        ))
      )}
    </div>
  );
}

function ChildReport({ child }: { child: ReportChild }) {
  const timeline = child.timeline.slice(-14);
  const points = timeline.map((t) => ({
    label: t.date.slice(5),
    value: Math.round((t.playMs / 60000) * 10) / 10,
  }));

  const metricBars = [
    { label: 'Akurasi', value: child.summary.avg_accuracy, color: '#4ade80' },
    { label: 'Fokus', value: child.summary.avg_score, color: '#7c3aed' },
    { label: 'Bintang', value: Math.min(100, child.summary.total_stars), color: '#facc15' },
  ];

  return (
    <div className="parent-tile">
      <div className="between wrap mb-8">
        <div className="row">
          <span style={{ fontSize: 40 }}>{child.avatar_id ? '🧒' : '🧒'}</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{child.name}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {child.age} tahun · grup {child.age_group}
            </div>
          </div>
        </div>
        <span
          className="chip"
          style={{
            background: child.summary.avg_score >= 85 ? '#dcfce7' : child.summary.avg_score >= 70 ? '#fef9c3' : '#fee2e2',
            color: child.summary.avg_score >= 85 ? '#166534' : child.summary.avg_score >= 70 ? '#854d0e' : '#991b1b',
          }}
        >
          🧠 {child.summary.focus_level}
        </span>
      </div>

      <div className="stat-grid mb-16">
        <div className="stat-tile">
          <div className="icon">⏱️</div>
          <div className="value" style={{ fontSize: 18 }}>{formatSeconds(child.summary.total_play_seconds)}</div>
          <div className="label">Total Bermain</div>
        </div>
        <div className="stat-tile">
          <div className="icon">🎮</div>
          <div className="value" style={{ fontSize: 16 }}>{child.summary.favorite_game}</div>
          <div className="label">Game Favorit</div>
        </div>
        <div className="stat-tile">
          <div className="icon">📈</div>
          <div className="value">{child.summary.total_sessions}</div>
          <div className="label">Sesi Bermain</div>
        </div>
        <div className="stat-tile">
          <div className="icon">⭐</div>
          <div className="value">{child.summary.total_stars}</div>
          <div className="label">Bintang</div>
        </div>
      </div>

      <div className="mb-16">
        <div className="section-title">📅 Waktu Bermain per Hari (menit)</div>
        {points.length > 0 ? (
          <BarChart points={points} color="linear-gradient(180deg,#4ade80,#16a34a)" />
        ) : (
          <p className="muted">Belum ada data.</p>
        )}
      </div>

      <div className="mb-16">
        <div className="section-title">🎯 Metrik Fokus</div>
        <div>
          {metricBars.map((m) => (
            <div className="bar-row" key={m.label}>
              <span>{m.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${m.value}%`, background: m.color }} />
              </div>
              <span>{Math.round(m.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="section-title">⚠️ Area yang Perlu Ditingkatkan</div>
        <div className="wrap row">
          {child.summary.areas_to_improve.map((a) => (
            <span className="chip" key={a} style={{ background: '#fef3c7', color: '#92400e' }}>
              {a}
            </span>
          ))}
        </div>
      </div>

      {child.achievements.length > 0 && (
        <div className="mb-16">
          <div className="section-title">🏅 Lencana yang Diraih</div>
          <div className="ach-grid">
            {child.achievements.map((a) => (
              <div className="ach-card" key={a.code}>
                <div className="a-icon">{a.icon}</div>
                <div className="a-name">{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {child.recent_sessions.length > 0 && (
        <div>
          <div className="section-title">🗂️ Riwayat Permainan Terakhir</div>
          <table className="table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Level</th>
                <th>⭐</th>
                <th>Score</th>
                <th>Akurasi</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {child.recent_sessions.map((s, i) => (
                <tr key={i}>
                  <td>{GAME_NAMES[s.game_type] ?? s.game_type}</td>
                  <td>{s.level}</td>
                  <td>{s.stars}</td>
                  <td>{s.score}</td>
                  <td>{s.accuracy}%</td>
                  <td>{new Date(s.played_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
