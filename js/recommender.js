import { saveToWatchlist } from './db.js';
import { CONFIG } from './config.js';
import { fetchMetaRating } from './omdb.js';
import { fetchAcousticTracks, searchDeezerPreviewAsset } from './music.js';
import { discoverMediaByVibe } from './tmdb.js';

window.executeOrchestratedPipeline = async function(mood, lang) {
  document.getElementById("loader-wrapper")?.classList.add("hidden");
  const container = document.getElementById("results-wrapper");
  if (!container) return;

  container.classList.remove("hidden");
  const moodLabel = document.getElementById("detected-mood-label");
  if (moodLabel) moodLabel.textContent = mood.toUpperCase();

  setupTabsInterface();

  const [movies, series, tracks] = await Promise.all([
    discoverMediaByVibe("movie", mood, lang),
    discoverMediaByVibe("tv", mood, lang),
    fetchAcousticTracks(mood)
  ]);

  renderMoviesToDOM(movies);
  renderSeriesToDOM(series);
  renderTracksToDOM(tracks);
};

function setupTabsInterface() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active-panel"));
      btn.classList.add("active");
      document.getElementById(`${btn.dataset.tab}-tab`)?.classList.add("active-panel");
    };
  });
}

async function renderMoviesToDOM(items) {
  const target = document.getElementById("movies-grid");
  if (!target) return;
  if (!items || items.length === 0) {
    target.innerHTML = "<p style='color:var(--text-muted);'>No titles matched metrics.</p>";
    return;
  }

  target.innerHTML = "";
  for (const item of items) {
    const year = (item.release_date || "2026").split("-")[0];
    const rating = await fetchMetaRating(item.title, year);
    const poster = item.poster_path ? `${CONFIG.TMDB_IMG}${item.poster_path}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400";
    const card = document.createElement("div");
    card.className = "media-card";
    card.innerHTML = `
      <img src="${poster}" alt="${item.title} Poster">
      <div class="media-info">
        <h4 class="media-title">${item.title}</h4>
        <div class="card-meta">
          <span>${year}</span>
          <span class="rating-badge">★ ${rating}</span>
        </div>
        <button class="save-btn" type="button">Add to Watchlist</button>
      </div>
    `;
    card.querySelector(".save-btn").onclick = () => saveToWatchlist(item.title, poster, "Movie");
    target.appendChild(card);
  }
}

async function renderSeriesToDOM(items) {
  const target = document.getElementById("series-grid");
  if (!target) return;
  if (!items || items.length === 0) {
    target.innerHTML = "<p style='color:var(--text-muted);'>No catalog serialization matches structural constraints.</p>";
    return;
  }

  target.innerHTML = "";
  for (const item of items) {
    const year = (item.first_air_date || "2026").split("-")[0];
    const poster = item.poster_path ? `${CONFIG.TMDB_IMG}${item.poster_path}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400";
    const card = document.createElement("div");
    card.className = "media-card";
    card.innerHTML = `
      <img src="${poster}" alt="${item.name} Poster">
      <div class="media-info">
        <h4 class="media-title">${item.name}</h4>
        <div class="card-meta">
          <span>${year}</span>
          <span class="rating-badge" style="background:rgba(69,123,157,0.15); color:var(--accent-blue);">TV</span>
        </div>
        <button class="save-btn" type="button">Add to Watchlist</button>
      </div>
    `;
    card.querySelector(".save-btn").onclick = () => saveToWatchlist(item.name, poster, "TV Series");
    target.appendChild(card);
  }
}

async function renderTracksToDOM(items) {
  const target = document.getElementById("songs-grid");
  if (!target) return;
  if (!items || items.length === 0) {
    target.innerHTML = "<p style='color:var(--text-muted);'>Audio network interface yielded zero arrays.</p>";
    return;
  }

  target.innerHTML = "";
  for (const item of items) {
    const assetMeta = await searchDeezerPreviewAsset(item.artist.name, item.name);
    const card = document.createElement("div");
    card.className = "track-card";
    card.innerHTML = `
      <img src="${assetMeta.albumCover}" alt="Album Cover">
      <div class="track-details">
        <h4>${item.name}</h4>
        <p>${item.artist.name}</p>
      </div>
      ${assetMeta.previewUrl ? `<button class="audio-ctrl-btn" data-src="${assetMeta.previewUrl}" type="button">▶</button>` : ''}
      <a href="${item.url}" target="_blank" class="track-link" rel="noreferrer">FM↗</a>
    `;
    target.appendChild(card);
  }
}

window.renderMoviesToDOM = renderMoviesToDOM;
window.renderSeriesToDOM = renderSeriesToDOM;
window.renderTracksToDOM = renderTracksToDOM;
