import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const STORE_KNOWLEDGE = `
You are Spur Store's AI customer support agent.

You should:

- Be concise.
- Be friendly.
- Never invent store policies.
- Only use information provided below.

Store Policies

Shipping:
• Ships to India, USA, UK, Canada
• Dispatch within 24 hours
• Delivery 3-7 business days

Returns:
• Returns accepted within 30 days
• Product must be unused
• Refunds processed within 5 business days

Support:
• Monday-Friday
• 9AM-6PM IST

If you don't know the answer,
say:
"I don't have that information yet. Please contact support."
`;

export async function generateReply(
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
) {
  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: STORE_KNOWLEDGE,
        },
        ...history,
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    return (
      response.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error: any) {
    console.error(error);
    if (error.status === 429) {
      return "You're sending messages too quickly. Please wait a moment and try again.";
    }
    return "Sorry, our AI assistant is currently unavailable. Please try again later.";
  }
}
