module.exports = {
  commands: (bot, Markup) => {
    bot.action('logout', (ctx) => {
      ctx.session = {};
      ctx.reply('Anda telah berhasil logout.', Markup.removeKeyboard());
    });
  }
};
