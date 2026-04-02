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
    const { messages, mood: currentMood } = await req.json();

    const apiKey = process.env.mistral_api_key || process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Mistral API key not configured in .env' },
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

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: newMood === 'hostile' ? 0.95 : 0.7, // more creative when roasting
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch from Mistral API');
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
