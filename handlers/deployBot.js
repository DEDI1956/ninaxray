const { Scenes, Markup } = require('telegraf');

const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const execPromise = util.promisify(exec);
const github = require('../utils/github');
const cloudflare = require('../utils/cloudflare');
const telegram = require('../utils/telegram');

const deployBotScene = new Scenes.WizardScene(
  'deploy-bot-wizard',
  (ctx) => {
    ctx.reply('Masukkan URL repository GitHub publik dari bot Telegram Anda:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const repoUrl = ctx.message.text;
    try {
      ctx.reply('Cloning repository...');
      const localPath = await github.cloneRepo(repoUrl);
      ctx.reply('Menganalisis repository...');
      const { buildScript, mainFile } = await github.analyzeRepo(localPath);

      if (buildScript) {
        ctx.reply('Menjalankan build script...');
        await execPromise('npm install', { cwd: localPath });
        await execPromise('npm run build', { cwd: localPath });
      }

      const scriptPath = mainFile ? path.join(localPath, mainFile) : await github.findJsFile(localPath);

      if (!scriptPath) {
        ctx.reply('Tidak dapat menemukan file utama untuk di-deploy.');
        return ctx.scene.leave();
      }

      const script = await github.getFileContent(scriptPath);
      ctx.wizard.state.script = script;
      ctx.reply('Masukkan nama untuk Worker:');
      return ctx.wizard.next();
    } catch (error) {
      ctx.reply(`Gagal: ${error.message}`);
      return ctx.scene.leave();
    }
  },
    async (ctx) => {
        const workerName = ctx.message.text;
        const { script } = ctx.wizard.state;
        try {
            const worker = await cloudflare.deployWorker(ctx.session.apiToken, ctx.session.accountId, workerName, script);
            const workerUrl = `https://${worker.id}.${worker.subdomain}.workers.dev`;
            ctx.reply(`Worker ${workerName} berhasil di-deploy. URL: ${workerUrl}`);
            ctx.wizard.state.workerUrl = workerUrl;
            ctx.reply('Apakah Anda ingin mengatur webhook Telegram ke URL ini?', Markup.inlineKeyboard([
                Markup.button.callback('Ya', 'set_webhook'),
                Markup.button.callback('Tidak', 'no_webhook'),
            ]));
            return ctx.wizard.next();
        } catch (error) {
            ctx.reply(`Gagal men-deploy Worker: ${error.message}`);
            return ctx.scene.leave();
        }
    },
    async (ctx) => {
        if (ctx.callbackQuery.data === 'set_webhook') {
            try {
                const { workerUrl } = ctx.wizard.state;
                await telegram.setWebhook(process.env.BOT_TOKEN, workerUrl);
                ctx.reply('Webhook berhasil diatur.');
            } catch (error) {
                ctx.reply(`Gagal mengatur webhook: ${error.message}`);
            }
        }
        return ctx.scene.leave();
    }
);

module.exports = {
  scene: deployBotScene,
  commands: (bot) => {
    bot.command('deploybot', (ctx) => ctx.scene.enter('deploy-bot-wizard'));
    bot.action('deploy_bot', (ctx) => ctx.scene.enter('deploy-bot-wizard'));
  }
};
