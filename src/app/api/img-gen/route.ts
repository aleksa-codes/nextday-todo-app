import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Cloudflare from 'cloudflare';

export const maxDuration = 60;

const model = '@cf/black-forest-labs/flux-1-schnell';

// Define a custom interface for the image generation response
// since the Cloudflare types don't include this model's response format
interface FluxImageResponse {
  image: string;
  [key: string]: string | number | boolean | null | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = new Cloudflare({
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
    });

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!accountId) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID is not defined');
    }

    // Get prompt and steps from form data
    const formData = await req.formData();
    const prompt = formData.get('prompt')?.toString() || 'A beautiful sunset over the mountains';
    const stepsStr = formData.get('steps')?.toString() || '4';
    const steps = Math.min(Math.max(parseInt(stepsStr, 10) || 4, 1), 8); // Ensure between 1-8

    // console.log('Generating image with prompt:', prompt, 'steps:', steps);

    // Use type assertion to handle the response
    const run = (await client.ai.run(model, {
      account_id: accountId,
      prompt: prompt,
      num_steps: steps,
    })) as unknown as FluxImageResponse;

    // Check if the response contains an image
    if (!run.image) {
      return NextResponse.json({ error: 'No image was generated' }, { status: 500 });
    }

    // Return the base64 image data and include user ID for balance updates
    return NextResponse.json({
      image: `data:image/png;charset=utf-8;base64,${run.image}`,
      userId: session.user.id, // Include user ID for balance processing on client
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
