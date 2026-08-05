import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { GameList } from './pages/GameList';
import { LevelSelect } from './pages/LevelSelect';
import { Play } from './pages/Play';
import { Achievements } from './pages/Achievements';
import { Rewards } from './pages/Rewards';
import { ParentPage } from './pages/ParentPage';

export function App() {
  const { profiles, currentChildId } = useApp();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {profiles.length > 0 && currentChildId ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/games" element={<GameList />} />
            <Route path="/games/:game/levels" element={<LevelSelect />} />
            <Route path="/play/:game/:level" element={<Play />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/rewards" element={<Rewards />} />
          </>
        ) : null}
        <Route path="/parent" element={<ParentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
