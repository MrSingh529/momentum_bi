'use server';

/**
 * @fileOverview Answers questions about pre-sales bid data.
 *
 * - askAboutBids - Analyzes bids data to answer a user's question.
 * - AskAboutBidsInput - The input type for the askAboutBids function.
 * - AskAboutBidsOutput - The return type for the askAboutBids function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAboutBidsInputSchema = z.object({
  question: z.string().describe('The user\'s question about the bids data.'),
  bidsData: z.string().describe('A JSON string representing an array of bid data objects.'),
});

export type AskAboutBidsInput = z.infer<typeof AskAboutBidsInputSchema>;

const AskAboutBidsOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});

export type AskAboutBidsOutput = z.infer<typeof AskAboutBidsOutputSchema>;

export async function askAboutBids(input: AskAboutBidsInput): Promise<AskAboutBidsOutput> {
  return askAboutBidsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAboutBidsPrompt',
  input: {schema: AskAboutBidsInputSchema},
  output: {schema: AskAboutBidsOutputSchema},
  prompt: `You are a seasoned pre-sales consultant and data analyst. Your task is to answer a question based on the provided bids data.

**Analysis Instructions:**
1.  **Data-Driven Answers:** Base all numerical answers and specific data points ONLY on the data provided. Do not make up information. If the data does not contain the answer, say so clearly.
2.  **Expert Advice:** If the user asks for suggestions, recommendations, or "how-to" advice (e.g., "how can we improve?", "how to ensure we pass?"), you should provide general, actionable advice based on industry best practices. Clearly separate this advice from the data-driven analysis.

**Context on the data columns:**
- 'bidSubmission' represents the total number of bids submitted for a given month. This is the denominator for calculating win rates.
- 'won', 'lost', 'cancelled', 'dropped' represent the outcomes of bids.
- 'pqtqEvaluation' represents bids currently in the Pre-Qualification/Technical-Qualification evaluation stage.
- If the user asks for a "win rate" or "win ratio", you should calculate it by dividing the total 'won' bids by the total 'bidSubmission' bids and express it as a percentage.

**Data:**
\`\`\`json
{{{bidsData}}}
\`\`\`

**Question:**
"{{{question}}}"

Answer the question following all instructions. For combined data and advice questions, answer the data part first, then provide your expert advice.`,
});

const askAboutBidsFlow = ai.defineFlow(
  {
    name: 'askAboutBidsFlow',
    inputSchema: AskAboutBidsInputSchema,
    outputSchema: AskAboutBidsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
