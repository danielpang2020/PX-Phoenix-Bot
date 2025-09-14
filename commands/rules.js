const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const CHANNEL_RULES = "1353364350970105896"; // #rules channel
const CHANNEL_LOGS = "1414272406742110208"; // Logs channel
const OWNERSHIP_ROLE_ID = "1353735474480414831"; // Ownership Team role ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Send server rules and guidelines embed to #rules."),

  async execute(interaction) {
    // Role restriction
    if (!interaction.member.roles.cache.has(OWNERSHIP_ROLE_ID)) {
      return interaction.reply({
        content:
          "<:no:1415646565623927007> You do not have permission to run this command.",
        ephemeral: true,
      });
    }

    const rulesChannel = await interaction.guild.channels.fetch(CHANNEL_RULES);

    if (!rulesChannel) {
      return interaction.reply({
        content: "<:no:1415646565623927007> Could not find the #rules channel.",
        ephemeral: true,
      });
    }

    // embed content
    const rulesEmbed = new EmbedBuilder()
      .setTitle("PX | Server Rules and Guidelines")
      .setDescription("📜 Server Rules and Guidelines:")
      .setColor(16607015)
      .setThumbnail(
        "https://cdn.discordapp.com/icons/1353359637629636668/816006564eaa923481435409138c73de.webp?size=1024",
      )
      .addFields(
        {
          name: "Voice Channel Etiquette",
          value:
            "> • Keep background noise to a minimum while in voice channels.\n> • Use push-to-talk when necessary to avoid disturbances.\n> • No playing loud or disruptive sounds.\n> • Do not join/leave voice channels repeatedly.",
        },
        {
          name: "No Spamming or Trolling",
          value:
            "> • Do not ping staff members unnecessarily.\n> • Avoid spamming mentions or excessive messages.\n> • No disruptive behavior such as sending copypastas, large embeds, or irrelevant emojis.\n> • Excessive use of headers or unnecessary messages will be moderated.",
        },
        {
          name: "Respect All Members",
          value:
            "> • Treat everyone with kindness and respect.\n> • Harassment, bullying, or offensive language is prohibited.\n> • Discrimination based on race, gender, identity, or age will not be tolerated.",
        },
        {
          name: "No Advertising",
          value:
            "> • Do not promote other servers or external communities.\n> • No sending invites or links for external platforms.\n> • Do not engage in trading/selling Roblox items or asking for free stuff such as Robux or Discord Nitro.",
        },
        {
          name: "No NSFW Content",
          value:
            "> • This is a safe-for-work server. Posting or sharing NSFW content is prohibited.",
        },
        {
          name: "Keep Chats Organized",
          value:
            "> • Use the appropriate channels for each topic.\n> • Keep conversations relevant to the channel's purpose.",
        },
        {
          name: "Follow Discord's ToS",
          value:
            "> • Adhere to Discord's [Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).\n> • Failure to comply may result in action taken by staff.",
        },
        {
          name: "Support",
          value:
            "> • If you need any assistance or support, please open a ticket at: [#open-a-ticket](https://ptb.discord.com/channels/1353359637629636668/1353669600335761418).\n> • Our team is ready to help you with any issues you might encounter!",
        },
      )
      .setFooter({
        text: "We hope you have a nice time in the server!",
        iconURL:
          "https://cdn.discordapp.com/icons/1353359637629636668/816006564eaa923481435409138c73de.webp?size=1024",
      });

    // send embed in #rules
    await rulesChannel.send({ embeds: [rulesEmbed] });

    // confirm to the channel (normal message visible to everyone)
    await interaction.reply({
      content:
        "<:tick:1415646570191261727> Rules embed has been sent to #rules.",
    });

    // log embed
    const logEmbed = new EmbedBuilder()
      .setTitle(`Command Ran By ${interaction.member.displayName}`)
      .setDescription(
        `**Admin:** ${interaction.member.displayName}\n` +
          `**Command:** \`/rules\`\n` +
          `**Action:** Sent rules embed in #rules.\n` +
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
