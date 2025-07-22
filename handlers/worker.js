const { Scenes, Markup } = require('telegraf');
const axios = require('axios');
const cloudflare = require('../utils/cloudflare');
const github = require('../utils/github');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const upload = multer({ dest: 'temp/' });

const workerMenu = (ctx) => {
  return ctx.reply(
    'Pilih salah satu opsi Worker:',
    Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Deploy dari GitHub', 'deploy_github')],
      [Markup.button.callback('📥 Upload Manual JS', 'upload_manual_js')],
      [Markup.button.callback('📜 List Workers', 'list_workers')],
      [Markup.button.callback('🗑️ Hapus Worker', 'delete_worker')],
      [Markup.button.callback('⬅️ Kembali', 'main_menu')],
    ])
  );
};

const deployGithubScene = new Scenes.WizardScene(
  'deploy-github-wizard',
  (ctx) => {
    ctx.reply('Masukkan URL repository GitHub publik:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const repoUrl = ctx.message.text;
    try {
      ctx.reply('Mencari file .js atau .ts...');
      const localPath = await github.cloneRepo(repoUrl);
      const jsFile = await github.findJsFile(localPath);
      if (!jsFile) {
        ctx.reply('Tidak ada file .js atau .ts yang ditemukan di repository.');
        return ctx.scene.leave();
      }
      ctx.wizard.state.script = await github.getFileContent(jsFile);
      ctx.reply('Masukkan nama untuk Worker:');
      return ctx.wizard.next();
    } catch (error) {
      ctx.reply(`Gagal memproses repository: ${error.message}`);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    const workerName = ctx.message.text;
    const { script } = ctx.wizard.state;
    try {
      await cloudflare.deployWorker(ctx.session.apiToken, ctx.session.accountId, workerName, script);
      ctx.reply(`Worker ${workerName} berhasil di-deploy.`);
    } catch (error) {
      ctx.reply(`Gagal men-deploy Worker: ${error.message}`);
    }
    return ctx.scene.leave();
  }
);

const uploadManualJsScene = new Scenes.WizardScene(
    'upload-manual-js-wizard',
    (ctx) => {
        ctx.reply('Silakan upload file .js Anda.');
        return ctx.wizard.next();
    },
    (ctx) => {
        if (!ctx.message.document || !ctx.message.document.file_name.endsWith('.js')) {
            ctx.reply('File tidak valid. Silakan upload file .js.');
            return;
        }
        ctx.wizard.state.fileId = ctx.message.document.file_id;
        ctx.reply('Masukkan nama untuk Worker:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        const workerName = ctx.message.text;
        const { fileId } = ctx.wizard.state;
        try {
            const fileLink = await ctx.telegram.getFileLink(fileId);
            const response = await axios.get(fileLink.href, { responseType: 'stream' });
            const script = await streamToString(response.data);
            await cloudflare.deployWorker(ctx.session.apiToken, ctx.session.accountId, workerName, script);
            ctx.reply(`Worker ${workerName} berhasil di-deploy.`);
        } catch (error) {
            ctx.reply(`Gagal men-deploy Worker: ${error.message}`);
        }
        return ctx.scene.leave();
    }
);

const listWorkers = async (ctx) => {
    try {
        const workers = await cloudflare.listWorkers(ctx.session.apiToken, ctx.session.accountId);
        if (workers.length === 0) {
            ctx.reply('Tidak ada Worker yang ditemukan.');
            return;
        }
        let message = 'Workers:\n';
        workers.forEach(worker => {
            message += `\n- ${worker.id}`;
        });
        ctx.reply(message);
    } catch (error) {
        ctx.reply(`Gagal mengambil list Workers: ${error.message}`);
    }
};

const deleteWorkerScene = new Scenes.WizardScene(
    'delete-worker-wizard',
    async (ctx) => {
        try {
            const workers = await cloudflare.listWorkers(ctx.session.apiToken, ctx.session.accountId);
            if (workers.length === 0) {
                ctx.reply('Tidak ada Worker yang ditemukan.');
                return ctx.scene.leave();
            }
            const buttons = workers.map(worker => Markup.button.callback(worker.id, `delete_${worker.id}`));
            ctx.reply('Pilih Worker yang akan dihapus:', Markup.inlineKeyboard(buttons, { columns: 1 }));
        } catch (error) {
            ctx.reply(`Gagal mengambil list Workers: ${error.message}`);
        }
        return ctx.wizard.next();
    },
    async (ctx) => {
        const workerName = ctx.callbackQuery.data.split('_')[1];
        try {
            await cloudflare.deleteWorker(ctx.session.apiToken, ctx.session.accountId, workerName);
            ctx.reply('Worker berhasil dihapus.');
        } catch (error) {
            ctx.reply(`Gagal menghapus Worker: ${error.message}`);
        }
        return ctx.scene.leave();
    }
);

function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

module.exports = {
  scene: [deployGithubScene, uploadManualJsScene, deleteWorkerScene],
  commands: (bot) => {
    bot.action('worker_tools', (ctx) => workerMenu(ctx));
    bot.action('deploy_github', (ctx) => ctx.scene.enter('deploy-github-wizard'));
    bot.action('upload_manual_js', (ctx) => ctx.scene.enter('upload-manual-js-wizard'));
    bot.action('list_workers', (ctx) => listWorkers(ctx));
    bot.action('delete_worker', (ctx) => ctx.scene.enter('delete-worker-wizard'));
  }
};
