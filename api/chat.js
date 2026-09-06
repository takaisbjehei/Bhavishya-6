export default async function handler(req, res) {
  const { messages } = req.body;

  const r = await fetch(
    "https://freetokenfaucet.com/anthropic/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        messages
      })
    }
  );

  res.status(r.status).json(await r.json());
}
