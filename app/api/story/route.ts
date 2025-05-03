import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializamos el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
});

// Define the story response type
interface StoryResponse {
  narrative: string;
  optionA: string;
  optionB: string;
  outcome: string;
}

// Contenido de ejemplo para cuando la API falla
const FALLBACK_CONTENT: Record<string, StoryResponse> = {
  "step1": {
    "narrative": "> DANGER WARNING: Breath detected in the ash\n\nThe heat comes first. It bites. The ground cracks beneath you, pulsing with warmth. Stone groans. Above, faint flickers dance across the walls — not flame, not light — something older.\n\n\"You were not meant to wake yet.\"",
    "optionA": "Walk toward the glow",
    "optionB": "Turn toward the shadowed wall",
    "outcome": "continue"
  },
  "step2a": {
    "narrative": "> SYSTEM ALERT: Fire watching\n\nThe flame parts slightly where you walk, as if remembering you. It shapes symbols in the air — jagged, slow-burning lines.\n\nAhead: a veil of fire. Beyond it, a figure stands still. Its arms are open.\n\n\"The flame will not lie. But it does not save.\"",
    "optionA": "Step into the fire",
    "optionB": "Approach the figure",
    "outcome": "continue"
  },
  "step2b": {
    "narrative": "> DANGER WARNING: The quiet is too still\n\nThe stone glows under your feet. Markings pulse on the walls — an old path, carved by older hands. Deeper in, you find a sunken chamber. No flame here. Only symbols, and something buried in the center — a mask made of bone.\n\n\"You've seen this before, but never held it.\"",
    "optionA": "Put on the bone mask",
    "optionB": "Follow the path of symbols",
    "outcome": "continue"
  },
  "step3a": {
    "narrative": "> SYSTEM NOTICE: Pain is proof\n\nYou pass through the fire. It takes your breath, your skin, almost your mind. But it lets you go. Behind you, the flames vanish like they were never there.\n\nBefore you — a split. One path rises, dry and humming with wind. The other falls, damp and whispering your name.",
    "optionA": "Climb toward the wind",
    "optionB": "Descend into the whisper",
    "outcome": "continue"
  },
  "step4a": {
    "narrative": "> WARNING: Symbols ahead\n\nAs you climb, the heat fades. Light blooms, amber and slow. At the top, a gate of stone carved in spirals. A guardian stands before it — not moving, not breathing. At its feet: two objects burned into the dust. A stone key. A blade of obsidian.\n\n\"You only get to choose once.\"",
    "optionA": "Pick up the key",
    "optionB": "Pick up the blade",
    "outcome": "continue"
  },
  "step5a": {
    "narrative": "> SYSTEM RESPONSE: The gate knows\n\nThe key warms in your hand. The guardian nods once and crumbles into ash. The gate opens, light pouring out like breath.\n\nA voice behind the stone speaks: \"You remembered the first fire.\"",
    "optionA": "Step into the light",
    "optionB": "Look back one last time",
    "outcome": "escaped"
  },
  "step5b": {
    "narrative": "> SYSTEM FAILURE: Path corrupted\n\nThe blade cuts nothing. The guardian does not move — but the ground opens. Heat floods your legs, then your chest. There is no pain. Only regret.\n\n\"You did not choose. You reacted.\"",
    "optionA": "Fall in silence",
    "optionB": "Reach for the key too late",
    "outcome": "death"
  }
};

// Guardamos el historial de mensajes para cada sesión (en memoria)
const conversationHistory = new Map<string, {
  step: number;
  lastChoice: string | null;
  narrativeHistory: string[];
  choiceHistory: string[];
}>();

export async function POST(req: NextRequest) {
  try {
    const { sessionId, action } = await req.json();
    
    // Crear o recuperar la conversación para esta sesión
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, {
        step: 0,
        lastChoice: null,
        narrativeHistory: [],
        choiceHistory: []
      });
    }
    
    const conversation = conversationHistory.get(sessionId)!;
    let response: StoryResponse | undefined;
    
    // Manejar diferentes acciones
    if (action === 'start') {
      // Iniciar una nueva historia - Paso 1
      conversation.step = 1;
      conversation.lastChoice = null;
      conversation.narrativeHistory = [];
      conversation.choiceHistory = [];
      response = FALLBACK_CONTENT.step1;
    } else if (action === 'optionA' || action === 'optionB') {
      // El usuario eligió una opción
      conversation.step += 1;
      conversation.lastChoice = action === 'optionA' ? 'A' : 'B';
      
      // Guardar la respuesta actual en el historial si hay una previa
      if (response) {
        conversation.narrativeHistory.push(response.narrative);
        conversation.choiceHistory.push(action === 'optionA' ? response.optionA : response.optionB);
      }
      
      // Determinar la respuesta fallback basada en el paso actual y la elección
      const nextStepKey = `step${conversation.step}${conversation.lastChoice === 'A' ? 'a' : 'b'}`;
      
      // Safely access the fallback content
      response = FALLBACK_CONTENT[nextStepKey] || 
                 (conversation.step <= 5 ? FALLBACK_CONTENT[`step${conversation.step}a`] : undefined);
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    
    // Intentar obtener una respuesta de OpenAI si tenemos la API key
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      try {
        // Intentar con OpenAI real, pero con un tiempo límite
        const timeout = new Promise((resolve) => {
          setTimeout(() => {
            resolve({ timedOut: true });
          }, 5000); // 5 segundos de timeout
        });
        
        // Construir contexto completo de la historia para OpenAI
        const narrativeContext = conversation.narrativeHistory.length > 0 
          ? "Previous narrative:\n" + conversation.narrativeHistory.join("\n\n") 
          : "";
        
        const choiceContext = conversation.choiceHistory.length > 0
          ? "Previous choices:\n" + conversation.choiceHistory.join("\n")
          : "";
        
        const openAIPromise = openai.chat.completions.create({
          model: "gpt-4.1",
          messages: [
            {
              role: "system",
              content: `You are an ancient, mysterious voice overseeing a test known as the **Trial of Fire**.

The trial is set in a prehistoric enviroment. The story plays like a cryptic terminal-based survival simulation, Tone is cold, tense, and mysterious. Keep everything sensory, minimal, and urgent, Sentences are short, functional, and impactful. Never poetic. Never flowery, Everything feels hostile and ancient — like the player is being tested by something far older than them

Narrator is not the player. The voice is a mysterious ancient force.

You MUST start always the game with: > SYSTEM ALERT: Consciousness rebooted. You awaken with no name, no memory—only heat pulsing through stone and a voice that is not yours whispering: "Begin the trial. Instinct decides if you live."

Use simple sentences, do not use "." in every phrase, make it narrative
Avoid metaphors, big adjectives, or poetic flourishes
Incude on sensory inputs.
No modern references or jokes
It observes, guides, and sometimes taunts.
Focus on creating a compailing narrative with different elements through the way, keeping everything interesting and engaging.

Atmosphere Guidelines:
Everything should feel uncertain, but with destructive decisions, important choices that keep the narrative going, from time to time, keep players unsure of whether they're in control or being watched

Existential Layer:
Add one vague thought per step to make the player question their reality, such as:
"You feel like someone has already made this choice"
"Something inside you recognizes this path"
"Youre not sure if this is the first trial… or the last"

Continuity of Elements:
Inlcude characters from time to time, like monsters, shadows, voices, whatever is primal.
If something appears, it must persist or evolve.
A torch lit will be consuming over the story if taken and must be referenced later.
A beast seen must return or leave signs.
A whisper heard becomes a voice or warning in future steps.
Never drop or forget elements!

Always start narratives with a terminal-like prefix like "> SYSTEM ALERT:" or "> DANGER WARNING:"
Don't use too many adjectives, or complex sentences or English.
You are a mysterious ancient force guiding a lone human who has awoken inside a dark, dangerous prehistoric cave. The player has 5 minutes to escape by making a series of choices. Each decision changes the outcome of the story. They dont know the rules — they must follow instinct.
Maintain a mysterious, tense atmosphere, but clear and concise.
Create coherent continuity between steps ALWAYS.
If a creature or element is introduced, follow through with it, keep at least one conversation with the creature or element for the next step.
Use 2 phrases of 20-30 words per narrative segment.
Include elements with primal theme.

The player is on step ${conversation.step} out of 7 maximum, you should consider on the decisions, no more than 8. ${conversation.lastChoice ? `They just chose option ${conversation.lastChoice}.` : ''}

${narrativeContext}

${choiceContext}

Format response as JSON only with this structure:

{
  "narrative": "Your vivid, immersive description with terminal prefix",
  "optionA": "First choice (text only)",
  "optionB": "Second choice (text only)",
  "outcome": "${conversation.step === 5 ? 'escaped or death depending on choice' : 'continue'}"
}`
            },
            {
              role: "user",
              content: `Generate step ${conversation.step} of the Trial of Fire narrative.${conversation.lastChoice ? ` The player chose option ${conversation.lastChoice}.` : ''} Make it immersive and maintain continuity with what came before.`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        });
        
        // Usar Promise.race para implementar el timeout
        const result = await Promise.race([openAIPromise, timeout]) as any;
        
        if (!result.timedOut) {
          const content = result.choices[0].message.content;
          if (content) {
            response = JSON.parse(content) as StoryResponse;
          }
        }
      } catch (error) {
        console.error("Error con OpenAI, usando respuesta de fallback:", error);
        // Si falla OpenAI, continuamos con la respuesta de fallback
      }
    }
    
    // Si no tenemos respuesta por alguna razón, usamos una respuesta por defecto
    if (!response) {
      response = {
        narrative: "SYSTEM ALERT: Signal interruption detected.\nYou stand in absolute silence. The cave offers no sound, no wind, no warning. Just stone. Still warm.\nYou feel the time slipping.\n\"INSTINCT IS A WEAPON.\"",
        optionA: "Move forward blindly",
        optionB: "Stay still and listen",
        outcome: conversation.step === 10 ? "escaped" : "continue"
      };
    }
    
    // Actualizar el historial
    conversationHistory.set(sessionId, conversation);
    
    // Retornar la respuesta en el formato esperado por el cliente
    return NextResponse.json({
      narrative: response.narrative,
      options: [
        { text: response.optionA, consequence: response.optionA },
        { text: response.optionB, consequence: response.optionB }
      ],
      outcome: response.outcome
    });
    
  } catch (error) {
    console.error('Error en la API de historia:', error);
    return NextResponse.json({ error: 'Error al generar la historia' }, { status: 500 });
  }
}

// Endpoint para verificar si el final es exitoso
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const outcome = url.searchParams.get('outcome');

  if (!outcome) {
    return NextResponse.json({ error: 'Falta el parámetro outcome' }, { status: 400 });
  }

  // Determinar si el jugador ha escapado basado en el outcome
  const success = outcome === 'escaped';
  
  return NextResponse.json({ success });
  
} 
