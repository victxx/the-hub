import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
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

// Example content for when the API fails
const FALLBACK_CONTENT: Record<string, StoryResponse> = {
  "step1": {
    "narrative": "> SYSTEM: TRIAL INITIATED\n\nYou awaken in a dark cave. Heat radiates from the stone walls. You have no memory of how you got here.\n\nA voice speaks from nowhere: \"The trial begins now. You must escape before the flames consume everything.\"",
    "optionA": "Move toward the light",
    "optionB": "Feel along the wall",
    "outcome": "continue"
  },
  "step2a": {
    "narrative": "> ALERT: DANGER AHEAD\n\nAs you move toward the light, you notice it's not sunlight but a wall of fire blocking your path. The flames dance strangely, almost as if they're aware of your presence.\n\nBeyond the fire, you can make out what looks like a figure standing perfectly still.",
    "optionA": "Try to pass through fire",
    "optionB": "Call out to the figure",
    "outcome": "continue"
  },
  "step2b": {
    "narrative": "> WARNING: ANCIENT MARKINGS\n\nYour hands trace strange symbols carved into the stone wall. They begin to glow faintly at your touch, illuminating a narrow passage you didn't see before.\n\nAt the end of the passage sits a stone altar. A mask made of bone rests on top of it.",
    "optionA": "Put on the mask",
    "optionB": "Ignore altar and continue",
    "outcome": "continue"
  },
  "step3a": {
    "narrative": "> STATUS: PATH DIVERGES\n\nYou've made it through the flames with only minor burns. The heat tested your resolve, but you passed. The fire wall has disappeared behind you.\n\nThe path now splits in two directions. One leads upward toward a faint breeze, the other downward where you hear strange whispers.",
    "optionA": "Follow the breeze upward",
    "optionB": "Investigate the whispers",
    "outcome": "continue"
  },
  "step3b": {
    "narrative": "> ENCOUNTER: ANCIENT GUARDIAN\n\nThe figure turns to face you. It's not human, but a guardian of some kind with eyes that glow like burning coals. It speaks in a language you somehow understand.\n\n\"Choose your path, seeker. One leads to salvation, one to destruction.\" It gestures to two tunnels - one glowing red with heat, one eerily cold.",
    "optionA": "Take the hot tunnel",
    "optionB": "Take the cold tunnel",
    "outcome": "continue"
  },
  "step4a": {
    "narrative": "> SYSTEM: FINAL CHALLENGE\n\nYour path has led you to what appears to be the final chamber. A massive stone gate blocks your exit, and a silent guardian stands before it.\n\nAt the guardian's feet lie two objects: an ancient key and a ceremonial blade. You sense that your choice here will determine your fate.",
    "optionA": "Take and use the key",
    "optionB": "Take and use the blade",
    "outcome": "continue"
  },
  "step4b": {
    "narrative": "> ALERT: DECISION POINT\n\nYou've reached a large chamber that seems to be the heart of this trial. Ancient markings cover the walls, and you feel a presence watching your every move.\n\nBefore you stand two doors - one marked with a symbol of fire, one with a symbol of darkness. Your instincts tell you this is your final choice.",
    "optionA": "Choose the fire door",
    "optionB": "Choose the darkness door",
    "outcome": "continue"
  },
  "step5a": {
    "narrative": "> SYSTEM: TRIAL COMPLETED\n\nThe key fits perfectly in the lock. As you turn it, the guardian bows and crumbles to dust. The gate swings open, revealing daylight beyond.\n\nYou've passed the Trial of Fire. The voice speaks one last time: \"You have proven worthy. Go forth with new wisdom.\"",
    "optionA": "Step into the light",
    "optionB": "Take a moment to reflect",
    "outcome": "escaped"
  },
  "step5b": {
    "narrative": "> SYSTEM: TRIAL FAILED\n\nAs soon as you make your choice, you know it's wrong. The ground trembles and begins to break apart beneath your feet. Intense heat rushes up from below.\n\n\"The trial reveals true nature,\" the voice says as the cave begins to collapse. \"Yours was not the path of wisdom.\"",
    "optionA": "Accept your fate",
    "optionB": "Make one last desperate attempt",
    "outcome": "death"
  }
};

// Store message history for each session (in memory)
const conversationHistory = new Map<string, {
  step: number;
  lastChoice: string | null;
  narrativeHistory: string[];
  choiceHistory: string[];
}>();

export async function POST(req: NextRequest) {
  try {
    const { sessionId, action } = await req.json();
    
    // Create or retrieve conversation for this session
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
    
    // Handle different actions
    if (action === 'start') {
      // Start a new story - Step 1
      conversation.step = 1;
      conversation.lastChoice = null;
      conversation.narrativeHistory = [];
      conversation.choiceHistory = [];
      response = FALLBACK_CONTENT.step1;
    } else if (action === 'optionA' || action === 'optionB') {
      // User chose an option
      conversation.step += 1;
      conversation.lastChoice = action === 'optionA' ? 'A' : 'B';
      
      // Save the current response in history if there's a previous one
      if (response) {
        conversation.narrativeHistory.push(response.narrative);
        conversation.choiceHistory.push(action === 'optionA' ? response.optionA : response.optionB);
      }
      
      // FORCE ENDING after step 8
      if (conversation.step > 8) {
        const endingKey = Math.random() > 0.5 ? 'step5a' : 'step5b';
        response = FALLBACK_CONTENT[endingKey];
      } else {
        // Determine fallback response based on current step and choice
        const nextStepKey = `step${conversation.step}${conversation.lastChoice === 'A' ? 'a' : 'b'}`;
        
        // Safely access the fallback content
        response = FALLBACK_CONTENT[nextStepKey] || 
                  (conversation.step <= 8 ? FALLBACK_CONTENT[`step${conversation.step}a`] : FALLBACK_CONTENT.step5a);
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Try to get a response from OpenAI if we have the API key
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      try {
        // Try with real OpenAI, but with a time limit
        const timeout = new Promise((resolve) => {
          setTimeout(() => {
            resolve({ timedOut: true });
          }, 5000); // 5 seconds timeout
        });
        
        // Build complete story context for OpenAI
        const narrativeContext = conversation.narrativeHistory.length > 0 
          ? "Previous narrative:\n" + conversation.narrativeHistory.join("\n\n") 
          : "";
        
        const choiceContext = conversation.choiceHistory.length > 0
          ? "Previous choices:\n" + conversation.choiceHistory.join("\n")
          : "";
        
        // FORCE ENDING after step 5
        let forceEnding = "";
        if (conversation.step >= 8) {
          forceEnding = "THIS IS THE FINAL STEP. The story MUST end here with either 'escaped' or 'death' as the outcome.";
        }
        
        const openAIPromise = openai.chat.completions.create({
          model: "gpt-4.1",
          messages: [
            {
              role: "system",
              content: `You are an ancient, mysterious voice narrating a test known as the **Trial of Fire**.

STORY FORMAT GUIDELINES:
1. Write in CLEAR, SIMPLE SENTENCES with normal punctuation and structure.
2. Start with a terminal prefix like "> SYSTEM:" or "> ALERT:".
3. Write 2-3 short paragraphs of natural text. NO disjointed fragments or comma-separated lists.
4. Keep choices clear and straightforward (4-6 words each).
5. Use direct, simple language a real person would use.
6. Focus on concrete details: heat, light, sound, etc.
7. Maintain a tense, mysterious atmosphere but with NORMAL sentence structure.
8. Continue plot elements from previous segments.
9. If you introduce a character or element, follow through with it in subsequent steps.
10. The story should feel like a normal adventure game, not a poem or robotic log.
11. VERY IMPORANT IF SOME CREATURE OR OBJECT APPEAR DURING THE NARRATIVE PLEASE, KEEP IT, IF ONE BEAST APPEARS AND THREATS, IT WILL MAKE SOMETHING IN THE NEXT DECISSION, KILLING, BEING NICE, SAVING, GIVE A PRESENT... WHATEVER BUT KEEP IT GOING.

YOU MUST START THE FIRST STEP WITH:
"> SYSTEM: TRIAL INITIATED
  
You awaken in a dark cave. Heat radiates from the stone walls. You have no memory of how you got here.

A voice speaks from nowhere: 'The trial begins now. You must escape before the flames consume everything.'"

${forceEnding}

The player is on step ${conversation.step} out of 8 maximum steps. ${conversation.lastChoice ? `They chose option ${conversation.lastChoice}.` : ''}

${narrativeContext}

${choiceContext}

Format response as JSON only with this structure:

{
  "narrative": "Your normal, readable narrative with a terminal prefix",
  "optionA": "First choice (4-6 words)",
  "optionB": "Second choice (4-6 words)",
  "outcome": "${conversation.step >= 8 ? 'escaped or death' : 'continue'}"
}`
            },
            {
              role: "user",
              content: `Generate step ${conversation.step} of the Trial of Fire narrative.${conversation.lastChoice ? ` The player chose option ${conversation.lastChoice}.` : ''} Write it like a normal adventure game text, not a poem or list of fragments.`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        });
        
        // Use Promise.race to implement the timeout
        const result = await Promise.race([openAIPromise, timeout]) as any;
        
        if (!result.timedOut) {
          const content = result.choices[0].message.content;
          if (content) {
            const parsedResponse = JSON.parse(content) as StoryResponse;
            
            // Force final result at step 5
            if (conversation.step >= 5) {
              if (parsedResponse.outcome !== 'escaped' && parsedResponse.outcome !== 'death') {
                parsedResponse.outcome = Math.random() > 0.5 ? 'escaped' : 'death';
              }
            }
            
            response = parsedResponse;
          }
        }
      } catch (error) {
        console.error("Error with OpenAI, using fallback response:", error);
        // If OpenAI fails, we continue with the fallback response
      }
    }
    
    // If we don't have a response for some reason, use a default response
    if (!response) {
      response = {
        narrative: "> SYSTEM: CONNECTION UNSTABLE\n\nThe cave trembles slightly around you. The path ahead is unclear, but you can sense that time is running out.\n\nSomething in the back of your mind warns you that you need to make a choice quickly before the situation gets worse.",
        optionA: "Move forward cautiously",
        optionB: "Look for another path",
        outcome: conversation.step >= 8 ? (Math.random() > 0.5 ? 'escaped' : 'death') : 'continue'
      };
    }
    
    // Update history
    conversationHistory.set(sessionId, conversation);
    
    // Return response in the format expected by the client
    return NextResponse.json({
      narrative: response.narrative,
      options: [
        { text: response.optionA },
        { text: response.optionB }
      ],
      outcome: response.outcome
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Endpoint to check if the ending is successful
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const outcome = url.searchParams.get('outcome');

  if (!outcome) {
    return NextResponse.json({ error: 'Missing outcome parameter' }, { status: 400 });
  }

  // Determine if the player has escaped based on the outcome
  const success = outcome === 'escaped';
  
  return NextResponse.json({ success });
} 
