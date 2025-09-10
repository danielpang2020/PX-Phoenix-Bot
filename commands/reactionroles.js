const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const ROLE_OWNER_TEAM = "1353735474480414831"; // Ownership team role
const CHANNEL_REACTION_ROLES = "1353372278640869416"; // Reaction roles channel
const CHANNEL_LOGS = "1414272406742110208"; // Logs channel

// Emoji → Role mapping
const emojiRoleMap = {
  "🔔": "1353383695037235355", // Active
  "✈️": "1353383440522936402", // Flight Announcement
  "📋": "1357043509923938314", // Application Pings
  "📚": "1353663983655190589", // Polls Pings
  "🎉": "1353383781368856697", // Giveaway Pings
  "🛠️": "1353383497401765908", // Development Pings
  "🚨": "1357730390177087540"  // Punishment Pings
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionroles")
    .setDescription("Send reaction roles system to #reaction-roles"),  

  async execute(interaction) {
    const member = interaction.member;

    // Check role
    if (!member.roles.cache.has(ROLE_OWNER_TEAM)) {
      return interaction.reply({
        content: "<:no:1414271943900659792> You do not have permission to run this command.",
        ephemeral: true,
      });
    }

    // ✅ Confirm to the user
    await interaction.reply({
      content: "<:tick:1414277486367342602> Reaction roles system sent!",
    });

    // 📌 Create embed
    const embed = new EmbedBuilder()
      .setTitle("PX | Reaction Roles")
      .setDescription("React below to receive notifications for specific events!")
      .setColor(16607015)
      .setThumbnail("https://cdn.discordapp.com/icons/1353359637629636668/816006564eaa923481435409138c73de.webp?size=1024")
      .setFooter({
        text: "We hope you have a nice time in the server!"
      })
      .addFields(
        { name: ":bell: Active", value: "Stay in the loop with general server updates and announcements." },
        { name: ":airplane: Flight Announcement", value: "Get alerts about upcoming flight being hosted." },
        { name: ":clipboard: Application Pings", value: "Stay notified when applications open for department positions." },
        { name: ":books: Polls Ping", value: "Vote in community polls and help shape decisions." },
        { name: ":tada: Giveaway Pings", value: "Get updates on exciting giveaways and how to join." },
        { name: ":tools: Development Pings", value: "Be the first to know about updates and progress in development." },
        { name: ":rotating_light: Punishment Pings", value: "Receive alerts regarding punishment logs." }
      );

    const channel = await interaction.guild.channels.fetch(CHANNEL_REACTION_ROLES);
    const message = await channel.send({ embeds: [embed] });

    // React in order
    for (const emoji of Object.keys(emojiRoleMap)) {
      await message.react(emoji);
    }

    // 📝 Log to logs channel
    const logEmbed = new EmbedBuilder()
      .setTitle(`Command Ran By ${member.displayName}`)
      .setDescription(
        `**Admin:** ${member.displayName}\n` +
        `**Command:** \`/reactionroles\`\n` +
        `**Action:** Sent reaction roles system in #reaction-roles.\n` +
        `**Channel:** <#${interaction.channelId}>\n` +
        `**Time:** <t:${Math.floor(Date.now() / 1000)}:f>`
      )
      .setColor(16607015)
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setTimestamp(new Date());

    const logChannel = await interaction.guild.channels.fetch(CHANNEL_LOGS);
    await logChannel.send({ embeds: [logEmbed] });

    // Store message ID for reaction handling
    const fs = require("fs");
    fs.writeFileSync("./reactionMessage.json", JSON.stringify({ id: message.id, emojiRoleMap }, null, 2));
  }
};
