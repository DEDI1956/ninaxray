module.exports = {
  commands: (bot, Markup) => {
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
