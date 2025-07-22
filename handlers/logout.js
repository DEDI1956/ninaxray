const { Markup } = require('telegraf');

module.exports = {
  commands: (bot) => {
    bot.action('logout', (ctx) => {
      ctx.session = {};
      ctx.reply('Anda telah berhasil logout.', Markup.removeKeyboard());
    });
  }
};
