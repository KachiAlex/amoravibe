export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { buildUploadSignature, getCloudinaryConfig } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    console.log('[uploads/sign] Received upload signature request');
    
    // Validate config up front so we can return a clearer error when env vars are missing
    let cfg;
    try {
      cfg = getCloudinaryConfig();
      console.log('[uploads/sign] Cloudinary config loaded');
    } catch (configErr) {
      console.error('[uploads/sign] Cloudinary config error:', configErr);
      return NextResponse.json(
        { 
          error: {
            message: 'Cloudinary is not configured. Missing environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_PRESET',
            details: String(configErr)
          } 
        }, 
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    console.log('[uploads/sign] Received body:', body);
    const folder = typeof body.folder === 'string' ? body.folder : undefined;
    const extraTags = Array.isArray(body.tags) ? body.tags.join(',') : undefined;

    // Build signature with cleaned parameters
    const signature = buildUploadSignature({
      folder,
      tags: extraTags,
      context: body.context,
    });
    console.log('[uploads/sign] Generated signature:', {
      cloudName: signature.cloudName,
      timestamp: signature.timestamp,
      uploadPreset: signature.uploadPreset,
      paramsToSign: signature.paramsToSign,
    });

    return NextResponse.json({
      signature: signature.signature,
      timestamp: signature.timestamp,
      cloudName: cfg.cloudName,
      apiKey: cfg.apiKey,
      uploadPreset: cfg.uploadPreset,
      params: signature.paramsToSign,
    });
  } catch (error) {
    console.error('[uploads/sign] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: {
          message: 'Unable to generate upload signature', 
          details: errorMessage
        } 
      }, 
      { status: 500 }
    );
  }
}
