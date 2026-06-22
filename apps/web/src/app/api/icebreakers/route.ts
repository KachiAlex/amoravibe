import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getUserId(req: Request): Promise<string | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=');
        return [key, val.join('=')];
      })
    );
    const token = cookies['auth-token'];
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.userId) return payload.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

const GENERIC_ICEBREAKERS = [
  "What's something you're really passionate about right now?",
  "If you could have dinner with anyone, living or dead, who would it be?",
  "What's the best trip you've ever taken?",
  "What's your favorite way to spend a weekend?",
  "Do you have any hidden talents?",
  "What's the last book, movie, or show that really got you thinking?",
  "If you could instantly master any skill, what would you pick?",
  "What's your go-to comfort food?",
  "Cats or dogs? (This is important 😄)",
  "What's something on your bucket list?",
];

function getPromptBasedIcebreakers(theirPrompts: Record<string, string> | null): string[] {
  if (!theirPrompts) return [];
  const suggestions: string[] = [];
  for (const [question, answer] of Object.entries(theirPrompts)) {
    if (answer && answer.length > 5) {
      suggestions.push(`I loved your answer to "${question}" — tell me more about that!`);
      suggestions.push(`You mentioned "${answer.substring(0, 40)}${answer.length > 40 ? '...' : ''}" for "${question}". I'd love to hear the full story!`);
    }
  }
  return suggestions;
}

function getInterestBasedIcebreakers(shared: string[]): string[] {
  if (!shared.length) return [];
  return shared.map((interest) => {
    const templates: Record<string, string> = {
      travel: "I see you love travel too! Where's the next place on your list?",
      coffee: "Coffee lover detected ☕ What's your go-to order?",
      books: "A fellow reader! What are you currently reading?",
      music: "What song have you had on repeat lately?",
      fitness: "What's your favorite way to stay active?",
      hiking: "Any favorite trails you'd recommend?",
      food: "If you could only eat one cuisine for the rest of your life, what would it be?",
      design: "Love that you're into design! What's inspiring you lately?",
    };
    return templates[interest.toLowerCase()] || `I noticed we both like ${interest}! What got you into it?`;
  });
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchUserId = searchParams.get('matchUserId');
  if (!matchUserId) return NextResponse.json({ error: 'matchUserId required' }, { status: 400 });

  try {
    const [me, them] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }),
      prisma.user.findUnique({ where: { id: matchUserId }, select: { interests: true, prompts: true, name: true } }),
    ]);

    if (!them) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const myInterests = new Set(me?.interests || []);
    const theirInterests = new Set(them.interests || []);
    const shared = Array.from(myInterests).filter((i) => theirInterests.has(i));

    const suggestions: string[] = [];

    // Prompt-based icebreakers (highest priority)
    const promptSuggestions = getPromptBasedIcebreakers(them.prompts as Record<string, string> | null);
    suggestions.push(...promptSuggestions.slice(0, 3));

    // Interest-based icebreakers
    const interestSuggestions = getInterestBasedIcebreakers(shared);
    suggestions.push(...interestSuggestions.slice(0, 2));

    // Name-based
    if (them.name) {
      suggestions.push(`Hey ${them.name}! I noticed we matched — what made you swipe right?`);
    }

    // Fill with generic if needed
    while (suggestions.length < 5) {
      const random = GENERIC_ICEBREAKERS[Math.floor(Math.random() * GENERIC_ICEBREAKERS.length)];
      if (!suggestions.includes(random)) suggestions.push(random);
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 5), sharedInterests: shared });
  } catch (err) {
    console.error('[Icebreakers] Error:', err);
    return NextResponse.json({ error: 'Failed to generate icebreakers' }, { status: 500 });
  }
}
