import { extractKeyword } from '@/lib/speech-utils';

describe('extractKeyword', () => {
  it('should extract keyword after "yakin"', () => {
    expect(extractKeyword('yakin tas hitam?')).toBe('tas hitam');
    expect(extractKeyword('eh yakin laptop gaming?')).toBe('laptop gaming');
    expect(extractKeyword('hmm yakin itu sepatu merah ya')).toBe('sepatu merah');
  });

  it('should extract keyword after "fix"', () => {
    expect(extractKeyword('fix smartphone android')).toBe('smartphone android');
    expect(extractKeyword('oke fix mobil bekas')).toBe('mobil bekas');
  });

  it('should extract keyword after "mantap"', () => {
    expect(extractKeyword('mantap tas hitam?')).toBe('tas hitam');
    expect(extractKeyword('eh mantap laptop gaming')).toBe('laptop gaming');
    expect(extractKeyword('hmm mantap itu sepatu merah ya')).toBe('sepatu merah');
  });

  it('should handle Indonesian filler words', () => {
    expect(extractKeyword('eh mantap eee tas hitam ya')).toBe('tas hitam');
    expect(extractKeyword('hmm yakin aah laptop gaming dong')).toBe('laptop gaming');
  });

  it('should remove common Indonesian particles', () => {
    expect(extractKeyword('mantap tas hitam kan?')).toBe('tas hitam');
    expect(extractKeyword('yakin laptop gaming sih')).toBe('laptop gaming');
    expect(extractKeyword('fix sepatu merah ya dong')).toBe('sepatu merah');
  });

  it('should handle multiple triggers and use the last one', () => {
    expect(extractKeyword('yakin baju biru mantap tas merah')).toBe('tas merah');
    expect(extractKeyword('fix mobil mantap laptop gaming')).toBe('laptop gaming');
  });

  it('should limit keyword tokens', () => {
    const longText = 'mantap laptop gaming asus rog strix dengan processor intel core i7 generasi terbaru';
    const result = extractKeyword(longText);
    const tokenCount = result?.split(' ').length || 0;
    expect(tokenCount).toBeLessThanOrEqual(6);
  });

  it('should return null for no trigger words', () => {
    expect(extractKeyword('hello world')).toBe(null);
    expect(extractKeyword('tas hitam bagus')).toBe(null);
    expect(extractKeyword('')).toBe(null);
  });

  it('should return null for trigger without keyword', () => {
    expect(extractKeyword('mantap?')).toBe(null);
    expect(extractKeyword('mantap ya')).toBe(null);
    expect(extractKeyword('yakin')).toBe(null);
  });

  it('should handle trigger at start of sentence', () => {
    expect(extractKeyword('Mantap tas hitam?')).toBe('tas hitam');
    expect(extractKeyword('Fix laptop gaming')).toBe('laptop gaming');
    expect(extractKeyword('Yakin sepatu merah')).toBe('sepatu merah');
  });

  it('should stop at question marks', () => {
    expect(extractKeyword('mantap tas hitam? tapi tidak yakin sepatu')).toBe('tas hitam');
  });
});
