
import { GoogleGenAI } from "@google/genai";

export const getMonkFeedback = async (history: string[], currentForm: string) => {
  // 実行直前にインスタンスを作成して、最新のAPI_KEYが反映されるようにする
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    あなたはFF14のベテランモンク「道場主」です。
    ユーザーは現在トレーニング中です。
    直近のスキル履歴: ${history.slice(-10).join(' -> ')}
    現在の型: ${currentForm}

    上記の状況を踏まえて、モンクのスキル回しのアドバイスを1〜2文で短く、かつ励ますように日本語で答えてください。
    特に「型」の維持、バフ（双掌打）、DoT（破砕拳）の重要性に触れると良いです。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and experienced martial arts master coach for the FFXIV Monk job. Reply in Japanese.",
        temperature: 0.7,
      }
    });
    return response.text || "良い調子だ！さらに研鑽を積もう。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "集中を切らすな！次はどの技を出すべきか考えてみよう。";
  }
};
