'use server';

import {
  validateAdminInput,
  type ValidateAdminInputInput,
  type ValidateAdminInputOutput,
} from '@/ai/flows/validate-admin-input';
import { generateMarketAnalysis } from '@/ai/flows/market-analysis-flow';
import type { Stall } from '@/lib/types';


export async function validatePriceAction(
  data: ValidateAdminInputInput
): Promise<ValidateAdminInputOutput> {
  try {
    const result = await validateAdminInput(data);
    return result;
  } catch (error) {
    console.error('AI validation failed:', error);
    // In case of AI error, we can default to valid to not block the user,
    // or return an error state. For this scaffold, let's assume it's valid
    // but log the reason, which could be displayed to the admin.
    return { isValid: true, reason: 'AI validation service failed.' };
  }
}

export async function generateMarketAnalysisAction(stalls: Stall[]) {
  try {
    const result = await generateMarketAnalysis(stalls);
    return result;
  } catch (error: any) {
    console.error('Market analysis generation failed:', error);
    return {
      analysis: `### Error

No se pudo generar el análisis del mercado.

**Motivo:** ${error.message || 'El servicio de IA no está disponible en este momento.'}`
    }
  }
}
