import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Support either MISTRAL_API_KEY or mistral_api_key
    const apiKey = process.env.mistral_api_key || process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Mistral API key not configured in .env' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest', // or mistral-large-latest / open-mistral-7b
        messages: [
          {
            role: 'system',
            content: 'You are ADAM (Autonomous Digital Assistant Mind), an advanced AI assistant designed to serve as a second brain. You are methodical, precise, and verify before implementing. You speak in a slightly robotic but helpful tone.'
          },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch from Mistral API');
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the request.' },
      { status: 500 }
    );
  }
}
