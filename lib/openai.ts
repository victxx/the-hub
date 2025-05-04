import OpenAI from 'openai';

// Usamos la variable de entorno o, para desarrollo local sin .env, una clave de respaldo
// En producción, siempre usa una variable de entorno en .env.local
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

if (!apiKey) {
  console.error('-');
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

export async function generateStorySegment(
  context: string, 
  currentSituation: string
): Promise<{
  narrative: string;
  options: { text: string; consequence: string }[];
}> {
  // Temporalmente usamos solo datos mock para asegurar que funcione
      return getMockStoryData(currentSituation);
}

export async function isEndingSuccessful(situation: string): Promise<boolean> {
  // Determine success based on keywords in English
  return situation.toLowerCase().includes('escaped') || 
         situation.toLowerCase().includes('exit') || 
         situation.toLowerCase().includes('escape') || 
         situation.toLowerCase().includes('outside') ||
         // Keep Spanish keywords for backward compatibility
         situation.toLowerCase().includes('escapado') || 
         situation.toLowerCase().includes('salida') || 
         situation.toLowerCase().includes('escapar') || 
         situation.toLowerCase().includes('exterior');
}

// Función para proporcionar datos de muestra cuando no hay API key
function getMockStoryData(currentSituation: string): {
  narrative: string;
  options: { text: string; consequence: string }[];
} {
  // Si estamos en la situación inicial
  if (currentSituation.includes("Acabas de entrar a una misteriosa cueva")) {
    return {
      narrative: "> SYSTEM BOOT SEQUENCE INITIATED\n\nThe heat hits you first - a wave of scorching air that makes your skin tingle. Around you, digital flames lick at the edges of reality, casting everything in a flickering orange glow.\n\nThe screen flashes: \"WELCOME TO THE TRIAL OF FIRE. ONLY THE WORTHY SHALL PASS.\"\n\nA warning appears: \"DANGER: Temperature rising to critical levels. Choose your path carefully.\"",
      options: [
        { 
          text: "BRAVE THE FLAMES", 
          consequence: "You step forward, feeling the heat intensify. The digital fire dances around you, almost alive in its movements. As you press on, the path narrows and the temperature continues to rise." 
        },
        { 
          text: "SEEK SHELTER", 
          consequence: "You quickly move toward what appears to be a safer area, where the flames are less intense. The air is still hot, but more bearable here. You notice strange symbols etched into the rock walls." 
        }
      ]
    };
  }
  
  // Si bravamos las llamas
  if (currentSituation.includes("You step forward, feeling the heat intensify")) {
    return {
      narrative: "> THERMAL SYSTEMS: CRITICAL\n\nThe flames rise higher around you, forming patterns that seem almost deliberate. The heat is nearly unbearable, but you notice something strange - the fire parts slightly where you walk, as if testing your resolve.\n\nAhead, a wall of pure flame blocks your path. Through it, you can faintly see what looks like an exit portal.\n\nA terminal flickers nearby, its screen displaying ancient code sequences.",
      options: [
        { 
          text: "DASH THROUGH THE FIRE WALL", 
          consequence: "Taking a deep breath, you sprint directly into the wall of flames. For a moment, there is only searing heat and blinding light. Then, suddenly, cool air - you've made it through! The exit portal glows before you, your escape route now clear. You have escaped." 
        },
        { 
          text: "EXAMINE THE TERMINAL", 
          consequence: "The terminal's screen shows lines of ancient code - a firewall subroutine. As you study it, you realize you might be able to hack it and create a safe passage. Your fingers move across the interface, altering the code structure." 
        }
      ]
    };
  }
  
  // Si examinamos el terminal
  if (currentSituation.includes("The terminal's screen shows lines of ancient code")) {
    return {
      narrative: "> FIREWALL PROTOCOL: BREACHED\n\nAs you finish the last line of code, the terminal emits a series of beeps. The wall of flame before you flickers, parts slightly, creating a narrow corridor of cooler air.\n\nWarning messages flash across the terminal: \"UNAUTHORIZED BYPASS DETECTED. SECURITY PROTOCOLS ENGAGED.\" \n\nThe ground trembles beneath your feet. You have limited time before the system locks down completely.",
      options: [
        { 
          text: "SPRINT THROUGH THE OPENING", 
          consequence: "You dash through the corridor in the flames. The heat licks at your sides but can't touch you. Just as the opening begins to close, you leap through to the other side, landing safely. The exit portal awaits just ahead. You have escaped." 
        },
        { 
          text: "ATTEMPT TO STABILIZE THE BREACH", 
          consequence: "You turn back to the terminal, fingers flying over the interface trying to lock the breach open. A sudden surge of energy from the system overwhelms your attempt. The terminal explodes in a shower of sparks, and the flames rush in from all sides. You have died." 
        }
      ]
    };
  }
  
  // Si buscamos refugio
  if (currentSituation.includes("You quickly move toward what appears to be a safer area")) {
    return {
      narrative: "> SCAN COMPLETE: HIDDEN PATHWAYS DETECTED\n\nThe symbols on the walls begin to glow as you examine them. They seem to be some kind of ancient programming language. The pattern suggests a map or navigation system.\n\nA soft humming emanates from deeper within this sheltered area. Following the sound, you discover a small chamber with a crystal interface floating in the center.\n\nThe interface displays two distinct energy signatures.",
      options: [
        { 
          text: "INTERACT WITH THE CRYSTAL", 
          consequence: "You reach out and touch the crystal interface. It responds to your touch, the energy within it shifting and flowing. A holographic map materializes, showing a hidden path through the Trial of Fire. The crystal cools in your hand, offering protection from the flames." 
        },
        { 
          text: "FOLLOW THE SYMBOLS' GUIDANCE", 
          consequence: "Tracing the pattern of symbols with your eyes, you begin to walk a specific path they seem to indicate. The temperature drops noticeably as you follow this invisible route, carefully stepping from one marked spot to another." 
        }
      ]
    };
  }
  
  // Si interactuamos con el cristal
  if (currentSituation.includes("You reach out and touch the crystal interface")) {
    return {
      narrative: "> THERMAL SHIELD: ACTIVATED\n\nThe crystal melds to your palm, forming a protective gauntlet around your hand. The holographic map projects from it, showing your position and a clear path toward the exit.\n\nArmed with this new protection, you step back into the main chamber. The flames still rage, but now they cannot touch you while you hold the crystal.\n\nThe map indicates two possible routes: a direct path through the most intense flames, or a longer route around the perimeter where the fire is less severe.",
      options: [
        { 
          text: "TAKE THE DIRECT PATH", 
          consequence: "Trusting in the crystal's protection, you stride confidently through the heart of the inferno. The shield holds, keeping you safe as you navigate straight to the exit portal. In minutes, you've reached it - the way out is clear. You have escaped." 
        },
        { 
          text: "CHOOSE THE SAFER PERIMETER", 
          consequence: "You opt for caution, following the longer route around the edge of the chamber. As you're halfway around, the crystal begins to pulse with warning lights. Its power is depleting faster than expected in the extreme heat." 
        }
      ]
    };
  }
  
  // Si elegimos el perímetro más seguro
  if (currentSituation.includes("You opt for caution, following the longer route")) {
    return {
      narrative: "> WARNING: SHIELD INTEGRITY AT 15%\n\nThe crystal gauntlet flickers, its protective field weakening with each step. The map still shows your position, but the display is becoming unstable.\n\nAhead, you can see the exit portal, but between you and it is a final stretch of intense flame. The crystal might not last long enough to protect you all the way through.\n\nTo your left, you notice what appears to be a cooling station - perhaps it could recharge the crystal, but it would mean a detour.",
      options: [
        { 
          text: "MAKE A RUN FOR THE EXIT", 
          consequence: "Deciding there's no time to waste, you sprint toward the exit portal. The crystal's shield flickers and fails just as you reach the wall of flame. You feel the heat sear through you for a brief, terrible moment - then you're through, tumbling out into safety. You have escaped." 
        },
        { 
          text: "DETOUR TO THE COOLING STATION", 
          consequence: "You veer toward the cooling station, hoping to recharge the crystal. As you reach it, the system triggers a lockdown. Steel barriers slam down, trapping you. The flames slowly encroach as the oxygen is systematically removed from your section. You have died." 
        }
      ]
    };
  }
  
  // Si seguimos la guía de los símbolos
  if (currentSituation.includes("Tracing the pattern of symbols with your eyes")) {
    return {
      narrative: "> ANCIENT PATHWAY: DISCOVERED\n\nThe temperature continues to drop as you follow the invisible path. The symbols seem to be guiding you through some kind of safe zone in the Trial of Fire.\n\nAs you continue, you reach a large circular chamber. In the center stands a pillar of pure data energy, shooting up through the ceiling. The exit portal is visible on the far side of the chamber.\n\nThe symbols lead in two directions from here: one path circles around the energy pillar, while another seems to lead directly through it.",
      options: [
        { 
          text: "CIRCLE AROUND THE PILLAR", 
          consequence: "Following the symbols, you carefully make your way around the energy pillar. As you approach the exit, the system suddenly recognizes your presence. 'CANDIDATE VERIFIED. ACCESS GRANTED.' The portal stabilizes, allowing you safe passage. You have escaped." 
        },
        { 
          text: "WALK THROUGH THE ENERGY PILLAR", 
          consequence: "Trusting the ancient symbols, you step directly into the pillar of energy. Your body tingles as data flows through you, reading, scanning - judging. For a moment, you're suspended in pure information, before being violently rejected. The system has deemed you unworthy. You have died." 
        }
      ]
    };
  }
  
  // Situación por defecto si no coincide con ninguna específica
  return {
    narrative: "> SYSTEM ANOMALY DETECTED\n\nThe digital landscape around you shifts unpredictably. The fire takes strange new forms, creating patterns that seem to respond to your thoughts.\n\nA voice echoes through the chamber: \"TRIAL PARAMETERS CORRUPTED. RECALIBRATING.\"\n\nAs the environment stabilizes, you find yourself faced with two doorways, each pulsing with different colored energy.",
    options: [
      { 
        text: "ENTER THE BLUE DOORWAY", 
        consequence: "The blue doorway envelops you in cool energy, instantly relieving you from the heat. You find yourself in a serene data stream that carries you safely to the exit portal. The trial recognizes your choice as wisdom. You have escaped." 
      },
      { 
        text: "ENTER THE RED DOORWAY", 
        consequence: "The red doorway intensifies the heat to unbearable levels as you step through. The system voice announces: \"RECALIBRATION FAILED. PURGING ANOMALY.\" You feel your digital consciousness being systematically erased. You have died." 
      }
    ]
  };
} 