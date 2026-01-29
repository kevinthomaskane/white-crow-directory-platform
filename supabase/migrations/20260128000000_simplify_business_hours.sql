-- Simplify the hours column from a complex object to just a string array
-- Before: { "openNow": bool, "periods": [...], "weekdayDescriptions": [...], ... }
-- After: ["Monday: 9:00 AM – 5:00 PM", "Tuesday: 9:00 AM – 5:00 PM", ...]

UPDATE businesses
SET hours = hours->'weekdayDescriptions'
WHERE hours IS NOT NULL
  AND hours->'weekdayDescriptions' IS NOT NULL;

-- Set to null if weekdayDescriptions was missing or empty
UPDATE businesses
SET hours = NULL
WHERE hours IS NOT NULL
  AND (hours->'weekdayDescriptions' IS NULL OR hours = '[]'::jsonb);
