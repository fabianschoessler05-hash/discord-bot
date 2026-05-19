const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🔑 TOKEN (Railway Variable)
const TOKEN = process.env.TOKEN;

// 📌 CHANNEL IDS
const BUTTON_CHANNEL_ID = '1494741270176862369';
const NORMAL_CHANNEL_ID = '1494741158889525408';
const ANON_CHANNEL_ID = '1494741158889525408';
const MEDIC_CHANNEL_ID = '1495050392529277089';

// 🔒 ADMIN LOG CHANNEL
const LOG_CHANNEL_ID = '1494735527998652503';

// ⏱️ COOLDOWN (2 Minuten)
const cooldowns = new Map();

// ✅ BOT START
client.once('ready', async () => {
  console.log(`✅ ONLINE als ${client.user.tag}`);

  const channel = await client.channels.fetch(BUTTON_CHANNEL_ID);

  // 🔘 BUTTONS
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

  // 📩 BUTTON NACHRICHT
  const embed = new EmbedBuilder()
    .setColor('#2f3136')
    .setTitle('📨 Remote Message System')
    .setDescription(
      'Wähle unten eine Option aus, um eine Nachricht zu senden.'
    )
    .setFooter({
      text: 'Sector X Communication System'
    });

  await channel.send({
    embeds: [embed],
    components: [row]
  });
});

// ✅ INTERACTIONS
client.on(Events.InteractionCreate, async interaction => {

  // 🔘 BUTTONS
  if (interaction.isButton()) {

    // ⏱️ COOLDOWN CHECK
    const cooldownKey = `${interaction.user.id}_${interaction.customId}`;

    if (cooldowns.has(cooldownKey)) {

      const expirationTime = cooldowns.get(cooldownKey);

      if (Date.now() < expirationTime) {

        const remaining = Math.ceil(
          (expirationTime - Date.now()) / 1000
        );

        return interaction.reply({
          content:
`⏳ Bitte warte noch ${remaining} Sekunden.`,
          ephemeral: true
        });
      }
    }

    // 📝 MODAL
    const modal = new ModalBuilder()
      .setCustomId(`modal_${interaction.customId}`)
      .setTitle('Nachricht eingeben');

    const input = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Deine Nachricht')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    await interaction.showModal(modal);
  }

  // 📩 MODAL ABSENDEN
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

      cooldowns.set(
        `${interaction.user.id}_normal`,
        Date.now() + 120000
      );
    }

    // 🕶️ ANONYM
    if (interaction.customId === 'modal_anon') {

      channelId = ANON_CHANNEL_ID;

      finalMessage =
`Remote Message System [Unbekannt – ${time} Uhr]

${msg}`;

      cooldowns.set(
        `${interaction.user.id}_anon`,
        Date.now() + 120000
      );

      // 🔒 ADMIN LOG
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

      await logChannel.send({
        content:
`🔍 ANONYME NACHRICHT

👤 User:
${interaction.member.displayName}

🕒 Uhrzeit:
${time}

💬 Nachricht:
${msg}`
      });
    }

    // 🩺 MEDIC
    if (interaction.customId === 'modal_medic') {

      channelId = MEDIC_CHANNEL_ID;

      finalMessage =
`Remote Message System [Medic – ${time} Uhr]

${msg}`;

      cooldowns.set(
        `${interaction.user.id}_medic`,
        Date.now() + 120000
      );
    }

    // 📨 CHANNEL SENDEN
    const targetChannel = await client.channels.fetch(channelId);

    await targetChannel.send({
      content: finalMessage
    });

    // ✅ BESTÄTIGUNG
    await interaction.reply({
      content: '✅ Nachricht erfolgreich gesendet!',
      ephemeral: true
    });
  }
});

// 🚀 LOGIN
client.login(TOKEN);