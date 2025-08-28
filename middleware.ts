import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if magic has been used (server-side cookie check)
  const magicUsed = request.cookies.get('magic-used');
  
  console.log('🛡️ Middleware check:', {
    url: request.url,
    magicUsed: magicUsed?.value,
    cookies: request.cookies.toString()
  });
  
  if (magicUsed?.value === 'true') {
    console.log('🚀 Magic already used, redirecting to Google...');
    // Redirect ke Google dengan location.replace equivalent
    const response = NextResponse.redirect('https://www.google.com', 302);
    
    // Add no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  // Jika belum digunakan, lanjutkan dengan no-cache headers
  console.log('✅ Magic not used yet, allowing access...');
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};