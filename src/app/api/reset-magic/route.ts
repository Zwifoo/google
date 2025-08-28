import { NextResponse } from 'next/server';

// POST - Reset magic usage for testing
export async function POST() {
  console.log('🔄 Resetting magic usage...');
  
  const response = NextResponse.json({ 
    success: true,
    message: 'Magic usage reset' 
  });
  
  // Clear the magic-used cookie
  response.cookies.delete('magic-used');
  
  console.log('✅ Magic usage reset successfully');
  
  return response;
}
