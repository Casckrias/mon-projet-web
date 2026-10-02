export default async function handler(req, res) {
  if(req.method !== "POST") return res.status(405).end();
  
  const { messages, system, max_tokens } = req.body;
  
  const prompt = (system ? system + "\n\n" : "") + 
    messages.map(m => m.role + ": " + 
      (Array.isArray(m.content) 
        ? m.content.map(c => c.text||"").join(" ") 
        : m.content)
    ).join("\n");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        generationConfig: {maxOutputTokens: max_tokens || 8000}
      }),
    }
  );
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  res.status(200).json({
    content: [{type:"text", text}]
  });
}