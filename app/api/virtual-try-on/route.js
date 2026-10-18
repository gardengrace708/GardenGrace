import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    // Frontend se 'category' bhi le sakte hain (upper_body, lower_body, dress)
    const { userImage, productImage, productName, category = "upper_body" } = body;

    if (!userImage || !productImage) {
      return NextResponse.json({ message: 'User image and product image are required' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      return NextResponse.json({ message: 'REPLICATE_API_TOKEN is not configured' }, { status: 500 });
    }

    // FIX 1: Use Flux Schnell model for virtual try-on
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: {
          prompt: `A person with ${productName || 'elegant product'}, photorealistic, high quality, product photography, full body shot`,
          image: userImage,
          num_inference_steps: 28,
          guidance_scale: 3.5
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Replicate API error:', error);
      return NextResponse.json({ message: 'Failed to start virtual try-on' }, { status: 500 });
    }

    const prediction = await response.json();
    
    // Polling for the result
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds ka wait behtar hai
      
      // FIX 2: Authorization header ko consistent rakha
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${apiToken}` 
        }
      });
      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      return NextResponse.json({ message: 'Virtual try-on processing failed' }, { status: 500 });
    }
    
    // Replicate output mein images ka array deta hai, hum pehli image bhej rahe hain
    return NextResponse.json({ 
      success: true,
      image: Array.isArray(result.output) ? result.output[0] : result.output
    });

  } catch (error) {
    console.error('Virtual try-on error:', error);
    return NextResponse.json({ message: 'Failed to process virtual try-on' }, { status: 500 });
  }
}
