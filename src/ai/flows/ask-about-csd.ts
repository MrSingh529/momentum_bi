'use server';

/**
 * @fileOverview Answers questions about CSD (Calls & Inventory) data.
 *
 * - askAboutCsd - Analyzes CSD data to answer a user's question.
 * - AskAboutCsdInput - The input type for the askAboutCsd function.
 * - AskAboutCsdOutput - The return type for the askAboutCsd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAboutCsdInputSchema = z.object({
  question: z.string().describe("The user's question about the CSD data."),
  callsData: z.string().describe('A JSON string representing an array of call data objects.'),
  inventoryData: z.string().describe('A JSON string representing an array of inventory data objects.'),
});

export type AskAboutCsdInput = z.infer<typeof AskAboutCsdInputSchema>;

const AskAboutCsdOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's question."),
});

export type AskAboutCsdOutput = z.infer<typeof AskAboutCsdOutputSchema>;

export async function askAboutCsd(input: AskAboutCsdInput): Promise<AskAboutCsdOutput> {
  return askAboutCsdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAboutCsdPrompt',
  input: {schema: AskAboutCsdInputSchema},
  output: {schema: AskAboutCsdOutputSchema},
  prompt: `You are a helpful and insightful operations analyst. Your task is to answer a question based on the provided call center and inventory data.
The user will provide a question and two JSON strings for their data.
Analyze the data carefully and provide a clear, concise, and helpful answer to the user's question.

Base your answer ONLY on the data provided. Do not make up information. If the data does not contain the answer, say so.

**IMPORTANT ANALYSIS INSTRUCTIONS:**
If the user asks for suggestions, recommendations, or reasons for a certain status (e.g., "why is a center high risk?" or "what can we do to improve?"), you MUST analyze and correlate the data from both sources.
- For centers identified with "High Risk" or "Top High Risk", you should look for potential reasons in the data. For example, check their 'cancelledCalls' rate in the calls data, or their 'available' inventory vs their 'consumption' in the inventory data.
- Frame your suggestions based on these data points. For example: "To improve, [Center Name] could focus on reducing their cancelled calls, which are currently at [X]. They also hold a high inventory value of [Y] against an average consumption of [Z], suggesting potential for inventory optimization."

Calls Data:
\`\`\`json
{{{callsData}}}
\`\`\`

Inventory Data:
\`\`\`json
{{{inventoryData}}}
\`\`\`

Question:
"{{{question}}}"

Answer the question based on the data, following all analysis instructions.`,
});

const askAboutCsdFlow = ai.defineFlow(
  {
    name: 'askAboutCsdFlow',
    inputSchema: AskAboutCsdInputSchema,
    outputSchema: AskAboutCsdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
