import OpenAI from 'openai';

// Usamos la variable de entorno o, para desarrollo local sin .env, una clave de respaldo
// En producción, siempre usa una variable de entorno en .env.local
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

if (!apiKey) {
  console.error('⚠️ NEXT_PUBLIC_OPENAI_API_KEY no configurada. Por favor añade tu clave API de OpenAI en .env.local');
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
  try {
    const prompt = `
    Estás creando una aventura interactiva sobre escapar de una cueva con trampas antes de que se acabe el tiempo.
    
    Contexto previo: ${context}
    
    Situación actual: ${currentSituation}
    
    Genera una respuesta en formato JSON con:
    1. Una narrativa vívida, atmosférica y detallada (máximo 150 palabras)
    2. Exactamente dos opciones de decisión, cada una con:
       - Un texto breve para el botón
       - Una descripción de la consecuencia (que se usará para la próxima situación)
    
    Responde solo con JSON válido con el siguiente formato:
    {
      "narrative": "Texto narrativo detallado de la situación actual",
      "options": [
        {
          "text": "Opción A (texto para botón)",
          "consequence": "Descripción de lo que pasa si se elige esta opción"
        },
        {
          "text": "Opción B (texto para botón)",
          "consequence": "Descripción de lo que pasa si se elige esta opción"
        }
      ]
    }
    `;

    if (!apiKey) {
      // Si no hay API key, devuelve datos de muestra
      return getMockStoryData(currentSituation);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Puedes cambiar a gpt-4 para mejor calidad
      messages: [
        {
          role: "system",
          content: "Eres un maestro narrador de historias de aventuras en cuevas. Crea narrativas inmersivas y opciones interesantes que afecten significativamente el desarrollo de la historia."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || '';
    const parsedContent = JSON.parse(content);
    
    return {
      narrative: parsedContent.narrative,
      options: parsedContent.options
    };
  } catch (error) {
    console.error("Error al generar la historia:", error);
    return getMockStoryData(currentSituation);
  }
}

export async function isEndingSuccessful(situation: string): Promise<boolean> {
  try {
    const prompt = `
    Basado en esta situación: "${situation}"
    
    Determina si el jugador ha escapado exitosamente de la cueva o no.
    Responde solo con JSON en este formato:
    { "success": true } o { "success": false }
    `;

    if (!apiKey) {
      // Si no hay API key, determina el éxito basado en palabras clave
      return situation.toLowerCase().includes('salida') || 
             situation.toLowerCase().includes('escapar') || 
             situation.toLowerCase().includes('exterior');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: "Eres un juez imparcial que evalúa si las condiciones describen una salida exitosa de la cueva."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || '';
    const parsedContent = JSON.parse(content);
    
    return parsedContent.success;
  } catch (error) {
    console.error("Error al evaluar el final:", error);
    return false;
  }
}

// Función para proporcionar datos de muestra cuando no hay API key
function getMockStoryData(currentSituation: string): {
  narrative: string;
  options: { text: string; consequence: string }[];
} {
  // Si estamos en la situación inicial
  if (currentSituation.includes("Acabas de entrar a una misteriosa cueva")) {
    return {
      narrative: "El calor dentro de la cueva se intensifica a medida que avanzas. Las paredes están cubiertas de extraños símbolos que parecen brillar con luz propia. Al fondo, puedes ver una bifurcación en el camino. A la izquierda, un túnel estrecho del que emana una suave brisa; a la derecha, un camino más amplio iluminado por un resplandor rojizo.",
      options: [
        { 
          text: "Tomar el túnel estrecho", 
          consequence: "Te deslizas por el túnel estrecho, sintiendo la brisa fresca en tu rostro. A medida que avanzas, el pasaje se hace más angosto, pero la temperatura parece descender." 
        },
        { 
          text: "Seguir el camino iluminado", 
          consequence: "Avanzas por el camino más amplio, guiado por el resplandor rojizo. El calor aumenta considerablemente y pronto descubres que la luz proviene de lo que parece ser un río de lava que fluye bajo una pasarela de piedra." 
        }
      ]
    };
  }
  
  // Si estamos en el túnel estrecho
  if (currentSituation.includes("túnel estrecho")) {
    return {
      narrative: "El túnel se estrecha tanto que apenas puedes avanzar arrastrándote. El aire se vuelve más fresco, lo que te da esperanza. De repente, el suelo cede y caes a una cámara inferior. Al levantarte, notas dos salidas: una escalera tallada en la piedra que sube, y un pasadizo inundado parcialmente con agua que parece descender.",
      options: [
        { 
          text: "Subir por la escalera", 
          consequence: "Asciendes por la escalera de piedra, que serpentea hacia arriba. Después de varios minutos de arduo ascenso, llegas a una pequeña cámara con grabados en las paredes y lo que parece ser un altar antiguo." 
        },
        { 
          text: "Seguir el pasaje inundado", 
          consequence: "Te adentras en el pasaje inundado, con el agua fría llegándote hasta las rodillas. El camino desciende gradualmente y notas que la corriente se hace más fuerte." 
        }
      ]
    };
  }
  
  // Si seguimos el camino iluminado
  if (currentSituation.includes("río de lava")) {
    return {
      narrative: "La pasarela sobre el río de lava es estrecha y notas que algunas secciones parecen inestables. El calor es sofocante y las gotas de sudor evaporan antes de caer al suelo. Al final de la pasarela, ves una gran puerta de piedra con inscripciones y, a un lado, una pequeña abertura en la pared por la que podrías colarte.",
      options: [
        { 
          text: "Examinar la puerta de piedra", 
          consequence: "Te acercas a la imponente puerta. Las inscripciones parecen ser algún tipo de acertijo o mecanismo. Mientras las examinas, descubres que ciertas partes pueden presionarse, como si fueran botones." 
        },
        { 
          text: "Deslizarte por la abertura", 
          consequence: "Te deslizas por la pequeña abertura, raspándote los hombros y rodillas. El pasaje es tan angosto que casi no puedes respirar, pero finalmente emerges a una cámara más fresca y oscura." 
        }
      ]
    };
  }
  
  // Si hemos subido por la escalera
  if (currentSituation.includes("altar antiguo")) {
    return {
      narrative: "El altar parece ser algún tipo de mecanismo. Tiene cuatro símbolos tallados: fuego, agua, tierra y aire. Al centro hay un hueco que parece esperar algún tipo de ofrenda o llave. Un pasaje estrecho continúa detrás del altar, y notas una luz tenue que podría ser la salida de la cueva.",
      options: [
        { 
          text: "Investigar los símbolos", 
          consequence: "Al tocar los símbolos en cierto orden (aire, agua, tierra, fuego), sientes un temblor y el altar se mueve, revelando un pasaje secreto que desciende." 
        },
        { 
          text: "Seguir hacia la luz", 
          consequence: "Te diriges hacia la luz, atravesando el estrecho pasaje que se curva y asciende. Después de varios minutos, ¡la luz se intensifica! Has encontrado la salida de la cueva y escapado a salvo." 
        }
      ]
    };
  }
  
  // Situación por defecto si no coincide con ninguna específica
  return {
    narrative: "Te encuentras en una sección inexplorada de la cueva. El aire está cargado de misterio y tensión. Debes tomar una decisión rápidamente para continuar tu aventura.",
    options: [
      { 
        text: "Explorar a la izquierda", 
        consequence: "Te diriges hacia la izquierda, adentrándote en un pasaje que parece descender más profundamente en la tierra." 
      },
      { 
        text: "Explorar a la derecha", 
        consequence: "Tomas el camino de la derecha, que parece ascender ligeramente, dándote esperanza de encontrar una salida." 
      }
    ]
  };
} 