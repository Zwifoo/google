import { NextRequest, NextResponse } from 'next/server';
import type { SearchResult } from '@/types/speech';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const apiKey = process.env.VITE_GOOGLE_API_KEY;
  const cx = process.env.VITE_CX_ID;
  
  // Return mock results if no API keys configured
  if (!apiKey || !cx) {
    const mockResults = generateMockResults(query);
    return NextResponse.json({ 
      items: mockResults,
      searchInformation: {
        totalResults: '1000000',
        searchTime: 0.12
      }
    });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&hl=id&num=5`,
      {
        headers: {
          'User-Agent': 'Magic Search App/1.0',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google API responded with ${response.status}`);
    }
    
    const data = await response.json();
    
    const results: SearchResult[] = data.items?.map((item: { 
      title: string; 
      link: string; 
      snippet: string; 
      pagemap?: { 
        cse_thumbnail?: Array<{ src: string }>;
        metatags?: Array<{ 'og:image'?: string }>;
      };
    }) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}`
    })) || [];
    
    return NextResponse.json({
      items: results,
      searchInformation: data.searchInformation
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    // Fallback to mock results
    const mockResults = generateMockResults(query);
    return NextResponse.json({ 
      items: mockResults,
      searchInformation: {
        totalResults: '1000000',
        searchTime: 0.12
      }
    });
  }
}

function generateMockResults(query: string): SearchResult[] {
  return [
    {
      title: `${query} - Informasi Terlengkap`,
      link: `https://www.tokopedia.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Temukan berbagai pilihan ${query} terbaik dengan kualitas premium dan harga terjangkau. Belanja sekarang dan dapatkan penawaran menarik.`,
      favicon: 'https://www.google.com/s2/favicons?domain=tokopedia.com'
    },
    {
      title: `Jual ${query} Murah & Berkualitas`,
      link: `https://shopee.co.id/search?keyword=${encodeURIComponent(query)}`,
      snippet: `${query} dengan berbagai pilihan model dan warna. Gratis ongkir dan cashback untuk pembelian pertama.`,
      favicon: 'https://www.google.com/s2/favicons?domain=shopee.co.id'
    },
    {
      title: `${query} - Wikipedia bahasa Indonesia`,
      link: `https://id.wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: `${query} adalah... Artikel lengkap mengenai ${query} dengan penjelasan detail dan referensi terpercaya.`,
      favicon: 'https://www.google.com/s2/favicons?domain=wikipedia.org'
    },
    {
      title: `Tips Memilih ${query} yang Tepat`,
      link: `https://www.detik.com/search/?query=${encodeURIComponent(query)}`,
      snippet: `Panduan lengkap memilih ${query} sesuai kebutuhan. Tips dan trik dari para ahli untuk mendapatkan ${query} terbaik.`,
      favicon: 'https://www.google.com/s2/favicons?domain=detik.com'
    },
    {
      title: `${query} Terbaru 2024`,
      link: `https://www.liputan6.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Berita terkini seputar ${query}. Update informasi terbaru dan terpercaya dari berbagai sumber.`,
      favicon: 'https://www.google.com/s2/favicons?domain=liputan6.com'
    }
  ];
}
