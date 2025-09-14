// events/guildMemberUpdate.js
const { Events, EmbedBuilder } = require("discord.js");

const SERVER_BOOSTER_ROLE_ID = "1412105428048941058"; // Server Booster role
const EXTRA_ROLE_ID = "1415629120548638761"; // Additional role to give
const BOOST_CHANNEL_ID = "1415620861024800848"; // Booster channel

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    // Check if member started boosting
    if (!oldMember.premiumSince && newMember.premiumSince) {
      const channel = newMember.guild.channels.cache.get(BOOST_CHANNEL_ID);
      if (!channel) return;

      try {
        // Give server booster role if not already
        if (!newMember.roles.cache.has(SERVER_BOOSTER_ROLE_ID)) {
          await newMember.roles.add(SERVER_BOOSTER_ROLE_ID).catch(err => console.error("Failed to add booster role:", err));
        }

        // Give extra role if not already
        if (!newMember.roles.cache.has(EXTRA_ROLE_ID)) {
          await newMember.roles.add(EXTRA_ROLE_ID).catch(err => console.error("Failed to add extra role:", err));
        }

        // 1️⃣ Send ping first
        const pingMessage = await channel.send({ content: `${newMember}` });

        // 2️⃣ Send embed
        const embed = new EmbedBuilder()
          .setTitle(`<:boost:1415625297214181406> | **Server Boosted by ${newMember.displayName}**`)
          .setDescription(
            `${newMember} Thank you for boosting our server!\n\nCheck <#1353382836165541940> for all server booster perks, and claim in-game perks by running \`/claimperks\` at <#1408398242462564412>.`
          )
          .setColor(16023551)
          .setFooter({
            text: "Thank you for your support!",
            iconURL: "https://phoenixairlines.org/media/boost-gradient-logo.png",
          })
          .setThumbnail("https://phoenixairlines.org/media/gradient-boost.png");

        const embedMessage = await channel.send({ embeds: [embed] });

        // React with <:boostgradient:1415703912450756638>
        await embedMessage.react("1415703912450756638");

        // 3️⃣ Delete ping after 3 seconds
        setTimeout(() => {
          pingMessage.delete().catch(() => {});
        }, 3000);

      } catch (error) {
        console.error("Failed to send automatic boost embed:", error);
      }
    }
  },
};
