module.exports = (client) => {
    const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
    const express = require("express");
    const bodyParser = require("body-parser");
    const fs = require("fs");

    const TOKEN = process.env.TOKEN;
    const PORT = process.env.PORT || 3000;

    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });

    // Channels
    const CHANNEL_RANK_REQUEST = "1406660961414414478"; // #rank-request
    const CHANNEL_ORDER_LOGS = "1409840664052629504"; // #rank-order-logs

    // Files
    const ORDER_FILE = "./orders.json";
    const ORDER_DB_FILE = "./orders_db.json";

    // Default order numbers
    let orderNumbers = { PE: 110001, BC: 120001, FC: 130001, FLM: 140001 };

    // Load saved order numbers
    if (fs.existsSync(ORDER_FILE)) {
        try {
            const data = fs.readFileSync(ORDER_FILE, "utf8");
            const savedOrders = JSON.parse(data);
            orderNumbers = { ...orderNumbers, ...savedOrders };
        } catch (err) {
            console.warn("Failed to load order numbers:", err);
        }
    }

    // Load order database
    let orderDB = [];
    if (fs.existsSync(ORDER_DB_FILE)) {
        try {
            const data = fs.readFileSync(ORDER_DB_FILE, "utf8");
            orderDB = JSON.parse(data);
        } catch (err) {
            console.warn("Failed to load order database:", err);
        }
    }

    // Rank table
    const RANKS = {
        PE: {
            name: "Premium Economy",
            price: 199,
            prefix: "[PE]",
            color: 0xfd6727,
        },
        BC: {
            name: "Business Class",
            price: 499,
            prefix: "[BC]",
            color: 0xa6a6a6,
        },
        FC: {
            name: "First Class",
            price: 799,
            prefix: "[FC]",
            color: 0xa6a6a6,
        },
        FLM: {
            name: "Phoenix Flames",
            price: 1399,
            prefix: "[FLM]",
            color: 0xcda434,
        },
    };

    // Helpers
    function saveOrderNumbers() {
        try {
            fs.writeFileSync(ORDER_FILE, JSON.stringify(orderNumbers, null, 2));
        } catch (err) {
            console.error("Failed to save order numbers:", err);
        }
    }

    function saveOrderDB() {
        try {
            fs.writeFileSync(ORDER_DB_FILE, JSON.stringify(orderDB, null, 2));
        } catch (err) {
            console.error("Failed to save order database:", err);
        }
    }

    const app = express();
    app.use(bodyParser.json());

    app.post("/purchase", async (req, res) => {
        const { username, userId, requestedRankKey, currentRank } = req.body;

        if (!RANKS[requestedRankKey])
            return res.status(400).json({ error: "Invalid rank" });

        const rankData = RANKS[requestedRankKey];
        const orderNumber = `R${orderNumbers[requestedRankKey]}`;
        orderNumbers[requestedRankKey]++;
        saveOrderNumbers();

        const formattedPrice = rankData.price.toLocaleString("en-US");

        // Get Roblox thumbnail
        let profilePic = "";
        try {
            const thumbRes = await fetch(
                `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
            );
            const thumbJson = await thumbRes.json();
            profilePic = thumbJson?.data?.[0]?.imageUrl || "";
        } catch (err) {
            console.warn("Failed to fetch thumbnail:", err);
        }

        // Embed 1 → #rank-request
        const embedRequest = new EmbedBuilder()
            .setTitle(`Rank Request for ${username} | ${orderNumber}`)
            .setDescription(
                `**Username:** ${username} [[Profile Link]](https://www.roblox.com/users/${userId}/profile)\n` +
                    `**Order Number:** ${orderNumber}\n` +
                    `**Current Rank:** ${currentRank}\n` +
                    `**Requested Rank:** ${rankData.prefix} ${rankData.name}\n` +
                    `**Payment Price:** R$ ${formattedPrice}\n` +
                    `**Status:** Not Claimed`,
            )
            .setColor(0xff5555) // fixed red
            .setFooter({ text: "Not Claimed" })
            .setTimestamp(new Date());
        if (profilePic) embedRequest.setThumbnail(profilePic);

        // Embed 2 → #rank-order-logs
        const embedLog = new EmbedBuilder()
            .setTitle(`Rank Payment for ${username} | ${orderNumber}`)
            .setDescription(
                `**Username:** ${username} [[Profile Link]](https://www.roblox.com/users/${userId}/profile)\n` +
                    `**Order Number:** ${orderNumber}\n` +
                    `**Current Rank:** ${currentRank}\n` +
                    `**Requested Rank:** ${rankData.prefix} ${rankData.name}\n` +
                    `**Payment Price:** R$ ${formattedPrice}`,
            )
            .setColor(rankData.color)
            .setFooter({ text: "Ranking Center" })
            .setTimestamp(new Date());
        if (profilePic) embedLog.setThumbnail(profilePic);

        // Embed 3 → placeholder for future channel
        const embedOther = new EmbedBuilder()
            .setTitle(`Extra Log for ${username} | ${orderNumber}`)
            .setDescription(`Reserved for future use`)
            .setColor(0xaaaaaa)
            .setTimestamp(new Date());

        try {
            const channelReq =
                await client.channels.fetch(CHANNEL_RANK_REQUEST);
            await channelReq.send({ embeds: [embedRequest] });

            const channelLogs = await client.channels.fetch(CHANNEL_ORDER_LOGS);
            await channelLogs.send({ embeds: [embedLog] });

            // Save to DB
            const orderEntry = {
                orderNumber,
                userId,
                username,
                currentRank,
                requestedRankKey,
                requestedRankName: rankData.name,
                profilePic,
                status: "Not Claimed",
                timestamp: new Date().toISOString(),
            };
            orderDB.push(orderEntry);
            saveOrderDB();

            res.json({ success: true, orderNumber });
        } catch (err) {
            console.error("Failed to send embeds:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    app.get("/", (req, res) => res.send("Bot is alive!"));

    client.once("ready", () => {
        console.log(`Bot logged in as ${client.user.tag}`);
        app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
    });

    client.login(TOKEN);
};
