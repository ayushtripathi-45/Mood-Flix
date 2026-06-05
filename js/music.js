import { CONFIG } from './config.js';

const TAG_BY_MOOD = {
  happy: "happy",
  sad: "sad",
  chill: "chillout",
  romantic: "love",
  thriller: "dark",
  focused: "workout"
};

const FALLBACK_TRACKS = [
  withMusicLinks({ name: "Good as Hell", artist: { name: "Lizzo" }, album: "Cuz I Love You", cover: "", previewUrl: "", url: "https://www.last.fm/music/Lizzo/_/Good+as+Hell", _source: "fallback" }),
  withMusicLinks({ name: "Someone Like You", artist: { name: "Adele" }, album: "21", cover: "", previewUrl: "", url: "https://www.last.fm/music/Adele/_/Someone+Like+You", _source: "fallback" }),
  withMusicLinks({ name: "Sunset Lover", artist: { name: "Petit Biscuit" }, album: "Presence", cover: "", previewUrl: "", url: "https://www.last.fm/music/Petit+Biscuit/_/Sunset+Lover", _source: "fallback" }),
  withMusicLinks({ name: "All of Me", artist: { name: "John Legend" }, album: "Love in the Future", cover: "", previewUrl: "", url: "https://www.last.fm/music/John+Legend/_/All+of+Me", _source: "fallback" })
];

export async function fetchAcousticTracks(mood) {
  try {
    const tag = TAG_BY_MOOD[mood] || "popular";
    const data = await lastFmFetch({
      method: "tag.gettoptracks",
      tag,
      limit: 10
    });
    const tracks = data?.tracks?.track || [];
    return tracks.map(normalizeLastFmTrack).filter(Boolean);
  } catch (error) {
    console.warn("LastFM mood tracks failed, using fallback tracks.", error);
    return FALLBACK_TRACKS;
  }
}

export async function fetchFeaturedTracks() {
  try {
    const data = await lastFmFetch({
      method: "chart.gettoptracks",
      limit: 12
    });
    const tracks = data?.tracks?.track || [];
    return tracks.map(normalizeLastFmTrack).filter(Boolean);
  } catch (error) {
    console.warn("LastFM featured tracks failed, using fallback tracks.", error);
    return FALLBACK_TRACKS;
  }
}

export async function searchDeezerPreviewAsset(artistName, trackName) {
  try {
    const data = await lastFmFetch({
      method: "track.getInfo",
      artist: artistName,
      track: trackName
    });
    const track = data?.track;
    return {
      albumCover: getLargestImage(track?.album?.image) || getTrackPlaceholder(trackName),
      previewUrl: "",
      albumName: track?.album?.title || "Album unavailable"
    };
  } catch {
    return {
      albumCover: getTrackPlaceholder(trackName),
      previewUrl: "",
      albumName: "Album unavailable"
    };
  }
}

async function lastFmFetch(params) {
  const url = new URL(CONFIG.LASTFM_BASE);
  url.searchParams.set("api_key", CONFIG.LASTFM_KEY);
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`LastFM ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.message || "LastFM API error");
  return data;
}

function normalizeLastFmTrack(track) {
  const artistName = typeof track.artist === "string" ? track.artist : track.artist?.name;
  if (!track.name || !artistName) return null;
  return withMusicLinks({
    name: track.name,
    artist: { name: artistName },
    album: "LastFM top track",
    cover: getLargestImage(track.image) || getTrackPlaceholder(track.name),
    previewUrl: "",
    url: track.url || `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(track.name)}`,
    _source: "lastfm"
  });
}

function withMusicLinks(track) {
  const query = `${track.name} ${track.artist.name}`;
  return {
    ...track,
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} official audio`)}`
  };
}

function getLargestImage(images = []) {
  const image = [...images].reverse().find(item => item["#text"]);
  return image?.["#text"] || "";
}

function getTrackPlaceholder(trackName) {
  return `https://via.placeholder.com/500x500.png?text=${encodeURIComponent(trackName)}`;
}

window.fetchAcousticTracks = fetchAcousticTracks;
window.searchDeezerPreviewAsset = searchDeezerPreviewAsset;
