const { Client, GatewayIntentBits, Collection, Partials, ActivityType } = require("discord.js");
console.clear();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

// Função para definir o status do bot
function setBotStatus() {
  client.user.setPresence({
    activities: [{ name: 'Psychiatry  Cloner', type: ActivityType.Playing }],
    status: 'idle' // Status disponível, ausente ou invisível
  }).catch(console.error);
}

client.slashCommands = new Collection();
const { token } = require("./config.json");

// Login do bot
client.login(token).then(() => {
  console.log('Bot logado com sucesso!');
  setBotStatus(); // Define o status após o login
}).catch(console.error);

const evento = require("./handler/Events");
evento.run(client);
require("./handler/index")(client);

process.on('unhandledRejection', (reason, promise) => {
  console.log(`🚫 Erro Detectado:\n\n`, reason, promise);
});

process.on('uncaughtException', (error, origin) => {
  console.log(`🚫 Erro Detectado:\n\n`, error, origin);
});
