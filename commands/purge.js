const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const CHANNEL_LOGS = "1414272406742110208"; // Logs channel
const cooldowns = new Map(); // Store cooldowns

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a number of messages, optionally from a specific user.")
    .addIntegerOption(option =>
      option
        .setName("messages")
        .setDescription("Number of messages to delete (max 100).")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Delete messages only from this user.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // requires Manage Messages

  async execute(interaction) {
    const userId = interaction.user.id;

    // Cooldown check
    const lastUsed = cooldowns.get(userId);
    if (lastUsed && Date.now() - lastUsed < 3000) {
      return interaction.reply({
        content: "<:no:1414271943900659792> You are on cooldown! Please wait 3 seconds before using /purge again.",
        ephemeral: true,
      });
    }
    cooldowns.set(userId, Date.now());

    // Check permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "<:no:1414271943900659792> You do not have permission to run this command.",
        ephemeral: true,
      });
    }

    const amount = interaction.options.getInteger("messages");
    const user = interaction.options.getUser("user");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "<:no:1414271943900659792> You must provide a number between 1 and 100.",
        ephemeral: true,
      });
    }

    const channel = interaction.channel;
    let messages = await channel.messages.fetch({ limit: 100 });

    if (user) {
      messages = messages.filter(m => m.author.id === user.id).first(amount);
    } else {
      messages = messages.first(amount);
    }

    if (!messages.length) {
      return interaction.reply({
        content: `<:no:1414271943900659792> No messages found to delete.`,
        ephemeral: true,
      });
    }

    let deletedCount = 0;
    let failed = false;

    try {
      const deleted = await channel.bulkDelete(messages, true);
      deletedCount = deleted.size;
      failed = deletedCount < messages.length; // some too old
    } catch (err) {
      return interaction.reply({
        content: "<:no:1414271943900659792> Failed to delete messages. Remember, I cannot delete messages older than 14 days.",
        ephemeral: true,
      });
    }

    // success message
    let replyMessage;
    if (failed) {
      replyMessage = `<:tick:1414277486367342602> Successfully deleted **${deletedCount}** messages, some messages could not be deleted due to being older than 14 days.`;
    } else {
      replyMessage = `<:tick:1414277486367342602> Successfully deleted **${deletedCount}** messages.`;
    }

    // send reply, then delete it after 3 seconds
    await interaction.reply({ content: replyMessage });
    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 3000);

    // only log if something was actually deleted
    if (deletedCount > 0) {
      const logEmbed = new EmbedBuilder()
        .setTitle(`Command Ran By ${interaction.member.displayName}`)
        .setDescription(
          `**Moderator:** ${interaction.member.displayName}\n` +
          `**Command:** \`/purge\`\n` +
          `**Action:** Deleted ${deletedCount} message(s) ${user ? `from ${user.tag}.` : "from all."}\n` +
          (failed ? `**Note:** Some messages were older than 14 days and could not be deleted.\n` : "") +
          `**Channel:** <#${interaction.channelId}>\n` +
          `**Time:** <t:${Math.floor(Date.now() / 1000)}:f>`
        )
        .setColor(16607015)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp(new Date());

      const logChannel = await interaction.guild.channels.fetch(CHANNEL_LOGS);
      await logChannel.send({ embeds: [logEmbed] });
    }
  },
};
