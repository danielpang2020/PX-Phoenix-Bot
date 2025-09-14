const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const CHANNEL_LOGS = "1414272406742110208"; // Logs channel
const OWNERSHIP_ROLE_ID = "1353735474480414831"; // Ownership Team role ID
const SERVER_BOOSTER_ROLE_ID = "1412105428048941058"; // Server Booster role
const EXTRA_ROLE_ID = "1415629120548638761"; // Additional role to give

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forceboost")
    .setDescription("Force send a booster thank-you embed.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to thank")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("user");
    const targetChannel = interaction.guild.channels.cache.get("1415620861024800848");

    // Role restriction for command usage
    if (!interaction.member.roles.cache.has(OWNERSHIP_ROLE_ID)) {
      return interaction.reply({
        content: "<:no:1415646565623927007> You do not have permission to run this command.",
        ephemeral: true,
      });
    }

    // Check if the user has the Server Booster role
    if (!member.roles.cache.has(SERVER_BOOSTER_ROLE_ID)) {
      return interaction.reply({
        content: `<:no:1415646565623927007> ${member.displayName} is not a server booster.`,
        ephemeral: true,
      });
    }

    if (!targetChannel) {
      return interaction.reply({
        content: "<:no:1415646565623927007> Could not find the booster channel.",
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      // Give the additional role
      if (!member.roles.cache.has(EXTRA_ROLE_ID)) {
        await member.roles.add(EXTRA_ROLE_ID).catch(err => console.error("Failed to add extra role:", err));
      }

      // 1️⃣ Send ping first
      const pingMessage = await targetChannel.send({ content: `${member}` });

      // 2️⃣ Send the embed
      const thankEmbed = new EmbedBuilder()
        .setTitle(`<:boost:1415625297214181406> | **Server Boosted by ${member.displayName}**`)
        .setDescription(
          `${member} Thank you for boosting our server!\n\nCheck <#1353382836165541940> for all server booster perks, and claim in-game perks by running \`/claimperks\` at <#1408398242462564412>.`
        )
        .setColor(16023551)
        .setFooter({
          text: "Thank you for your support!",
          iconURL: "https://phoenixairlines.org/media/boost-gradient-logo.png",
        })
        .setThumbnail("https://phoenixairlines.org/media/gradient-boost.png");

      const embedMessage = await targetChannel.send({ embeds: [thankEmbed] });

      // React with <:boostgradient:1415703912450756638>
      await embedMessage.react("1415703912450756638");

      // 3️⃣ Delete ping after 3 seconds
      setTimeout(() => {
        pingMessage.delete().catch(() => {});
      }, 3000);

      // Reply to interaction
      await interaction.editReply({
        content: `<:tick:1415646570191261727> Booster thank-you sent for ${member}!`,
      });

      // Logging
      try {
        const logEmbed = new EmbedBuilder()
          .setTitle(`Command Ran By ${interaction.member.displayName}`)
          .setDescription(
            `**Admin:** ${interaction.member.displayName}\n` +
            `**Command:** \`/forceboost\`\n` +
            `**Action:** Sent server booster message to ${member.displayName}\n` +
            `**Channel:** <#${interaction.channelId}>\n` +
            `**Time:** <t:${Math.floor(Date.now() / 1000)}:f>`
          )
          .setColor(16607015)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp(new Date());

        const logChannel = await interaction.guild.channels.fetch(CHANNEL_LOGS);
        await logChannel.send({ embeds: [logEmbed] });
      } catch (logError) {
        console.error("Failed to send log embed:", logError);
      }

    } catch (error) {
      console.error("Failed to send booster embed:", error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "<:no:1415646565623927007> Failed to send booster thank-you message.",
        });
      } else {
        await interaction.reply({
          content: "<:no:1415646565623927007> Failed to send booster thank-you message.",
          ephemeral: true,
        });
      }
    }
  },
};
