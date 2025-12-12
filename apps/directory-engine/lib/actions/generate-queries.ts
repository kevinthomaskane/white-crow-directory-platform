'use server';

import OpenAI from 'openai';

interface GenerateQueriesInput {
  vertical: string;
  location: string;
  categories: string[];
  generateCategories: boolean;
}

interface GenerateQueriesResult {
  queries?: string[];
  error?: string;
}

export async function generatePlacesQueries(
  data: GenerateQueriesInput
): Promise<GenerateQueriesResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { error: 'OpenAI API key is not configured.' };
  }

  const openai = new OpenAI({ apiKey });

  const categoriesInfo = data.generateCategories
    ? 'Generate appropriate categories for this vertical'
    : `Categories: ${data.categories.join(', ')}`;

  const prompt = `You are an expert at generating Google Places API text search queries to find businesses.

Given:
- Business vertical: ${data.vertical}
- Location: ${data.location}
- ${categoriesInfo}

Generate 8-12 effective Google Places API text search queries that would find businesses in this vertical and location. Each query should:
1. Be specific enough to return relevant results
2. Use natural language that people would search for
3. Include location variations (city, state, region as appropriate)
4. Cover different aspects/specializations within the vertical
5. Use industry-specific terminology and synonyms

Return ONLY a JSON array of query strings, no other text or explanation.

Example output format:
["divorce lawyer Tampa FL", "family law attorney Tampa Florida", "divorce attorney near Tampa", "child custody lawyer Tampa Bay area"]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates Google Places API search queries. Always respond with valid JSON arrays only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return { error: 'No response received from OpenAI.' };
    }

    // Parse the JSON response
    try {
      // Clean up the response in case it has markdown code blocks
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const queries = JSON.parse(cleanedContent);

      if (!Array.isArray(queries)) {
        return { error: 'Invalid response format from OpenAI.' };
      }

      // Ensure all items are strings
      const validQueries = queries.filter(
        (q): q is string => typeof q === 'string'
      );

      if (validQueries.length === 0) {
        return { error: 'No valid queries generated.' };
      }

      return { queries: validQueries };
    } catch {
      return { error: 'Failed to parse OpenAI response as JSON.' };
    }
  } catch (err) {
    console.error('OpenAI API error:', err);

    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) {
        return { error: 'Invalid OpenAI API key.' };
      }
      if (err.status === 429) {
        return { error: 'OpenAI rate limit exceeded. Please try again later.' };
      }
      return { error: `OpenAI API error: ${err.message}` };
    }

    return { error: 'Failed to generate queries. Please try again.' };
  }
}

