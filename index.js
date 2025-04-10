import axios from 'axios';

const TOPHUB_API = 'https://api.tophubdata.com';
const API_KEY = process.env.TOPHUB_API_KEY;

export default async function handler(req, res) {
  try {
    const nodesRes = await axios.get(`${TOPHUB_API}/nodes`, {
      headers: { Authorization: API_KEY }
    });

    const nodes = nodesRes.data.data;

    // Debug 專用：回傳所有榜單名稱與 hashid
    const debugList = nodes.map(n => ({
      name: n.name,
      hashid: n.hashid
    }));

    res.status(200).json({
      total: debugList.length,
      list: debugList
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '处理失败' });
  }
}
