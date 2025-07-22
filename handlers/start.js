const { Markup } = require('telegraf');

module.exports = {
  commands: (bot) => {
    bot.start((ctx) => {
      ctx.reply(
        'Selamat datang di Bot Pengelola Cloudflare! Silakan login untuk melanjutkan.',
        Markup.inlineKeyboard([
          Markup.button.callback('🔐 Login', 'login'),
        ])
      );
    });
  }
};
