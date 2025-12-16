'use server';

import OpenAI from 'openai';
import { slugify, normalizeCategoryName } from '@/lib/utils';
import { ActionsResponse, VerticalMinimal } from '@/lib/types';

export async function generateCategoriesForVertical(
  vertical: VerticalMinimal['name']
): Promise<ActionsResponse<string[]>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      error: 'OpenAI API key is not configured.',
      ok: false,
    };
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `Generate a clean, non-overlapping list of category names for the business vertical below.

Vertical: ${vertical}

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
  if (!content) {
    return {
      error: 'No response from OpenAI.',
      ok: false,
    };
  }

  const cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    return {
      error: 'Failed to parse OpenAI response as JSON.',
      ok: false,
    };
  }

  if (!Array.isArray(raw)) {
    return {
      error: 'OpenAI response is not a JSON array.',
      ok: false,
    };
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
    return {
      error: 'No valid categories generated.',
      ok: false,
    };
  }

  return { data: normalized, ok: true };
}
