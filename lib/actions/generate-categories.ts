'use server';

import OpenAI from 'openai';
import { normalizeCategoryName, slugify } from '@/lib/normalize';

export async function generateCategoriesForVertical(input: {
  vertical: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `Generate a clean, non-overlapping list of category names for the business vertical below.

Vertical: ${input.vertical}

Requirements:
- Return ONLY a JSON array of strings
- 8 to 20 categories
- Category names should be short, human-friendly, and not include location words
- Avoid duplicates and near-duplicates
- Use conventional industry terminology

Example output:
["Divorce Law","Family Law","Criminal Defense"]`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You generate category name lists. Output valid JSON arrays only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 700,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No response received from OpenAI.');

  const cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse OpenAI response as JSON.');
  }

  if (!Array.isArray(raw)) {
    throw new Error('Invalid response format from OpenAI.');
  }

  const seen = new Set<string>();
  const normalized = raw
    .filter((v): v is string => typeof v === 'string')
    .map((name) => normalizeCategoryName(name))
    .filter((name) => {
      const s = slugify(name);
      if (!s) return false;
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });

  if (normalized.length === 0) {
    throw new Error('No valid categories generated.');
  }

  return { categories: normalized };
}
