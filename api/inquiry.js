export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  let chatId = (process.env.TELEGRAM_CHAT_ID || "").trim();

  if (req.method === "GET") {
    const isTest = req.query.test === "true";
    if (isTest && botToken && chatId) {
      try {
        const teleRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ [플러스 공인중개사] 텔레그램 알림 테스트 성공!\n앞으로 고객이 상담을 신청하면 이 채팅방으로 즉시 실시간 알림이 발송됩니다."
          })
        });
        const teleData = await teleRes.json();
        return res.status(200).json({
          status: teleRes.ok ? "SUCCESS" : "FAILED",
          telegram_response: teleData
        });
      } catch (err) {
        return res.status(500).json({ status: "ERROR", error: err.message });
      }
    }

    return res.status(200).json({
      configured: Boolean(botToken && chatId),
      botTokenExists: Boolean(botToken),
      chatIdExists: Boolean(chatId)
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, region, property_type, note, custom_token, custom_chat_id, is_test } = req.body || {};

  if (!botToken && custom_token) botToken = String(custom_token).trim();
  if (!chatId && custom_chat_id) chatId = String(custom_chat_id).trim();

  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);

  let telegramSent = false;
  let telegramError = null;

  if (botToken && chatId) {
    let text = "";
    if (is_test) {
      text = `✅ [플러스 공인중개사] 텔레그램 연동 테스트 메시지입니다!\n` +
        `연동이 완벽하게 완료되었습니다. 앞으로 고객 상담 신청 시 실시간으로 알림을 받으실 수 있습니다.`;
    } else {
      text = `🔔 [플러스 공인중개사] 새 상담 신청이 접수되었습니다!\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 고객명: ${name || '미입력'}\n` +
        `📞 연락처: ${phone || '미입력'}\n` +
        `📍 관심지역: ${region || '미선택'}\n` +
        `🏢 물건구분: ${property_type || '미선택'}\n` +
        `📝 문의사항:\n${note || '내용 없음'}\n` +
        `⏰ 접수일시: ${kstTime} (KST)\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 관리자 페이지에서 확인하세요!`;
    }

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

      const resBody = await teleRes.json().catch(() => ({}));
      if (teleRes.ok && resBody.ok) {
        telegramSent = true;
      } else {
        telegramError = resBody.description || "텔레그램 API 요청 실패";
      }
    } catch (e) {
      telegramError = e.message;
    }
  } else {
    telegramError = "TELEGRAM_NOT_CONFIGURED (Vercel 환경변수 또는 관리자 토큰 설정 필요)";
  }

  return res.status(200).json({
    success: true,
    telegramSent,
    telegramError
  });
}
