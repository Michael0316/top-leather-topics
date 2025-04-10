import axios from 'axios';

const TOPHUB_API = 'https://api.tophubdata.com';
const API_KEY = process.env.TOPHUB_API_KEY;

const KEYWORDS = [
  '皮革', '高定家具', '高定沙发', '家具', '皮沙发', '软装', '设计',
  '全青皮', '牛皮', '苯染皮', '半苯染', '修面涂料', '半青皮', '苯胺', '半苯胺'
];

const TARGET_PLATFORMS = ['微博', '视频号', '公众号', '小红书', '抖音', '知乎'];

export default async function handler(req, res) {
  try {
    const nodesRes = await axios.get(`${TOPHUB_API}/nodes`, {
      headers: { Authorization: API_KEY }
    });

    const nodes = nodesRes.data.data;
    const hashids = nodes
      .filter(n => TARGET_PLATFORMS.includes(n.name))
      .map(n => ({ name: n.name, hashid: n.hashid }));

    let allItems = [];

    for (const { name, hashid } of hashids) {
      const detailRes = await axios.get(`${TOPHUB_API}/nodes/${hashid}`, {
        headers: { Authorization: API_KEY }
      });

      const items = detailRes.data.data.items || [];
      const filtered = items
        .filter(i => KEYWORDS.some(kw => i.title.includes(kw)))
        .map(i => {
          const hotText = i.extra || '';
          const match = hotText.match(/([\d.]+)\s*万?/);
          let hotValue = match ? parseFloat(match[1]) : 0;
          if (hotText.includes('万')) hotValue *= 10000;

          return {
            title: i.title,
            url: i.url,
            source: name,
            hotValue
          };
        });

      allItems = allItems.concat(filtered);
    }

    allItems.sort((a, b) => b.hotValue - a.hotValue);
    const top10 = allItems.slice(0, 10);

    res.status(200).json({ topics: top10 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '处理失败' });
  }
}

// trigger redeploy
