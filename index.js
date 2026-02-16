const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField, 
  ChannelType, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const OWNER_ID = "1472767916796805172";
const CATEGORY_ID = "1470482643035619634";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

let products = [];

client.once("ready", async () => {
  console.log("Bot online");

  const commands = [
    new SlashCommandBuilder()
      .setName("painel")
      .setDescription("Criar painel de produtos")
  ].map(command => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("Slash command registrado");
});

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "painel") {

      if (interaction.user.id !== OWNER_ID) {
        return interaction.reply({ content: "Você não pode usar isso.", ephemeral: true });
      }

      products = [
        { name: "Produto A", price: 10, stock: 5 },
        { name: "Produto B", price: 20, stock: 3 }
      ];

      const buttons = products.map((p, i) =>
        new ButtonBuilder()
          .setCustomId(`buy_${i}`)
          .setLabel(`${p.name} - R$${p.price}`)
          .setStyle(ButtonStyle.Primary)
      );

      const row = new ActionRowBuilder().addComponents(buttons);

      await interaction.reply({
        content: "🛒 Painel de Produtos",
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {

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
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: OWNER_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });

    await channel.send(`🎟 Ticket criado para ${interaction.user}\nProduto: ${product.name}\nEstoque restante: ${product.stock}`);

    await interaction.reply({ content: "Ticket criado!", ephemeral: true });
  }
});

client.login(TOKEN);
