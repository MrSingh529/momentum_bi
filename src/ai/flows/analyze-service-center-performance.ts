'use server';

/**
 * @fileOverview Analyzes trends in calls, cancellations, and inventory to provide
 * customized suggestions for optimizing service center performance.
 *
 * - analyzeServiceCenterPerformance - Analyzes service center performance and provides suggestions.
 * - AnalyzeServiceCenterPerformanceInput - The input type for the analyzeServiceCenterPerformance function.
 * - AnalyzeServiceCenterPerformanceOutput - The return type for the analyzeServiceCenterPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeServiceCenterPerformanceInputSchema = z.object({
  month: z.string().describe('The month for which to analyze performance (e.g., January, February).'),
  serviceCenter: z.string().describe('The specific service center to analyze.'),
  callsData: z.string().describe('Data related to calls, including total calls and cancelled calls.'),
  inventoryData: z.string().describe('Data related to inventory, including available, occupied, and in-transit inventory.'),
});

export type AnalyzeServiceCenterPerformanceInput = z.infer<
  typeof AnalyzeServiceCenterPerformanceInputSchema
>;

const AnalyzeServiceCenterPerformanceOutputSchema = z.object({
  trendAnalysis: z.string().describe('Analysis of trends in calls, cancellations, and inventory.'),
  optimizationSuggestions: z
    .string()
    .describe('Customized suggestions for optimizing service center performance.'),
});

export type AnalyzeServiceCenterPerformanceOutput = z.infer<
  typeof AnalyzeServiceCenterPerformanceOutputSchema
>;

export async function analyzeServiceCenterPerformance(
  input: AnalyzeServiceCenterPerformanceInput
): Promise<AnalyzeServiceCenterPerformanceOutput> {
  return analyzeServiceCenterPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeServiceCenterPerformancePrompt',
  input: {schema: AnalyzeServiceCenterPerformanceInputSchema},
  output: {schema: AnalyzeServiceCenterPerformanceOutputSchema},
  prompt: `You are a service center operations expert. Analyze the following data for the given month and service center and provide trend analysis and optimization suggestions.

Month: {{{month}}}
Service Center: {{{serviceCenter}}}
Calls Data: {{{callsData}}}
Inventory Data: {{{inventoryData}}}

Based on this information, provide a detailed trend analysis and specific, actionable suggestions for optimizing calls, cancellations, and inventory management at the service center.  Focus on actions that the service center manager could take this month to improve performance.`,
});

const analyzeServiceCenterPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeServiceCenterPerformanceFlow',
    inputSchema: AnalyzeServiceCenterPerformanceInputSchema,
    outputSchema: AnalyzeServiceCenterPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
