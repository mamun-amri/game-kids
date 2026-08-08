import { config } from './config.js';

export interface ChildDataForAI {
  name: string;
  age: number;
  ageGroup: string;
  stats: {
    totalSessions: number;
    totalStars: number;
    totalPlayMs: number;
    avgAccuracy: number;
    avgConsistency: number;
    avgSpeed: number;
    avgCompletion: number;
    avgScore: number;
    avgSessionMs: number;
    currentStreak: number;
    bestStreak: number;
  };
  games: {
    game: string;
    count: number;
    avgScore: number;
    avgAccuracy: number;
    avgSpeed: number;
  }[];
  achievements: string[];
}

export function isAiConfigured(): boolean {
  return Boolean(config.aiUrl && config.apiKey);
}

function buildPrompt(data: ChildDataForAI): string {
  const games = data.games
    .map(
      (g) =>
        `- ${g.game}: ${g.count} sesi, skor rata-rata ${Math.round(g.avgScore)}, akurasi ${Math.round(g.avgAccuracy)}%, kecepatan ${Math.round(g.avgSpeed)}`,
    )
    .join('\n');

  return `Kamu adalah asisten psikolog perkembangan anak untuk aplikasi game edukasi "Focus Kids".

Berikut data permainan anak:
- Nama: ${data.name}, Umur: ${data.age} tahun (grup ${data.ageGroup})
- Total sesi bermain: ${data.stats.totalSessions}
- Total bintang: ${data.stats.totalStars}
- Total waktu bermain: ${Math.round(data.stats.totalPlayMs / 60000)} menit
- Rata-rata akurasi: ${Math.round(data.stats.avgAccuracy)}%
- Rata-rata skor fokus: ${Math.round(data.stats.avgScore)}
- Rata-rata konsistensi: ${Math.round(data.stats.avgConsistency)}%
- Rata-rata kecepatan: ${Math.round(data.stats.avgSpeed)}
- Rata-rata penyelesaian: ${Math.round(data.stats.avgCompletion)}%
- Rata-rata durasi per sesi: ${Math.round(data.stats.avgSessionMs / 1000)} detik
- Streak harian saat ini: ${data.stats.currentStreak} (terbaik: ${data.stats.bestStreak})
- Lencana yang diraih: ${data.achievements.length > 0 ? data.achievements.join(', ') : 'belum ada'}

Rincian per game:
${games || '- Belum ada data per game'}

Buat ringkasan dalam Bahasa Indonesia dengan format:
1. **Ringkasan singkat** (2-3 kalimat tentang performa anak secara umum)
2. **Kekuatan** (apa yang sudah baik)
3. **Area yang perlu ditingkatkan** (spesifik, sebutkan metrik dan game-nya)
4. **Rekomendasi untuk orang tua** (3-4 saran praktis dan ramah anak untuk membantu di rumah)

Gunakan bahasa yang hangat, tidak menghakimi, dan sesuai untuk dibacakan orang tua. Maksimal 250 kata. Jangan menyebut ini hasil AI.`;
}

export async function generateImprovementSummary(
  data: ChildDataForAI,
): Promise<string> {
  const res = await fetch(`${config.aiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.aiModel,
      temperature: 0.4,
      max_tokens: 800,
      messages: [{ role: 'user', content: buildPrompt(data) }],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI request gagal (${res.status}): ${await res.text()}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('AI mengembalikan respons kosong');
  return content;
}
