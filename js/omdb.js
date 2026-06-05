import { CONFIG } from './config.js';

export async function fetchMetaRating(title, year) {
  const data = await fetchOmdbDetails(title, year);
  return data?.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : "7.2";
}

export async function fetchOmdbDetails(title, year) {
  if (!CONFIG.OMDB_KEY) return null;
  try {
    const url = new URL(CONFIG.OMDB_BASE);
    url.searchParams.set("apikey", CONFIG.OMDB_KEY);
    url.searchParams.set("t", title);
    if (year) url.searchParams.set("y", year);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`OMDB ${res.status}`);
    const data = await res.json();
    return data.Response === "True" ? data : null;
  } catch (error) {
    console.warn("OMDB details failed.", error);
    return null;
  }
}

window.fetchMetaRating = fetchMetaRating;
window.fetchOmdbDetails = fetchOmdbDetails;
