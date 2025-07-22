const { Scenes, Markup } = require('telegraf');
const cloudflare = require('../utils/cloudflare');

const loginWizard = new Scenes.WizardScene(
  'login-wizard',
  (ctx) => {
    ctx.reply('Silakan masukkan API Token Cloudflare Anda:');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.apiToken = ctx.message.text;
    ctx.reply('Silakan masukkan Account ID Cloudflare Anda:');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.accountId = ctx.message.text;
    ctx.reply('Silakan masukkan Zone ID Cloudflare Anda:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.session.zoneId = ctx.message.text;
    try {
      await cloudflare.verifyCredentials(ctx.session.apiToken, ctx.session.accountId, ctx.session.zoneId);
      ctx.reply('Login berhasil!', Markup.inlineKeyboard([
        [Markup.button.callback('⚙️ DNS Tools', 'dns_tools')],
        [Markup.button.callback('🛠️ Worker Tools', 'worker_tools')],
        [Markup.button.callback('🚪 Logout', 'logout')],
      ]));
    } catch (error) {
      ctx.reply(`Login gagal: ${error.message}`);
    }
    return ctx.scene.leave();
  }
);

const mainMenu = (ctx) => {
    return ctx.reply('Pilih salah satu opsi:', Markup.inlineKeyboard([
        [Markup.button.callback('⚙️ DNS Tools', 'dns_tools')],
        [Markup.button.callback('🛠️ Worker Tools', 'worker_tools')],
        [Markup.button.callback('🚪 Logout', 'logout')],
    ]));
};

module.exports = {
  scene: loginWizard,
  commands: (bot) => {
    bot.action('login', (ctx) => ctx.scene.enter('login-wizard'));
    bot.action('main_menu', (ctx) => mainMenu(ctx));
  }
};
