import TelegramBot from 'node-telegram-bot-api';
import { generateInitData } from '../utils/telegram/generateInitData';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

// Create bot instance with polling
const bot = new TelegramBot(token, { polling: true });

// Handler for all text messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const from = msg.from;

  if (!from) {
    return;
  }

  try {
    // Extract user data from message
    const userData = {
      id: from.id,
      first_name: from.first_name,
      last_name: from.last_name,
      username: from.username,
      language_code: from.language_code,
      is_premium: from.is_premium,
    };

    // Generate initData
    const initData = generateInitData(userData);

    // Send initData to user
    const responseText = `Ваш initData для авторизации:\n\n\`${initData}\`\n\nИспользуйте это значение в заголовке X-Telegram-Init-Data при запросах к API.`;

    bot.sendMessage(chatId, responseText, {
      parse_mode: 'Markdown',
    });
  } catch (error: any) {
    console.error('Error processing message:', error);
    bot.sendMessage(chatId, `Ошибка: ${error.message || 'Не удалось сгенерировать initData'}`);
  }
});

// Handler for /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Отправь мне любое сообщение, и я сгенерирую для тебя initData для авторизации в API.');
});

console.log('🤖 Telegram bot started with polling');

export { bot };

