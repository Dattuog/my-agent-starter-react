import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(request: NextRequest) {
  try {
    const { room, identity, metadata } = await request.json();

    if (!room || !identity) {
      return NextResponse.json(
        { error: 'Room and identity are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      metadata: JSON.stringify({ 
        canRecord: true,
        ...metadata 
      })
    });

    token.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      // Required for egress/recording
      roomRecord: true,
      // Allow managing egress sessions
      roomAdmin: true,
    });

    const jwt = token.toJwt();
    
    return NextResponse.json({ 
      token: jwt,
      url: process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL 
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
