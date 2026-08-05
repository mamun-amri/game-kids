-- ============================================================
-- Focus Kids - Seed data (achievements & rewards)
-- ============================================================

INSERT INTO achievements (code, name, description, icon) VALUES
  ('first_win',            'First Win',            'Selesaikan level pertamamu', '🌟'),
  ('level_10',             '10 Level Completed',   'Selesaikan 10 level', '🪜'),
  ('level_100',            '100 Level Completed',  'Selesaikan 100 level', '🎯'),
  ('stars_100',            '100 Stars',            'Kumpulkan 100 bintang', '⭐'),
  ('stars_500',            '500 Stars',            'Kumpulkan 500 bintang', '💫'),
  ('perfect_accuracy',     'Perfect Accuracy',     'Akurasi 100% dalam satu permainan', '💯'),
  ('no_mistake',           'No Mistake',           'Selesaikan tanpa kesalahan', '🧠'),
  ('fast_thinker',         'Fast Thinker',         'Selesaikan level dengan kecepatan luar biasa', '⚡'),
  ('memory_master',        'Memory Master',        'Menangkan 10 permainan Memory Match', '🃏'),
  ('hidden_object_hunter', 'Hidden Object Hunter', 'Temukan 50 objek tersembunyi', '🔍'),
  ('focus_champion',       'Focus Champion',       'Mencapai Focus Score 90+ sebanyak 25 kali', '🏆'),
  ('streak_7',             '7-Day Streak',         'Bermain 7 hari berturut-turut', '🔥'),
  ('daily_10',             'Daily Champion',       'Selesaikan 10 Daily Challenge', '📅')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rewards (code, type, name, description, icon) VALUES
  ('avatar_rocket',    'avatar',      'Rocket Racer',   'Avatar baru: roket keren', '🚀'),
  ('avatar_dino',      'avatar',      'Dino Friend',    'Avatar baru: teman dinosaurus', '🦖'),
  ('avatar_robot',     'avatar',      'Robo Buddy',     'Avatar baru: robot sahabat', '🤖'),
  ('avatar_cat',       'avatar',      'Cute Cat',       'Avatar baru: kucing lucu', '🐱'),
  ('bg_space',         'background',  'Dunia Luar Angkasa', 'Background baru: galaksi', '🌌'),
  ('bg_underwater',    'background',  'Dunia Bawah Laut', 'Background baru: laut biru', '🌊'),
  ('bg_fantasy',       'background',  'Dunia Fantasi',  'Background baru: negeri dongeng', '🏰'),
  ('world_farm',       'world',       'Dunia Peternakan', 'Dunia baru: peternakan ceria', '🐄'),
  ('world_factory',    'world',       'Dunia Robot',    'Dunia baru: pabrik robot', '🏭'),
  ('mystery_box_1',    'mystery_box', 'Mystery Box',    'Kotak misteri - buka sekarang!', '🎁')
ON CONFLICT (code) DO NOTHING;
