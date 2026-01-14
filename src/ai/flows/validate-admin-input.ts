// ValidateAdminInput Story: As an admin, I want the application to validate my price inputs using AI, so that data entry errors are minimized, and the price data is accurate.

'use server';

/**
 * @fileOverview Validates admin input for fruit and vegetable prices using AI to minimize data entry errors.
 *
 * - validateAdminInput - A function that validates admin input for prices.
 * - ValidateAdminInputInput - The input type for the validateAdminInput function.
 * - ValidateAdminInputOutput - The return type for the validateAdminInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAdminInputInputSchema = z.object({
  produceName: z.string().describe('The name of the fruit or vegetable.'),
  price: z.number().describe('The price of the produce per crate.'),
  previousPrice: z.number().optional().describe('The previous price of the produce per crate, if available.'),
});
export type ValidateAdminInputInput = z.infer<typeof ValidateAdminInputInputSchema>;

const ValidateAdminInputOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the provided price is valid based on the produce and previous price.'),
  reason: z.string().optional().describe('If the price is invalid, the reason why.'),
});
export type ValidateAdminInputOutput = z.infer<typeof ValidateAdminInputOutputSchema>;

export async function validateAdminInput(input: ValidateAdminInputInput): Promise<ValidateAdminInputOutput> {
  return validateAdminInputFlow(input);
}

const validateAdminInputPrompt = ai.definePrompt({
  name: 'validateAdminInputPrompt',
  input: {schema: ValidateAdminInputInputSchema},
  output: {schema: ValidateAdminInputOutputSchema},
  prompt: `You are an AI assistant that validates prices for fruits and vegetables.

You will receive the name of a produce item and its price.
If a previous price is available, you will also receive that.

You must determine if the given price is reasonable for the given produce item, taking into account the previous price if available.

If the price is valid, return isValid as true. If it is not, return isValid as false and provide a reason.

Produce: {{{produceName}}}
Price: {{{price}}}
Previous Price: {{{previousPrice}}}

Consider that prices are per crate, so a reasonable price range should be between $1 and $5000.

Output in JSON format: {{{{outputJson}}}}`,
});

const validateAdminInputFlow = ai.defineFlow(
  {
    name: 'validateAdminInputFlow',
    inputSchema: ValidateAdminInputInputSchema,
    outputSchema: ValidateAdminInputOutputSchema,
  },
  async input => {
    const {output} = await validateAdminInputPrompt(input);
    return output!;
  }
);
