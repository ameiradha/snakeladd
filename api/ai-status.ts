export const config = {
  runtime: 'nodejs',
};

export default function handler(_req: any, res: any) {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0
  );
  return res.status(200).json({
    available: hasKey,
    model: 'gemini-3.8-flash',
    message: hasKey
      ? 'AI Quiz Generator is ready to use.'
      : 'GEMINI_API_KEY is not configured in Vercel Environment Variables. Please set GEMINI_API_KEY in Vercel Project Settings.',
  });
}
