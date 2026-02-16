const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const express = require("express");
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔧 CONFIGURAÇÕES
const OWNER_ID = "COLOCA_SEU_ID_AQUI";
const CATEGORY_ID = "COLOCA_ID_DA_CATEGORIA_AQUI";

let products = [
  { name: "Produto A", price: 10, stock: 5 },
  { name: "Produto B", price: 20, stock: 3 }
];

// ✅ BOT ONLINE
client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// ✅ COMANDO !painel
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!painel") {

    const buttons = products.map((p, i) =>
      new ButtonBuilder()
        .setCustomId(`buy_${i}`)
        .setLabel(`${p.name} - R$${p.price}`)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    await message.channel.send({
      content: "🛒 **Painel de Produtos**",
      components: [row]
    });
  }
});

// ✅ QUANDO CLICAR NO BOTÃO
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

  const channel = await interaction.guild.channels.create({
    name: `ticket-${product.name}-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: CATEGORY_ID,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
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

  await channel.send(
    `🎉 ${interaction.user} comprou **${product.name}** por R$${product.price}\n\nAguarde atendimento.`
  );

  await interaction.reply({
    content: `✅ Ticket criado: ${channel}`,
    ephemeral: true
  });
});

// 🔐 TOKEN
client.login(process.env.TOKEN);

// 🌍 Servidor para Railway não dormir
app.get("/", (req, res) => {
  res.send("Bot rodando!");
});

app.listen(3000, () => {
  console.log("🌎 Servidor web ativo");
});
