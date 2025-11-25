export const clamp100 = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Number(value)));
};

export const clamp1000 = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1000, Number(value)));
};

export const weight = (base: number, overlay: number, overlayWeight: number) => {
  const clampedWeight = Math.max(0, Math.min(1, overlayWeight));
  return Math.round(base * (1 - clampedWeight) + overlay * clampedWeight);
};

export const safeParse = <T = unknown>(raw: string | undefined | null): T | null => {
  if (!raw) {
    return null;
  }
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
};
