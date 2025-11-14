const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message) => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/;
    const match = message.body.match(youtubeRegex);

    if (match) {
        const videoUrl = match[0];
        try {
            message.reply('Fetching video information, please wait...');
            const response = await axios.get(`http://localhost:3000/video-info?url=${encodeURIComponent(videoUrl)}`);
            const videoData = response.data;

            let reply = `*Title:* ${videoData.title}\n\n`;
            reply += '*Available Formats:*\n';

            // Filter for formats that are likely to be useful for the user
            const usefulFormats = videoData.formats.filter(f => f.resolution && (f.filesize || f.filesize_approx)).reverse();

            // Remove duplicate resolutions, keeping the best quality (first one after reverse)
            const uniqueFormats = [];
            const resolutions = new Set();
            for (const format of usefulFormats) {
                if (!resolutions.has(format.resolution)) {
                    uniqueFormats.push(format);
                    resolutions.add(format.resolution);
                }
            }

            uniqueFormats.forEach(format => {
                let size = 'N/A';
                if (format.filesize) {
                    size = `${(format.filesize / 1024 / 1024).toFixed(2)} MB`;
                } else if (format.filesize_approx) {
                    size = `~${(format.filesize_approx / 1024 / 1024).toFixed(2)} MB`;
                }

                reply += `\n- *Resolution:* ${format.height}p\n`;
                reply += `  *Size:* ${size}\n`;
                reply += `  *Format:* ${format.ext}\n`;
                if (format.acodec === 'none') {
                    reply += `  *(Video Only)*\n`;
                }
            });

            if (uniqueFormats.length === 0) {
                reply += 'Could not find downloadable formats with size information.';
            }

            message.reply(reply);
        } catch (error) {
            console.error('Error handling youtube link:', error);
            message.reply('Sorry, I could not process the YouTube link. Make sure the local API is running.');
        }
    }
});

client.initialize();
