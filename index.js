const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🔑 TOKEN von Render (Environment Variable)
const TOKEN = process.env.TOKEN;

// 📌 DEINE CHANNEL IDS
const BUTTON_CHANNEL_ID = '1494741270176862369';
const NORMAL_CHANNEL_ID = '1494741158889525408';
const ANON_CHANNEL_ID = '1494741158889525408';
const MEDIC_CHANNEL_ID = '1495050392529277089';

// 👉 Beim Start
client.once('ready', async () => {
  console.log(`✅ ONLINE als ${client.user.tag}`);

  const channel = await client.channels.fetch(BUTTON_CHANNEL_ID);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('normal')
      .setLabel('📩 Nachricht')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('anon')
      .setLabel('🕶️ Anonym')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('medic')
      .setLabel('🩺 Medic')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: '📨 Nachricht senden:',
    components: [row]
  });
});

// 👉 Interaktionen
client.on(Events.InteractionCreate, async interaction => {

  // BUTTON → öffnet Eingabe
  if (interaction.isButton()) {
    const modal = new ModalBuilder()
      .setCustomId(`modal_${interaction.customId}`)
      .setTitle('Nachricht eingeben');

    const input = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Deine Nachricht')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  }

  // MODAL → sendet Nachricht
  if (interaction.isModalSubmit()) {
    const msg = interaction.fields.getTextInputValue('message');

    const time = new Date().toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let channelId;
    let finalMessage;

    // 📩 NORMAL
    if (interaction.customId === 'modal_normal') {
      channelId = NORMAL_CHANNEL_ID;

      finalMessage =
`Remote Message System [${interaction.member.displayName} – ${time} Uhr]

${msg}`;
    }

    // 🕶️ ANONYM
    if (interaction.customId === 'modal_anon') {
      channelId = ANON_CHANNEL_ID;

      finalMessage =
`Remote Message System [Unbekannt – ${time} Uhr]

${msg}`;
    }

    // 🩺 MEDIC
    if (interaction.customId === 'modal_medic') {
      channelId = MEDIC_CHANNEL_ID;

      finalMessage =
`Remote Message System [Medic – ${time} Uhr]

${msg}`;
    }

    const targetChannel = await client.channels.fetch(channelId);

    await targetChannel.send({
      content: finalMessage
    });

    await interaction.reply({
      content: '✅ Nachricht gesendet!',
      ephemeral: true
    });
  }
});

client.login(TOKEN);