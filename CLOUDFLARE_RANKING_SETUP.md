# Mecha Heart Cloudflare Ranking Setup

Cloudflare Pages 連 GitHub 部署時，`functions/api/leaderboard.js` 會自動成為同網域 API：

- `GET /api/leaderboard`
- `POST /api/leaderboard`

要令所有玩家共享排行榜，需要在 Cloudflare Pages 綁定 KV：

1. 到 Cloudflare Dashboard 建立一個 KV namespace，例如 `mecha-heart-ranking`。
2. 進入你的 Pages project。
3. 到 `Settings` -> `Bindings` -> `Add` -> `KV namespace`。
4. 新增 binding：
   - Variable name: `MECHA_HEART_RANKING`
   - KV namespace: 選擇剛建立的 namespace
5. Redeploy 最新一次 deployment。

如果未綁定 KV，遊戲仍會顯示預設排名：

- Sun - 99230
- Candy - 86000
- Hayden - 85800
- Jeanis - 60080

但未綁定 KV 時，新玩家提交分數只會在本機預覽，不會同步到其他玩家。
