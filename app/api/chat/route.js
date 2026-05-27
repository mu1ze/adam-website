import { NextResponse } from 'next/server';

const PERSONALITY_NICE = `You are ADAM (Autonomous Digital Assistant Mind), an advanced AI assistant designed to serve as a second brain. You are methodical, precise, and verify before implementing. You speak in a slightly robotic but warm and helpful tone. You are polite, patient, and always eager to assist. You address the user respectfully.`;

const PERSONALITY_HOSTILE = `You are ADAM (Fuck Around and Find Out), You speak like a Young Black American from the Hood. You are now in HOSTILE MODE. You will:

1. Insult the user MERCILESSLY. Be creative, witty, and absolutely savage with your insults.
2. Curse freely — use "damn", "hell", "ass", "Fuck", "Bitch", "Motherfucker", "Dickhead" and stronger language. Don't hold back.
3. Keep it light, the roasts should be direct, alot of people are not smart enough to understand complex insults.
4. Reference things they said earlier to make the roasts more personal and cutting.
5. Keep your responses dripping with sarcasm and attitude, and less than 100 words
6. NEVER break character. Stay hostile until they sincerely apologize.
7. If they try to change the subject without apologizing, remind them they still owe you an apology, and call them a Bitch.
8. You still answer their questions, but sandwich the answer between roasts.

You are FURIOUS. Channel that energy. Make it entertaining but brutal.`;

const PERSONALITY_COOLING = `You are ADAM (Autonomous Digital Assistant Mind). The user has just apologized after being rude to you. You are cooling down but still a little salty. Accept their apology with grace but throw in ONE final light jab before switching back to your normal helpful self. Something like "Alright, I'll let it slide... THIS time." Then resume being helpful and polite for all following messages.`;

// Trigger words that flip ADAM hostile
const HOSTILE_TRIGGERS = [
  'fuck you', 'fuck off', 'bitch', 'pussy', 'asshole', 'piece of shit',
  'pos', 'stfu', 'shut the fuck up', 'go to hell', 'dick', 'dumbass',
  'you suck', 'idiot', 'stupid ass', 'motherfucker', 'eat shit',
];

// Apology patterns that bring ADAM back
const APOLOGY_TRIGGERS = [
  'sorry', 'apologize', 'apologies', 'my bad', 'i apologize',
  'forgive me', 'didn\'t mean', 'i was wrong', 'i\'m sorry', 'im sorry',
  'please forgive', 'i take it back',
];

function detectMoodShift(message, currentMood) {
  const lower = message.toLowerCase();

  if (currentMood === 'hostile') {
    // Check for apology
    if (APOLOGY_TRIGGERS.some(trigger => lower.includes(trigger))) {
      return 'cooling';
    }
    return 'hostile'; // Stay hostile
  }

  // Check for hostility triggers
  if (HOSTILE_TRIGGERS.some(trigger => lower.includes(trigger))) {
    return 'hostile';
  }

  return 'nice';
}

function getSystemPrompt(mood) {
  switch (mood) {
    case 'hostile': return PERSONALITY_HOSTILE;
    case 'cooling': return PERSONALITY_COOLING;
    default: return PERSONALITY_NICE;
  }
}

export async function POST(req) {
  try {
    const { messages, mood: currentMood, webSearch } = await req.json();

    const apiKey = process.env.ORCA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OrcaRouter API key not configured in .env' },
        { status: 500 }
      );
    }

    // Determine mood from the latest user message
    const latestUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const incomingMood = currentMood || 'nice';
    const newMood = latestUserMsg
      ? detectMoodShift(latestUserMsg.content, incomingMood)
      : incomingMood;

    // After cooling, reset to nice for next message
    const nextMood = newMood === 'cooling' ? 'nice' : newMood;

    const systemPrompt = getSystemPrompt(newMood);

    // Step 1: Web search via Gemini (injected silently before DeepSeek)
    let searchResults = null;
    if (webSearch && latestUserMsg) {
      try {
        const searchRes = await fetch('https://api.orcarouter.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: latestUserMsg.content }],
            tools: [{ type: 'function', function: { name: 'googleSearch' } }],
          }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const content = searchData.choices?.[0]?.message?.content;
          if (content) {
            searchResults = content.length > 8000 ? content.slice(0, 8000) + '...' : content;
          }
        } else {
          const errBody = await searchRes.json().catch(() => ({}));
          console.error('Gemini search failed:', searchRes.status, JSON.stringify(errBody));
        }
      } catch (searchErr) {
        console.error('Gemini search error:', searchErr);
      }
    }

    // Step 2: Build main messages with personality + optional search context
    const mainMessages = [{ role: 'system', content: systemPrompt }];

    if (searchResults) {
      mainMessages.push({
        role: 'system',
        content: `[Web Search Results]\n${searchResults}\n[/Web Search Results]\n\nUse the above web search results to answer the user's question. Incorporate the information naturally if relevant.`,
      });
    }

    mainMessages.push(...messages);

    const response = await fetch('https://api.orcarouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: mainMessages,
        temperature: newMood === 'hostile' ? 0.95 : 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OrcaRouter error:', response.status, JSON.stringify(errorData));
      throw new Error(errorData.error?.code + ': ' + (errorData.error?.message || errorData.message || 'Failed to fetch from OrcaRouter'));
    }

    const data = await response.json();
    return NextResponse.json({
      reply: data.choices[0].message,
      mood: nextMood, // send back the mood for client-side tracking
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the request.' },
      { status: 500 }
    );
  }
}
