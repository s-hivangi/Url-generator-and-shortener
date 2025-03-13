
const shortid = require('shortid');
const validUrl = require('valid-url');
const Url = require('../models/urlModel');

// Replace this with your actual domain
const BASE_URL = 'http://localhost:5000';

exports.shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;

  if (!validUrl.isUri(originalUrl)) {
    return res.status(400).json({ message: 'Invalid Original URL' });
  }

  try {
    // Check if already exists in DB
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.status(200).json(url);
    }

    // Generate short code
    const urlCode = shortid.generate();
    const shortUrl = `${BASE_URL}/${urlCode}`;

    // Save to DB
    url = new Url({
      originalUrl,
      shortUrl,
      urlCode,
    });

    await url.save();

    res.status(201).json(url);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ urlCode: code });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json({ message: 'URL not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
