import assert from "node:assert/strict";

export function assertHerbsIndexing(html, route) {
  const robots = route.split(/[?#]/)[0].endsWith('/standard') ? 'noindex, nofollow' : 'index, follow';
  assert.ok(html.includes(`name="robots" content="${robots}"`), `${route}: expected robots ${robots}`);
}
