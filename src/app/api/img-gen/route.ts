import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const maxDuration = 60;

const model = '@cf/black-forest-labs/flux-2-dev';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not defined');
    }

    // Get prompt and steps from form data
    const formDataInput = await req.formData();
    const prompt = formDataInput.get('prompt')?.toString() || 'A beautiful sunset over the mountains';
    const stepsStr = formDataInput.get('steps')?.toString() || '4';
    const steps = Math.min(Math.max(parseInt(stepsStr, 10) || 4, 1), 8); // Ensure between 1-8

    // Generate a random seed: 0 ≤ seed < 18446744073709552000
    const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

    // Prepare FormData for the request
    const requestFormData = new FormData();
    requestFormData.append('prompt', prompt);
    requestFormData.append('steps', steps.toString());
    requestFormData.append('seed', seed.toString());
    requestFormData.append('width', '1024');
    requestFormData.append('height', '1024');

    // Make the API request
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: requestFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudflare AI API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const imageBase64 = data.result.image;

    // Check if the response contains an image
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image was generated' }, { status: 500 });
    }

    // Return the base64 image data and include user ID for balance updates
    return NextResponse.json({
      image: `data:image/png;charset=utf-8;base64,${imageBase64}`,
      userId: session.user.id, // Include user ID for balance processing on client
      seed: seed, // Include the seed in the response
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
