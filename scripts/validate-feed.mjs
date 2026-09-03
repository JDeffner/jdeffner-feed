// Validates feed.json against the format documented in README.md.
// No dependencies. Run with: node scripts/validate-feed.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (message) => errors.push(message);

const raw = readFileSync(resolve(root, "feed.json"), "utf8");
let feed;
try {
  feed = JSON.parse(raw);
} catch (error) {
  console.error(`feed.json is not valid JSON: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(feed)) {
  console.error("feed.json must be an array of entries.");
  process.exit(1);
}

const isText = (value) => typeof value === "string" && value.trim() !== "";
const seenSlugs = new Set();

feed.forEach((entry, index) => {
  const at = (message) => fail(`entry ${index}: ${message}`);

  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    at("must be an object.");
    return;
  }

  for (const field of ["slug", "title", "url", "summary", "tags", "added"]) {
    if (!(field in entry)) at(`missing required field "${field}".`);
  }

  if (!isText(entry.slug)) {
    at("slug must be a non-empty string.");
  } else {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug)) {
      at(`slug "${entry.slug}" is not kebab-case.`);
    }
    if (seenSlugs.has(entry.slug)) at(`slug "${entry.slug}" is a duplicate.`);
    seenSlugs.add(entry.slug);
  }

  if (!isText(entry.title)) at("title must be a non-empty string.");
  if (!isText(entry.summary)) at("summary must be a non-empty string.");
  if (!isText(entry.url) || !/^https?:\/\/\S+$/.test(entry.url)) {
    at("url must be an http(s) URL.");
  }

  if (!Array.isArray(entry.tags) || entry.tags.length < 2 || entry.tags.length > 5) {
    at("tags must be an array of 2 to 5 tags.");
  } else if (!entry.tags.every((tag) => isText(tag) && /^[a-z0-9]+$/.test(tag))) {
    at("every tag must be a lowercase single word.");
  }

  if (!isText(entry.added) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.added)) {
    at("added must be a YYYY-MM-DD date.");
  } else if (new Date(entry.added).toISOString().slice(0, 10) !== entry.added) {
    at(`added "${entry.added}" is not a real date.`);
  }

  if (entry.thumb !== undefined) {
    if (!isText(entry.thumb) || !/^thumbs\/[^/\\]+$/.test(entry.thumb)) {
      at("thumb must be a path directly under thumbs/.");
    } else if (!existsSync(resolve(root, entry.thumb))) {
      at(`thumb "${entry.thumb}" does not exist in the repo.`);
    }
  }
});

if (errors.length > 0) {
  console.error(`feed.json has ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`feed.json is valid: ${feed.length} entr${feed.length === 1 ? "y" : "ies"}.`);
