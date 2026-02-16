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
  ],
});

const OWNER_ID = "1472767916796805172";
const CATEGORY_ID = "1470482643035619634";

let products = [
  { name: "Produto A", price: 10, stock: 5 },
  { name: "Produto B", price: 20, stock: 3 }
];

client.once("ready", () => {
  console.log("Bot online!");
});

client.on("messageCreate", async (message) => {
  if (message.content === "!painel" && message.author.id === OWNER_ID) {

    const buttons = products.map((p, i) =>
      new ButtonBuilder()
        .setCustomId(`buy_${i}`)
        .setLabel(`${p.name} - R$${p.price}`)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    message.channel.send({
      content: "🛒 Painel de Produtos",
      components: [row]
    });
  }
});

client.on("interactionCreate", async interaction => {

  if (!interaction.isButton()) return;

  const index = parseInt(interaction.customId.split("_")[1]);
  const product = products[index];

  if (!product) return;

  if (product.stock <= 0) {
    return interaction.reply({ content: "Produto sem estoque.", ephemeral: true });
  }

  product.stock--;

  const channel = await interaction.guild.channels.create({
    name: `ticket-${product.name}-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: CATEGORY_ID,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ],
      },
      {
        id: OWNER_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ],
      },
    ],
  });

  await channel.send(`🎟 Ticket criado para ${interaction.user}\nProduto: ${product.name}`);
  await interaction.reply({ content: "Ticket criado!", ephemeral: true });
});


// 🔥 Servidor web para Railway não derrubar o bot
app.get("/", (req, res) => {
  res.send("Bot está online!");
});

app.listen(3000, () => {
  console.log("Servidor web iniciado");
});

client.login(process.env.TOKEN);
