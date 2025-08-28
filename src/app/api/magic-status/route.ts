import { NextRequest, NextResponse } from 'next/server';

// GET - Check if magic has been used
export async function GET(request: NextRequest) {
  console.log('🔍 Checking magic status...');
  
  const magicUsed = request.cookies.get('magic-used');
  
  console.log('Magic status check:', {
    magicUsed: magicUsed?.value,
    allCookies: request.cookies.toString()
  });
  
  return NextResponse.json({ 
    used: magicUsed?.value === 'true' 
  });
}

// POST - Mark magic as used
export async function POST(request: NextRequest) {
  console.log('🔒 Marking magic as used...');
  
  const response = NextResponse.json({ 
    success: true,
    message: 'Magic marked as used' 
  });
  
  // Set HttpOnly cookie that expires in 1 year
  response.cookies.set('magic-used', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/'
  });
  
  console.log('✅ Magic usage cookie set successfully');
  
  return response;
}
