const fs = require("fs");

module.exports = (client) => {
  async function getReactionConfig() {
    try {
      return JSON.parse(fs.readFileSync("./reactionMessage.json"));
    } catch {
      return null;
    }
  }

  // Unified function for adding/removing roles
  async function handleReaction(reaction, user, add) {
    if (user.bot) return;

    // Fetch partials if needed
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const config = await getReactionConfig();
    if (!config) return;
    if (reaction.message.id !== config.id) return;

    const roleId = config.emojiRoleMap[reaction.emoji.name];
    if (!roleId) return;

    const guildMember = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(roleId);

    try {
      if (add) await guildMember.roles.add(roleId);
      else await guildMember.roles.remove(roleId);

      await user.send(
        `<:tick:1415646570191261727> Successfully ${add ? "added" : "removed"} **${role.name}**!`
      ).catch(() => {});
    } catch {
      await user.send(
        `<:no:1415646565623927007> An error occurred while ${add ? "adding" : "removing"} **${role.name}**.`
      ).catch(() => {});
    }
  }

  client.on("messageReactionAdd", async (reaction, user) => {
    handleReaction(reaction, user, true);
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    handleReaction(reaction, user, false);
  });

  // Fetch the reaction roles message on bot startup to cache it
  client.on("clientReady", async () => {
    const config = await getReactionConfig();
    if (!config || !config.id) return;

    try {
      const channel = await client.channels.fetch("1353372278640869416"); // Reaction roles channel
      await channel.messages.fetch(config.id); // Cache the message
      console.log(`Reaction roles message ${config.id} cached successfully!`);
    } catch (err) {
      console.error("Failed to fetch/cache reaction roles message:", err);
    }
  });
};
