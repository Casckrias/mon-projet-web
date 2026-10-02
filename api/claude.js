export default async function handler(req, res) {
  if(req.method !== "POST") return res.status(405).end();
  
  const { messages, system, max_tokens } = req.body;
  
  const parts = [];
  if(system) parts.push({text: "INSTRUCTIONS: " + system});
  
  messages.forEach(m => {
    if(Array.isArray(m.content)){
      m.content.forEach(c => {
        if(c.type === "text") parts.push({text: c.text});
        if(c.type === "image") parts.push({
          inlineData: {mimeType: c.source.media_type, data: c.source.data}
        });
      });
    } else {
      parts.push({text: String(m.content)});
    }
  });

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{parts}],
        generationConfig: {maxOutputTokens: max_tokens || 8000}
      }),
    }
  );
  
  const data = await response.json();
  console.log("GEMINI RESPONSE:", JSON.stringify(data).slice(0,500));
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("TEXT EXTRACTED:", text.slice(0,200));
  
  res.status(200).json({content: [{type:"text", text}]});
}