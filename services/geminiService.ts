
import { GoogleGenAI } from "@google/genai";

export const getMonkFeedback = async (history: string[], currentForm: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    あなたはFF14のベテランモンク「道場主」です。
    ユーザーは現在トレーニング中です。
    直近のスキル履歴: ${history.slice(-15).join(' -> ')}
    現在の型: ${currentForm}

    上記の状況を踏まえて、スキル回しのアドバイスを1〜2文で短く、日本語で答えてください。
    
    【重要：以下の状況を検知してください】
    1. 「紅蓮の極意」と「踏鳴」が重なっている時は、バースト中であることを認め、応援してください。
    2. 「真真回し（ダブル月/太陽）」などの高度なバーストを意識しているようなら、その研鑽を褒めてください。
    3. 那岐（月と太陽）が両方揃った後は「夢幻闘舞」を忘れないよう指摘してください。
    4. 「破砕拳」のDoTや「双掌打（功力）」が途切れそうな時は厳しく注意してください。

    語尾は「〜だ」「〜せよ」など、武道の達人風にしてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite FFXIV Monk master. You provide crisp, authoritative, and encouraging advice in Japanese for high-level rotations including Bursts and Masterful Blitzes.",
        temperature: 0.8,
      }
    });
    return response.text || "良い調子だ！さらに研鑽を積もう。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "集中を切らすな！心で技を繋ぐのだ。";
  }
};
