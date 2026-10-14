import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

function signCloudinaryParams(params, apiSecret) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser?.user !== 1) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    console.log(cloudName, "hi")

    console.log({
      cloudName,
      apiKey,
      hasSecret: !!apiSecret
    });

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: 'Cloudinary env variables missing' },
        { status: 500 }
      );
    }

    const incomingFormData = await request.formData();
    const file = incomingFormData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'Image file required' },
        { status: 400 }
      );
    }

    // Check file size (Cloudinary free plan limit is 10MB)
    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (fileSizeInMB > 10) {
      return NextResponse.json(
        { message: `File size too large (${fileSizeInMB.toFixed(2)}MB). Cloudinary free plan allows maximum 10MB. Please compress the image before uploading.` },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'makhsoos/products';

    const signature = signCloudinaryParams(
      { folder, timestamp },
      apiSecret
    );

    const uploadFormData = new FormData();

    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('folder', folder);
    uploadFormData.append('signature', signature);
    uploadFormData.append('quality', 'auto'); // Auto-optimize image quality
    uploadFormData.append('fetch_format', 'auto'); // Auto-convert to optimal format

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData
      }
    );

    const uploadData = await uploadResponse.json();

    console.log(uploadData);

    if (!uploadResponse.ok) {
      return NextResponse.json(
        {
          message:
            uploadData?.error?.message || 'Image upload failed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}