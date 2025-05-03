import { NextRequest, NextResponse } from 'next/server';
import { generateStorySegment, isEndingSuccessful } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { context, currentSituation } = await req.json();

    if (!context || !currentSituation) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: context y currentSituation son obligatorios' },
        { status: 400 }
      );
    }

    const storySegment = await generateStorySegment(context, currentSituation);
    
    return NextResponse.json({ ...storySegment });
  } catch (error) {
    console.error('Error en la API de historia:', error);
    return NextResponse.json(
      { error: 'Error al generar el segmento de historia' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const situation = url.searchParams.get('situation');

  if (!situation) {
    return NextResponse.json(
      { error: 'Falta el parámetro situation' },
      { status: 400 }
    );
  }

  try {
    const success = await isEndingSuccessful(situation);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error al evaluar el final:', error);
    return NextResponse.json(
      { error: 'Error al evaluar el final de la historia' },
      { status: 500 }
    );
  }
} 