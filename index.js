require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Load session data
let sessions = {};
const sessionPath = path.join(__dirname, 'data', 'session.json');

const loadSessions = () => {
  if (fs.existsSync(sessionPath)) {
    const data = fs.readFileSync(sessionPath, 'utf8');
    sessions = JSON.parse(data);
  }
};

const saveSessions = () => {
  fs.writeFileSync(sessionPath, JSON.stringify(sessions, null, 2));
};

loadSessions();

// Middleware to attach session to context
bot.use((ctx, next) => {
  const userId = ctx.from.id;
  if (!sessions[userId]) {
    sessions[userId] = {};
  }
  ctx.session = sessions[userId];
  return next();
});

const { Scenes, session } = require('telegraf');

// Register handlers
const handlersPath = path.join(__dirname, 'handlers');
const scenes = fs.readdirSync(handlersPath)
  .filter(file => file.endsWith('.js'))
  .map(file => {
    const handler = require(path.join(handlersPath, file));
    return handler.scene;
  })
  .filter(scene => scene)
  .flat();

const stage = new Scenes.Stage(scenes);

bot.use(session());
bot.use(stage.middleware());

const protectedActions = ['dns_tools', 'worker_tools'];
bot.use((ctx, next) => {
  if (ctx.callbackQuery && protectedActions.includes(ctx.callbackQuery.data)) {
    if (!ctx.session.apiToken) {
      return ctx.reply('Anda harus login terlebih dahulu.', Markup.inlineKeyboard([
        Markup.button.callback('🔐 Login', 'login'),
      ]));
    }
  }
  return next();
});

fs.readdirSync(handlersPath).forEach(file => {
  if (file.endsWith('.js')) {
    const handler = require(path.join(handlersPath, file));
    if (handler.commands) {
      handler.commands(bot);
    }
  }
});

bot.launch();

// Graceful stop
process.once('SIGINT', () => {
  saveSessions();
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  saveSessions();
  bot.stop('SIGTERM');
});
