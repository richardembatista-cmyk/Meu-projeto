const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// 🔒 CONFIG
const OWNER_ID = "1471774624684445696";
const TICKET_CATEGORY_ID = "1470482643035619634";

// 📦 Produtos
let products = [
  { name: "Produto 1", price: 10, stock: 5 },
  { name: "Produto 2", price: 20, stock: 3 }
];

client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// 📌 Criar painel (SÓ VOCÊ pode usar, em QUALQUER canal)
client.on("messageCreate", async (message) => {
  if (message.author.id !== OWNER_ID) return;
  if (message.content !== "!painel") return;

  const buttons = products.map((p, i) =>
    new ButtonBuilder()
      .setCustomId(`buy_${i}`)
      .setLabel(`${p.name} - R$${p.price}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(p.stock <= 0)
  );

  const row = new ActionRowBuilder().addComponents(buttons);

  await message.channel.send({
    content: "🛒 **Painel de Produtos**",
    components: [row]
  });
});

// 🛒 Clique no botão
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const index = parseInt(interaction.customId.split("_")[1]);
  const product = products[index];
  if (!product) return;

  if (product.stock <= 0) {
    return interaction.reply({
      content: "❌ Produto sem estoque!",
      ephemeral: true
    });
  }

  product.stock--;

  const guild = interaction.guild;

  const ticketChannel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      },
      {
        id: OWNER_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      }
    ]
  });

  await ticketChannel.send(
    `🎫 ${interaction.user}\nProduto: **${product.name}**\nValor: R$${product.price}`
  );

  await interaction.reply({
    content: `✅ Ticket criado: ${ticketChannel}`,
    ephemeral: true
  });
});

client.login(TOKEN);
