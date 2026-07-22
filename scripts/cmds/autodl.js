  },

  handleDownload: async function (url, api, event, message) {
    const { messageID } = event;
    const start = Date.now();

    try {
      if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);

      const res = await axios.get(`https://xalman-apis.vercel.app/api/alldl?url=${encodeURIComponent(url)}`);
      const resData = res.data;

      // Smart Parsing: Looks for URL and Title in multiple possible locations
      const resultObj = resData.result || {};
      const nestedData = resultObj.data || {};

      // Priority list for video URL and Title
      const videoUrl = resultObj.url || resultObj.video_url || nestedData.url || nestedData.video_url || nestedData.hd;
      const title = resultObj.title || nestedData.title || resultObj.description || "No Title";
      const platform = resData.detected_platform || "Social Media";

      if (!videoUrl) throw new Error("Could not find a valid video URL.");
      
      const stream = await axios.get(videoUrl, { 
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const time = ((Date.now() - start) / 1000).toFixed(2);
      const xalmanBody = 
        `『 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📝 𝗧𝗶𝘁𝗹𝗲: ${title.slice(0, 60)}${title.length > 60 ? "..." : ""}\n` +
        `🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform.toUpperCase()}\n` +
        `⏱️ 𝗧𝗶𝗺𝗲: ${time}s\n` +
        `👨‍💻 Dev: xalman\n` +
        `━━━━━━━━━━━━━━━━━━`;

      await message.reply({
        body: xalmanBody,
        attachment: stream.data
      });

      if (api.setMessageReaction) api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (e) {
      console.error("Download Error:", e.message);
      if (api.setMessageReaction) api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
