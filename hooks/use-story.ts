import { useState, useCallback } from 'react';

interface StoryOption {
  text: string;
  consequence: string;
}

interface StorySegment {
  narrative: string;
  options: StoryOption[];
}

export interface StoryState {
  loading: boolean;
  context: string;
  currentSituation: string;
  storyHistory: {
    narrative: string;
    chosenOption: string | null;
  }[];
  currentSegment: StorySegment | null;
  error: string | null;
  gameOver: boolean;
  success: boolean | null;
}

export const useStory = (initialSituation: string) => {
  const [state, setState] = useState<StoryState>({
    loading: true,
    context: "",
    currentSituation: initialSituation,
    storyHistory: [],
    currentSegment: null,
    error: null,
    gameOver: false,
    success: null
  });

  const fetchNextSegment = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: state.context,
          currentSituation: state.currentSituation,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener el segmento de la historia');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        currentSegment: data,
        context: prev.context + (prev.context ? "\n\n" : "") + 
                 prev.currentSituation + (prev.currentSituation ? "\n\n" : ""),
        storyHistory: prev.storyHistory.length === 0 
          ? [{ narrative: data.narrative, chosenOption: null }] 
          : prev.storyHistory,
      }));
    } catch (error) {
      console.error('Error en fetchNextSegment:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [state.context, state.currentSituation]);

  const chooseOption = useCallback(async (optionIndex: number) => {
    if (!state.currentSegment || optionIndex >= state.currentSegment.options.length) {
      return;
    }
    
    const chosenOption = state.currentSegment.options[optionIndex];
    const newSituation = chosenOption.consequence;
    
    setState(prev => ({
      ...prev,
      loading: true,
      currentSituation: newSituation,
      storyHistory: [
        ...prev.storyHistory,
        { 
          narrative: prev.currentSegment?.narrative || '', 
          chosenOption: chosenOption.text 
        }
      ],
    }));

    // Verificar si este es un final
    try {
      const checkEndingResponse = await fetch(`/api/story?situation=${encodeURIComponent(newSituation)}`);
      
      if (checkEndingResponse.ok) {
        const { success } = await checkEndingResponse.json();
        
        if (success !== undefined) {
          setState(prev => ({
            ...prev,
            loading: false,
            gameOver: true,
            success: success,
          }));
          return;
        }
      }
      
      // Si no es un final, continuar con la historia
      await fetchNextSegment();
    } catch (error) {
      console.error('Error al procesar la opción:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [state.currentSegment, fetchNextSegment]);

  const resetStory = useCallback(() => {
    setState({
      loading: true,
      context: "",
      currentSituation: initialSituation,
      storyHistory: [],
      currentSegment: null,
      error: null,
      gameOver: false,
      success: null
    });
    fetchNextSegment();
  }, [initialSituation, fetchNextSegment]);

  return {
    state,
    fetchNextSegment,
    chooseOption,
    resetStory
  };
}; 