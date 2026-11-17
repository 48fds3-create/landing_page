export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, region, property_type, note } = req.body || {};

  const botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || "").trim();

  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

  let telegramSent = false;
  let telegramError = null;

  if (botToken && chatId) {
    const text = `🔔 [플러스 공인중개사] 새 상담 신청이 접수되었습니다!\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 고객명: ${name || '미입력'}\n` +
      `📞 연락처: ${phone || '미입력'}\n` +
      `📍 관심지역: ${region || '미선택'}\n` +
      `🏢 물건구분: ${property_type || '미선택'}\n` +
      `📝 문의사항:\n${note || '내용 없음'}\n` +
      `⏰ 접수일시: ${kstTime} (KST)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👉 관리자 페이지(admin)에서 확인하세요!`;

    try {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const teleRes = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text
        })
      });

      if (teleRes.ok) {
        telegramSent = true;
      } else {
        const errJson = await teleRes.json().catch(() => ({}));
        telegramError = errJson.description || "Telegram API Error";
      }
    } catch (e) {
      telegramError = e.message;
    }
  }

  return res.status(200).json({
    success: true,
    telegramSent,
    telegramError: telegramSent ? null : (botToken && chatId ? telegramError : "TELEGRAM_NOT_CONFIGURED")
  });
}
