
const crypto = require('node:crypto');

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

function response(statusCode, data) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify(data)
  };
}

function verifyTelegram(initData, botToken) {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  const userRaw = params.get('user');

  if (!hash || !authDate || !userRaw) return null;

  // Не принимаем устаревшие данные авторизации.
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 60 || now - authDate > 86400) return null;

  params.delete('hash');
  params.delete('signature');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (!/^[a-f0-9]{64}$/i.test(hash)) return null;

  const supplied = Buffer.from(hash, 'hex');
  const calculated = Buffer.from(calculatedHash, 'hex');

  if (
    supplied.length !== calculated.length ||
    !crypto.timingSafeEqual(supplied, calculated)
  ) return null;

  try {
    const user = JSON.parse(userRaw);
    if (!user.id) return null;
    return user;
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN;

  if (!allowedOrigin || origin !== allowedOrigin) {
    return response(403, { error: 'Недопустимый источник запроса' });
  }

  if (!['GET', 'PUT'].includes(event.httpMethod)) {
    return response(405, { error: 'Метод не поддерживается' });
  }

  const botToken = process.env.BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!botToken || !supabaseUrl || !serviceKey) {
    return response(500, { error: 'Сервер не настроен' });
  }

  const initData = event.headers['x-telegram-init-data'];
  const user = verifyTelegram(initData, botToken);

  if (!user) {
    return response(401, {
      error: 'Не удалось проверить авторизацию Telegram'
    });
  }

  const baseUrl = supabaseUrl.replace(/\/+$/, '');
  const tableUrl = `${baseUrl}/rest/v1/player_profiles`;

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    if (event.httpMethod === 'GET') {
      const query = new URLSearchParams({
        select: 'telegram_id,display_name,game_state',
        telegram_id: `eq.${user.id}`,
        limit: '1'
      });

      const result = await fetch(`${tableUrl}?${query}`, { headers });

      if (!result.ok) {
        return response(502, { error: 'Ошибка чтения игрового профиля' });
      }

      const rows = await result.json();

      return response(200, {
        profile: rows[0] || null,
        user: {
          id: String(user.id),
          name: user.first_name || user.username || 'Игрок'
        }
      });
    }

    let payload;

    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return response(400, { error: 'Некорректный JSON' });
    }

    const state = payload.state;

    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return response(400, { error: 'Некорректное состояние игры' });
    }

    if (Buffer.byteLength(JSON.stringify(state), 'utf8') > 500000) {
      return response(413, { error: 'Слишком большой игровой профиль' });
    }

    const save = await fetch(
      `${tableUrl}?on_conflict=telegram_id`,
      {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          telegram_id: String(user.id),
          display_name: user.first_name || user.username || 'Игрок',
          game_state: state,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!save.ok) {
      return response(502, { error: 'Не удалось сохранить игровой профиль' });
    }

    return response(200, { success: true });
  } catch (error) {
    console.error('[CRYPTOROLL profile]', error.message);
    return response(500, { error: 'Внутренняя ошибка сервера' });
  }
};
