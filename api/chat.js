export default async function handler(req, res) {
  try {
    const { model, messages = [] } = req.body || {};

    if (!model) {
      return res.status(400).json({
        error: { message: "Model required" }
      });
    }

    const isClaude = model.startsWith("claude-");

    const url = isClaude
      ? "https://freetokenfaucet.com/anthropic/v1/messages"
      : "https://freetokenfaucet.com/openai/v1/chat/completions";

    const headers = {
      "Content-Type": "application/json",
      "Authorization":
        `Bearer ${process.env.ANTHROPIC_API_KEY}`
    };

    if (isClaude) {
      headers["anthropic-version"] = "2023-06-01";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const answer = isClaude
      ? data?.content
          ?.filter(x => x.type === "text")
          .map(x => x.text)
          .join("")
      : data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      answer
    });

  } catch (error) {

    return res.status(500).json({
      error: {
        message: error.message
      }
    });

  }
}
