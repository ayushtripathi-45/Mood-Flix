import { CONFIG } from './config.js';

const FALLBACK_MOVIES = [
  {
    id: "fallback-dune",
    title: "Dune: Part Two",
    titleType: "Movie",
    origin: "Hollywood",
    runtime: "2h 46m",
    rating: "8.6",
    cast: "Timothee Chalamet, Zendaya, Rebecca Ferguson",
    overview: "Paul Atreides unites with Chani and the Fremen on a path of revenge and destiny.",
    trailerUrl: "https://www.youtube.com/results?search_query=Dune%20Part%20Two%20official%20trailer",
    poster_path: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    release_date: "2024-03-01",
    _source: "fallback"
  },
  {
    id: "fallback-fighter",
    title: "Fighter",
    titleType: "Movie",
    origin: "Bollywood",
    runtime: "2h 46m",
    rating: "7.1",
    cast: "Hrithik Roshan, Deepika Padukone, Anil Kapoor",
    overview: "Aerial action drama with emotion, patriotism, and high-energy flight sequences.",
    trailerUrl: "https://www.youtube.com/results?search_query=Fighter%20official%20trailer",
    poster_path: "/1xv5hD4UQxj6eFv1QwWg0s1KpY9.jpg",
    release_date: "2024-01-25",
    _source: "fallback"
  }
];

const MOVIE_GENRES_BY_MOOD = {
  happy: 35,
  sad: 18,
  chill: 10751,
  romantic: 10749,
  thriller: 53,
  focused: 99
};

const TV_GENRES_BY_MOOD = {
  happy: 35,
  sad: 18,
  chill: 99,
  romantic: 18,
  thriller: 80,
  focused: 99
};

export async function fetchTrending() {
  try {
    const data = await tmdbFetch('/trending/movie/week', { page: 1 });
    const results = (data.results || []).filter(item => item.poster_path).slice(0, 12);
    return Promise.all(results.map(item => normalizeMovie(item)));
  } catch (error) {
    console.warn('TMDB trending failed, returning empty list.', error);
    return [];
  }
}

  export async function fetchFeaturedMovies() {
    return fetchTrending();
  }

  export async function discoverMediaByVibe(kind, mood, lang = "both") {
    const genre = kind === "tv" ? TV_GENRES_BY_MOOD[mood] : MOVIE_GENRES_BY_MOOD[mood];
    const language = lang === "hi" || lang === "en" ? lang : undefined;
    const endpoint = kind === "tv" ? "/discover/tv" : "/discover/movie";

    try {
      const data = await tmdbFetch(endpoint, {
        page: 1,
        sort_by: "popularity.desc",
        with_genres: genre,
        with_original_language: language
      });
      const results = (data.results || []).filter(item => item.poster_path).slice(0, 10);
      if (kind === "tv") return Promise.all(results.map(item => normalizeSeries(item)));
      return Promise.all(results.map(item => normalizeMovie(item)));
    } catch (error) {
      console.warn(`TMDB ${kind} discovery failed, returning empty list.`, error);
      return [];
    }
  }


export async function fetchMovieDetails(id, type = "movie") {
  if (!id || String(id).startsWith("fallback")) return null;
  try {
    const endpoint = type === "tv" ? `/tv/${id}` : `/movie/${id}`;
    return tmdbFetch(endpoint, { append_to_response: "credits,videos" });
  } catch {
    return null;
  }
}

export function getFallbackPoster(title) {
  return `https://via.placeholder.com/500x750.png?text=${encodeURIComponent(title)}`;
}

export function getImageUrl(path, title = "MoodFlix") {
  return path ? `${CONFIG.TMDB_IMG}${path}` : getFallbackPoster(title);
}

async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${CONFIG.TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", CONFIG.TMDB_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

async function normalizeMovie(item) {
  const details = await fetchMovieDetails(item.id, "movie");
  const cast = details?.credits?.cast?.slice(0, 4).map(person => person.name).join(", ") || "Cast unavailable";
  const runtime = details?.runtime ? formatRuntime(details.runtime) : "Runtime unavailable";
  return {
    ...item,
    title: item.title || item.name,
    titleType: "Movie",
    origin: getOrigin(item.original_language),
    runtime,
    rating: Number(item.vote_average || 0).toFixed(1),
    cast,
    overview: item.overview || "Overview unavailable.",
    trailerUrl: getTrailerUrl(details, item.title || item.name),
    _source: "tmdb"
  };
}

async function normalizeSeries(item) {
  const details = await fetchMovieDetails(item.id, "tv");
  const cast = details?.credits?.cast?.slice(0, 4).map(person => person.name).join(", ") || "Cast unavailable";
  return {
    ...item,
    name: item.name || item.title,
    titleType: "Web Series",
    origin: getOrigin(item.original_language),
    runtime: details?.episode_run_time?.[0] ? `${details.episode_run_time[0]}m episodes` : "Runtime unavailable",
    rating: Number(item.vote_average || 0).toFixed(1),
    cast,
    overview: item.overview || "Overview unavailable.",
    trailerUrl: getTrailerUrl(details, item.name || item.title),
    _source: "tmdb"
  };
}

function getTrailerUrl(details, title) {
  const videos = details?.videos?.results || [];
  const trailer = videos.find(video =>
    video.site === "YouTube" &&
    video.type === "Trailer" &&
    video.official
  ) || videos.find(video => video.site === "YouTube" && video.type === "Trailer")
    || videos.find(video => video.site === "YouTube");

  if (trailer?.key) return `https://www.youtube.com/watch?v=${trailer.key}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`;
}

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

function getOrigin(language) {
  if (language === "hi") return "Bollywood";
  if (language === "en") return "Hollywood";
  return language ? language.toUpperCase() : "Unknown";
}

window.fetchTrending = fetchTrending;
window.discoverMediaByVibe = discoverMediaByVibe;
