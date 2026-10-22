// Vercel дээрх үнийн санал авах форм (send.php-ийн оронд).
// Vercel → Project → Settings → Environment Variables:
//   RESEND_API_KEY  — https://resend.com дээрээс авсан түлхүүр
//   CONTACT_TO      — хүсэлт хүлээн авах имэйл
//   CONTACT_FROM    — (заавал биш) баталгаажсан домэйны хаяг, ж: "Студи <noreply@tany-domain.mn>"

const TYPES = {
  1000000: 'Хөгжүүлэлт', 1500000: 'Дизайн ба хөгжүүлэлт',
};

const clean = (v) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim();

module.exports = async (req, res) => {
  const reply = (status, ok, message) => res.status(status).json({ ok, message });
  if (req.method !== 'POST') return reply(405, false, 'Буруу хүсэлт.');

  const b = req.body || {};
  // Спам бот нуугдсан талбарыг бөглөдөг
  if (b.website) return reply(200, true, 'Баярлалаа!');

  const name = clean(b.name);
  const email = clean(b.email);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, false, 'Нэр, имэйлээ зөв бөглөнө үү.');

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO) return reply(500, false, 'Форм тохируулагдаагүй байна. Имэйлээр шууд холбогдоно уу.');

  const extras = [].concat(b['extras[]'] ?? b.extras ?? []).map(clean).filter(Boolean);
  const text = 'Шинэ үнийн санал авах хүсэлт\n\n'
    + `Нэр: ${name}\n`
    + `Имэйл: ${email}\n`
    + `Утас: ${clean(b.phone)}\n`
    + `Төрөл: ${TYPES[b.type] || '-'}\n`
    + `Нэмэлт: ${extras.length ? extras.join(', ') : '-'}\n`
    + `Тооцоолсон үнэ: ${clean(b.estimate)}\n\n`
    + `Зурвас:\n${String(b.message ?? '').replace(/<[^>]*>/g, '')}\n`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM || 'NationalOne <onboarding@resend.dev>',
        to: CONTACT_TO.split(',').map((s) => s.trim()),
        reply_to: email,
        subject: `Үнийн санал: ${name}`,
        text,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    return reply(200, true, 'Баярлалаа! Бид 24 цагийн дотор холбогдоно.');
  } catch (e) {
    console.error('send failed', e);
    return reply(502, false, 'Илгээж чадсангүй. Имэйлээр шууд холбогдоно уу.');
  }
};
