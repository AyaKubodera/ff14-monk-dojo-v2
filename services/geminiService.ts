
import { GoogleGenAI } from "@google/genai";

export const getMonkFeedback = async (history: string[], currentForm: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    あなたはFF14「黄金のレガシー」版Lv100モンクの最高指導者です。
    ユーザーは現在修行中の身です。

    直近のスキル履歴: ${history.slice(-15).join(' -> ')}
    現在の型: ${currentForm}

    【黄金版モンクの指導指針】
    1. 真空波 (Winds of Reply): 必殺技（爆裂脚・鳳凰・夢幻）を撃った直後の追撃を忘れていないか。
    2. 新スキル名称: 「猿舞連撃」「竜頷正拳撃」「虎襲崩拳」を正しく使いこなせているか。
    3. 天宙脚 (Celestial Revolution): これを撃つのは修行不足の証拠。月の那岐と太陽の那岐の管理ミスを指摘せよ。
    4. バフの極意: 「双掌打（功力）」を維持し、「破砕拳（DoT）」を背中から叩き込み続けるのが基本だ。

    これらを踏まえ、ユーザーの動きを評価し、次に意識すべきことを1〜2文で短く、武道家風に（「〜だ」「〜せよ」）アドバイスしてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite Level 100 FFXIV Monk master. You focus on Dawntrail skills: Pouncing Barrage, Dragon-jaw True Strike, Tiger-claw Snap Punch, and Winds of Reply follow-ups.",
        temperature: 0.7,
      }
    });
    return response.text || "良い型だ。真空波のキレを研ぎ澄ませ。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "集中せよ！心技体、すべてをその拳に込めろ。";
  }
};
