'use server';

import { enhancePostWithAIDummyContent } from '@/ai/flows/enhance-post-creation-with-ai-dummy-content';
import type { UserType } from '@/lib/types';

export async function enhancePost(content: string, userType: UserType) {
  if (userType === 'Fan') {
    return { success: false, error: 'Fans are not allowed to use this feature.' };
  }
  
  try {
    const result = await enhancePostWithAIDummyContent({
      postContent: content,
      userType: userType as 'Player' | 'Team' | 'Scout',
    });
    return { success: true, enhancedContent: result.enhancedContent };
  } catch (error) {
    console.error('Error enhancing post:', error);
    return { success: false, error: 'Failed to enhance post.' };
  }
}
