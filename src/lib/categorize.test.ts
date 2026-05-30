import { describe, it, expect } from 'vitest';
import { categorize } from './categorize';

describe('categorize — category buckets', () => {
  it('maps video domains to "videos"', () => {
    expect(categorize('https://www.youtube.com/watch?v=abc123').category).toBe('videos');
    expect(categorize('https://youtu.be/abc123').category).toBe('videos');
    expect(categorize('https://vimeo.com/76979871').category).toBe('videos');
  });

  it('maps job sources to "jobs" (path-scoped for general domains)', () => {
    expect(categorize('https://www.linkedin.com/jobs/view/123').category).toBe('jobs');
    expect(categorize('https://boards.greenhouse.io/acme/jobs/456').category).toBe('jobs');
    expect(categorize('https://jobs.lever.co/acme/789').category).toBe('jobs');
    // linkedin without /jobs is NOT a job link
    expect(categorize('https://www.linkedin.com/in/someone').category).not.toBe('jobs');
  });

  it('maps social domains to "socials"', () => {
    expect(categorize('https://instagram.com/lanadelrey').category).toBe('socials');
    expect(categorize('https://x.com/elonmusk').category).toBe('socials');
    expect(categorize('https://twitter.com/jack').category).toBe('socials');
    expect(categorize('https://www.tiktok.com/@user').category).toBe('socials');
  });

  it('maps known blog platforms to "articles"', () => {
    expect(categorize('https://medium.com/@user/some-post-a1b2c3').category).toBe('articles');
    expect(categorize('https://author.substack.com/p/some-essay').category).toBe('articles');
    expect(categorize('https://dev.to/user/some-guide').category).toBe('articles');
  });

  it('falls back to "uncategorized" for unknown domains', () => {
    expect(categorize('https://example.com/some/page').category).toBe('uncategorized');
    expect(categorize('https://news.ycombinator.com/item?id=1').category).toBe('uncategorized');
  });
});

describe('categorize — source derivation', () => {
  it('derives an @handle for socials', () => {
    expect(categorize('https://instagram.com/lanadelrey').source).toBe('@lanadelrey');
    expect(categorize('https://www.tiktok.com/@user').source).toBe('@user');
  });

  it('does not treat reserved social paths as handles', () => {
    expect(categorize('https://instagram.com/explore').source).toBe('instagram.com');
  });

  it('uses the bare domain (no www) for non-socials', () => {
    expect(categorize('https://careers.google.com/jobs/results/').source).toBe('careers.google.com');
    expect(categorize('https://www.youtube.com/watch?v=abc').source).toBe('youtube.com');
  });
});

describe('categorize — name derivation', () => {
  it('de-slugs a path segment into proper Title Case (stopwords + acronyms)', () => {
    expect(categorize('https://medium.com/the-history-of-ui-design').name).toBe(
      'The History of UI Design',
    );
  });

  it('strips file extensions from the slug', () => {
    expect(categorize('https://example.com/articles/color-theory.html').name).toBe('Color Theory');
  });

  it('drops a trailing opaque id token, keeping acronym casing', () => {
    expect(categorize('https://medium.com/@user/minimalist-ui-a1b2c3d4').name).toBe('Minimalist UI');
  });

  it('picks the most title-like segment, skipping ids/numbers', () => {
    expect(categorize('https://boards.greenhouse.io/acme/jobs/senior-designer/4012').name).toBe(
      'Senior Designer',
    );
  });

  it('decodes "+" and percent-encoding in slugs', () => {
    expect(categorize('https://example.com/the+future+of+work').name).toBe('The Future of Work');
    expect(categorize('https://example.com/caf%C3%A9-culture').name).toBe('Café Culture');
  });

  it('keeps small stopwords lowercase except at the edges', () => {
    expect(categorize('https://example.com/a-tale-of-two-cities').name).toBe('A Tale of Two Cities');
  });

  it('uses the handle as the name for socials', () => {
    expect(categorize('https://instagram.com/lanadelrey').name).toBe('Lanadelrey');
  });

  it('falls back to the domain label on a homepage URL', () => {
    expect(categorize('https://medium.com').name).toBe('Medium');
    expect(categorize('https://careers.google.com').name).toBe('Google');
  });
});

describe('categorize — robustness', () => {
  it('accepts bare domains without a protocol', () => {
    expect(categorize('medium.com/some-post').category).toBe('articles');
    expect(categorize('medium.com/some-post').source).toBe('medium.com');
  });

  it('never throws on malformed input and degrades gracefully', () => {
    const result = categorize('not a url at all');
    expect(result.category).toBe('uncategorized');
    expect(result.name.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    expect(categorize('').name).toBe('Untitled');
  });
});
