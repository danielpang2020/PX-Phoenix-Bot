const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const CHANNEL_ERRORCODES = "1355598459343999017"; // #error-codes
const CHANNEL_LOGS = "1414272406742110208"; // Logs channel
const OWNERSHIP_ROLE_ID = "1353735474480414831"; // Ownership Team role ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName("errorcodes")
    .setDescription("Send error codes embed to #error-codes."),

  async execute(interaction) {
    // Role restriction
    if (!interaction.member.roles.cache.has(OWNERSHIP_ROLE_ID)) {
      return interaction.reply({
        content:
          "<:no:1415646565623927007> You do not have permission to run this command.",
        ephemeral: true,
      });
    }

    const errorCodesChannel =
      await interaction.guild.channels.fetch(CHANNEL_ERRORCODES);

    if (!errorCodesChannel) {
      return interaction.reply({
        content:
          "<:no:1415646565623927007> Could not find the #error-codes channel. Please contact the Chairman",
        ephemeral: true,
      });
    }

    // embed content
    const errorCodesEmbed = new EmbedBuilder()
      .setTitle("PX | Error Codes")
      .setDescription("Here are the details of various error codes:")
      .setColor(16607015)
      .setThumbnail(
        "https://cdn.discordapp.com/icons/1353359637629636668/816006564eaa923481435409138c73de.webp?size=1024",
      )
      .addFields(
        {
          name: "Error Code 0x0001",
          value:
            "> • You have mentioned too many people in this message. Try decreasing the amount of ping and try again after 60 seconds.",
        },
        {
          name: "Error Code 0x0002",
          value:
            "> • You have been suspected for spamming. Moderators have been noticed and will investigate further.",
        },
        {
          name: "Error Code 0x0003",
          value:
            "> • You have been suspected for severe profanity, insult and slurring, or sexual contents. Moderators have been noticed and will investigate further.",
        },
      )
      .setFooter({
        text: "Feel free to open a support ticket for further questions!",
        iconURL:
          "https://cdn.discordapp.com/icons/1353359637629636668/816006564eaa923481435409138c73de.webp?size=1024",
      });

    // send embed in #error-codes
    await errorCodesChannel.send({ embeds: [errorCodesEmbed] });

    // confirm to the channel (normal message visible to everyone)
    await interaction.reply({
      content:
        "<:tick:1415646570191261727> Error Codes embed has been sent to #error-codes.",
    });

    // log embed
    // log embed
    const logEmbed = new EmbedBuilder()
      .setTitle(`Command Ran By ${interaction.member.displayName}`)
      .setDescription(
        `**Admin:** ${interaction.member.displayName}\n` +
          `**Command:** \`/errorcodes\`\n` +
          `**Action:** Sent error codes embed in #error-codes.\n` +
          `**Channel:** <#${interaction.channelId}>\n` +
          `**Time:** <t:${Math.floor(Date.now() / 1000)}:f>`,
      )
      .setColor(16607015)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp(new Date());

    const logChannel = await interaction.guild.channels.fetch(CHANNEL_LOGS);
    await logChannel.send({ embeds: [logEmbed] });
  },
};
