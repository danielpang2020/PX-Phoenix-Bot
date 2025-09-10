const fs = require("fs");

module.exports = (client) => {
  async function getReactionConfig() {
    try {
      return JSON.parse(fs.readFileSync("./reactionMessage.json"));
    } catch {
      return null;
    }
  }

  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    const config = await getReactionConfig();
    if (!config) return;

    if (reaction.message.id !== config.id) return;
    const roleId = config.emojiRoleMap[reaction.emoji.name];
    if (!roleId) return;

    const guildMember = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(roleId);

    try {
      await guildMember.roles.add(roleId);
      await user.send(`<:tick:1414277486367342602> Successfully added **${role.name}**!`).catch(() => {});
    } catch {
      await user.send(`<:no:1414271943900659792> An error occurred while giving **${role.name}**. Please try again later or contact support.`).catch(() => {});
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;

    const config = await getReactionConfig();
    if (!config) return;

    if (reaction.message.id !== config.id) return;
    const roleId = config.emojiRoleMap[reaction.emoji.name];
    if (!roleId) return;

    const guildMember = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(roleId);

    try {
      await guildMember.roles.remove(roleId);
      await user.send(`<:tick:1414277486367342602> Successfully removed **${role.name}**!`).catch(() => {});
    } catch {
      await user.send(`<:no:1414271943900659792> An error occurred while removing **${role.name}**. Please try again later or contact support.`).catch(() => {});
    }
  });
};
