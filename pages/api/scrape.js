

import axios from 'axios';
import * as cheerio from 'cheerio';

const EBAY_SEARCH_URL = (query) =>
  `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}&LH_Sold=1&LH_Complete=1`;

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    const { data: html } = await axios.get(EBAY_SEARCH_URL(q), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);
    const prices = [];

    $('li.s-item').each((_, el) => {
      const priceText = $(el).find('.s-item__price').first().text();
      const price = parseFloat(
        priceText.replace(/[$,]/g, '').split(' ')[0]
      );
      if (!isNaN(price)) {
        prices.push(price);
      }
    });

    if (!prices.length) {
      return res.status(404).json({ error: 'No prices found' });
    }

    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const marketPrice = average * 0.8;
    const resalePrice = marketPrice * 1.2;

    res.status(200).json({
      averagePrice: average,
      marketPrice,
      resalePrice,
      itemCount: prices.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch eBay data', details: err.message });
  }
}
