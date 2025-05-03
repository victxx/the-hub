import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface StoryOption {
  text: string;
  consequence: string;
}

interface StorySegment {
  narrative: string;
  options: StoryOption[];
  outcome?: string;
}

export interface StoryState {
  loading: boolean;
  sessionId: string;
  currentStep: number;
  storyHistory: {
    narrative: string;
    chosenOption: string | null;
  }[];
  currentSegment: StorySegment | null;
  error: string | null;
  gameOver: boolean;
  success: boolean | null;
  timeRemaining: number | null;
}

export const useStory = () => {
  // Creamos un ID de sesión único para el jugador
  const [sessionId] = useState(() => uuidv4());
  
  const [state, setState] = useState<StoryState>({
    loading: true,
    sessionId,
    currentStep: 0,
    storyHistory: [],
    currentSegment: null,
    error: null,
    gameOver: false,
    success: null,
    timeRemaining: null
  });

  // Iniciar la historia cuando se carga el componente
  useEffect(() => {
    startStory();
  }, []);

  const startStory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: state.sessionId,
          action: 'start',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener el segmento de la historia');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        currentStep: 1,
        currentSegment: data,
        storyHistory: [{ narrative: data.narrative, chosenOption: null }],
      }));
    } catch (error) {
      console.error('Error en startStory:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [state.sessionId]);

  const chooseOption = useCallback(async (optionIndex: number) => {
    if (!state.currentSegment || optionIndex >= state.currentSegment.options.length) {
      return;
    }
    
    const chosenOption = state.currentSegment.options[optionIndex];
    
    setState(prev => ({
      ...prev,
      loading: true,
      storyHistory: [
        ...prev.storyHistory,
        { 
          narrative: prev.currentSegment?.narrative || '', 
          chosenOption: chosenOption.text 
        }
      ],
    }));

    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: state.sessionId,
          action: optionIndex === 0 ? 'optionA' : 'optionB',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener el segmento de la historia');
      }

      const data = await response.json();
      
      // Incrementar el paso actual
      const nextStep = state.currentStep + 1;
      
      // Verificar si el juego ha terminado basado en el outcome
      if (data.outcome === 'death' || data.outcome === 'escaped') {
        // Verificar si el usuario ha escapado con éxito
        const checkEndingResponse = await fetch(`/api/story?outcome=${data.outcome}`);
        
        if (checkEndingResponse.ok) {
          const { success } = await checkEndingResponse.json();
          
          // Keep the current timeRemaining value when game ends
          setState(prev => ({
            ...prev,
            loading: false,
            currentStep: nextStep,
            currentSegment: data,
            gameOver: true,
            success,
            // Preserve the current timeRemaining value
            timeRemaining: prev.timeRemaining
          }));
          return;
        }
      }
      
      // Si el juego no ha terminado, continúa
      setState(prev => ({
        ...prev,
        loading: false,
        currentStep: nextStep,
        currentSegment: data,
      }));
      
    } catch (error) {
      console.error('Error al procesar la opción:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [state.currentSegment, state.sessionId, state.currentStep]);

  const setTimeRemaining = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      timeRemaining: time
    }));
  }, []);

  const resetStory = useCallback(() => {
    // Generar un nuevo ID de sesión para comenzar una historia completamente nueva
    const newSessionId = uuidv4();
    
    // Clear any stored time values
    localStorage.removeItem('successTimeRemaining');
    
    setState({
      loading: true,
      sessionId: newSessionId,
      currentStep: 0,
      storyHistory: [],
      currentSegment: null,
      error: null,
      gameOver: false,
      success: null,
      timeRemaining: null
    });
    
    // Iniciar la nueva historia
    startStory();
  }, [startStory]);

  return {
    state,
    chooseOption,
    resetStory,
    setTimeRemaining
  };
}; 