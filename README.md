# jdeffner-feed

The content behind [feed.jdeffner.com](https://feed.jdeffner.com): links
worth passing on, one JSON record each. Nothing here is an app; the site
([jdeffner-site](https://github.com/JDeffner/jdeffner-site)) fetches
`feed.json` and the thumbnails from this repo's raw URLs and revalidates
every few minutes, so publishing is just a push to `main`.

## Format

`feed.json` is an array of entries:

```json
{
  "slug": "cpu-die-area-cache",
  "title": "The growing share of cache on a CPU die",
  "url": "https://example.com/post",
  "summary": "Measures how much of a CPU's die area goes to cache across 30 years of Intel chips.",
  "tags": ["hardware", "caching"],
  "thumb": "thumbs/cpu-die-area-cache.jpg",
  "added": "2026-08-08"
}
```

- `slug`: unique, kebab-case, also names the thumbnail.
- `summary`: one or two sentences on why it was worth the time.
- `tags`: 2–5 lowercase single words; they become the filter chips.
- `thumb`: repo-relative path under `thumbs/`, optional. The site turns
  it into a raw URL.
- `added`: YYYY-MM-DD. Newest renders first; array order does not matter.

The type lives in `lib/feed.ts` in jdeffner-site; keep the two in sync.

## Publishing

The `/feed` skill (in `~/.claude/skills/feed/`) does the whole thing:
extract metadata from a URL, write the entry, download the thumbnail,
push. By hand: edit `feed.json`, drop the image in `thumbs/`, push to
`main`. The site picks it up within about five minutes.
