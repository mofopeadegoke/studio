'use server';

/**
 * @fileOverview A flow that enhances post creation with AI-generated dummy content.
 *
 * - enhancePostWithAIDummyContent - A function that enhances a post with AI-generated dummy content.
 * - EnhancePostInput - The input type for the enhancePostWithAIDummyContent function.
 * - EnhancePostOutput - The return type for the enhancePostWithAIDummyContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePostInputSchema = z.object({
  postContent: z.string().describe('The main content of the post.'),
  userType: z.enum(['Player', 'Team', 'Scout']).describe('The type of user creating the post.'),
});
export type EnhancePostInput = z.infer<typeof EnhancePostInputSchema>;

const EnhancePostOutputSchema = z.object({
  enhancedContent: z.string().describe('The post content enhanced with AI-generated dummy data.'),
});
export type EnhancePostOutput = z.infer<typeof EnhancePostOutputSchema>;

export async function enhancePostWithAIDummyContent(input: EnhancePostInput): Promise<EnhancePostOutput> {
  return enhancePostFlow(input);
}

const enhancePostPrompt = ai.definePrompt({
  name: 'enhancePostPrompt',
  input: {schema: EnhancePostInputSchema},
  output: {schema: EnhancePostOutputSchema},
  prompt: `You are an AI assistant helping users create engaging sports-related social media posts.

  Based on the user type ({{{userType}}}) and the original post content ({{{postContent}}}), add relevant dummy data to enhance the post.
  This could include:
  - A realistic location related to the user or content.
  - A plausible time related to the event or context.
  - A fun fact about sports related to the post.
  - Hashtags that is relevant for sports and the user.

  Make the post sound natural and engaging, as if it were written by a real person or team.

  Enhanced Post:
  `,
});

const enhancePostFlow = ai.defineFlow(
  {
    name: 'enhancePostFlow',
    inputSchema: EnhancePostInputSchema,
    outputSchema: EnhancePostOutputSchema,
  },
  async input => {
    const {output} = await enhancePostPrompt(input);
    return output!;
  }
);
