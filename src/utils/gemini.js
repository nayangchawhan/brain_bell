// src/utils/gemini.js

export async function generateContent(prompt) {
  const apiKey = 'AIzaSyCGkiWXnho1GdadfInKnblARPm-RXLu9FU'; // 🔁 Replace with your real API key

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || 'Invalid response';
  } catch (error) {
    console.error('Gemini fetch error:', error);
    throw error;
  }
}
