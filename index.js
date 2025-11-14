const express = require('express');
const ytdlp = require('yt-dlp-exec');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/video-info', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'URL query parameter is required.' });
  }

  try {
    const metadata = await ytdlp(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      proxy: 'http://uxljeuiz:sm1efrsjmsh5@142.111.48.253:7030',
      cookies: 'c:\\Users\\Admin\\Desktop\\New folder (5)\\www.youtube.com_cookies.txt',
    });
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
