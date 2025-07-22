const { Scenes, Markup } = require('telegraf');
const cloudflare = require('../utils/cloudflare');

const dnsMenu = (ctx) => {
  return ctx.reply(
    'Pilih salah satu opsi DNS:',
    Markup.inlineKeyboard([
      [Markup.button.callback('➕ Tambah A Record', 'add_a_record')],
      [Markup.button.callback('➕ Tambah CNAME', 'add_cname_record')],
      [Markup.button.callback('📃 List A Records', 'list_a_records')],
      [Markup.button.callback('📃 List CNAME Records', 'list_cname_records')],
      [Markup.button.callback('❌ Hapus A Record', 'delete_a_record')],
      [Markup.button.callback('❌ Hapus CNAME Record', 'delete_cname_record')],
      [Markup.button.callback('⬅️ Kembali', 'main_menu')],
    ])
  );
};

const addARecordScene = new Scenes.WizardScene(
  'add-a-record-wizard',
  (ctx) => {
    ctx.reply('Masukkan nama domain (e.g., example.com):');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    ctx.reply('Masukkan alamat IP:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const ip = ctx.message.text;
    const { name } = ctx.wizard.state;
    try {
      await cloudflare.addDnsRecord(ctx.session.apiToken, ctx.session.zoneId, 'A', name, ip);
      ctx.reply(`A record untuk ${name} telah berhasil ditambahkan.`);
    } catch (error) {
      ctx.reply(`Gagal menambahkan A record: ${error.message}`);
    }
    return ctx.scene.leave();
  }
);

const addCnameRecordScene = new Scenes.WizardScene(
  'add-cname-record-wizard',
  (ctx) => {
    ctx.reply('Masukkan nama (e.g., www):');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    ctx.reply('Masukkan target (e.g., example.com):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const target = ctx.message.text;
    const { name } = ctx.wizard.state;
    try {
      await cloudflare.addDnsRecord(ctx.session.apiToken, ctx.session.zoneId, 'CNAME', name, target);
      ctx.reply(`CNAME record untuk ${name} telah berhasil ditambahkan.`);
    } catch (error) {
      ctx.reply(`Gagal menambahkan CNAME record: ${error.message}`);
    }
    return ctx.scene.leave();
  }
);

const listRecords = async (ctx, type) => {
  try {
    const records = await cloudflare.listDnsRecords(ctx.session.apiToken, ctx.session.zoneId, type);
    if (records.length === 0) {
      ctx.reply(`Tidak ada ${type} record yang ditemukan.`);
      return;
    }
    let message = `${type} Records:\n`;
    records.forEach(record => {
      message += `\nName: ${record.name}\nContent: ${record.content}\n`;
    });
    ctx.reply(message);
  } catch (error) {
    ctx.reply(`Gagal mengambil list ${type} records: ${error.message}`);
  }
};

const deleteRecordScene = new Scenes.WizardScene(
    'delete-record-wizard',
    async (ctx) => {
        const type = ctx.wizard.state.type;
        try {
            const records = await cloudflare.listDnsRecords(ctx.session.apiToken, ctx.session.zoneId, type);
            if (records.length === 0) {
                ctx.reply(`Tidak ada ${type} record yang ditemukan.`);
                return ctx.scene.leave();
            }
            const buttons = records.map(record => Markup.button.callback(record.name, `delete_${record.id}`));
            ctx.reply('Pilih record yang akan dihapus:', Markup.inlineKeyboard(buttons, { columns: 1 }));
        } catch (error) {
            ctx.reply(`Gagal mengambil list ${type} records: ${error.message}`);
        }
        return ctx.wizard.next();
    },
    async (ctx) => {
        const recordId = ctx.callbackQuery.data.split('_')[1];
        try {
            await cloudflare.deleteDnsRecord(ctx.session.apiToken, ctx.session.zoneId, recordId);
            ctx.reply('Record berhasil dihapus.');
        } catch (error) {
            ctx.reply(`Gagal menghapus record: ${error.message}`);
        }
        return ctx.scene.leave();
    }
);

module.exports = {
  scene: [addARecordScene, addCnameRecordScene, deleteRecordScene],
  commands: (bot, Markup) => {
    bot.action('dns_tools', (ctx) => dnsMenu(ctx));
    bot.action('add_a_record', (ctx) => ctx.scene.enter('add-a-record-wizard'));
    bot.action('add_cname_record', (ctx) => ctx.scene.enter('add-cname-record-wizard'));
    bot.action('list_a_records', (ctx) => listRecords(ctx, 'A'));
    bot.action('list_cname_records', (ctx) => listRecords(ctx, 'CNAME'));
    bot.action('delete_a_record', (ctx) => ctx.scene.enter('delete-record-wizard', { type: 'A' }));
    bot.action('delete_cname_record', (ctx) => ctx.scene.enter('delete-record-wizard', { type: 'CNAME' }));
  }
};
