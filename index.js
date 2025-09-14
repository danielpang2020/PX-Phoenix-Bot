const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"], // important
});

client.commands = new Collection();

// ===== Commands Setup =====
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
  }
}

// ===== Reaction Handler =====
const reactionHandler = require("./utils/reactionHandler.js");
reactionHandler(client);

// ===== Interaction Handler =====
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing this command.",
      ephemeral: true
    });
  }
});

// ===== Bot Login & Ready =====
client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Load reaction roles message on startup
  let config;
  try {
    config = JSON.parse(fs.readFileSync("./reactionMessage.json"));
  } catch {
    console.warn("No reactionMessage.json found");
    return;
  }

  if (!config || !config.id) return;

  try {
    const channel = await client.channels.fetch("1353372278640869416"); // reaction roles channel
    const message = await channel.messages.fetch(config.id);
    console.log(`Fetched reaction roles message ${message.id} successfully!`);
  } catch (err) {
    console.error("Failed to fetch reaction roles message:", err);
  }
});

client.login(process.env.TOKEN);
