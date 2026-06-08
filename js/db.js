import { db, auth } from './firebase-config.js';
import { ref, push, get, remove, query, equalTo, orderByChild } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { showToast } from './main.js';

export async function saveToWatchlist(title, posterUrl, mediaType) {
  const user = auth.currentUser;
  if (!user) {
    showToast("Login required.", "error");
    return;
  }

  // Realtime Database mein path aisa banta hai: watchlists/userId/movieId
  const watchlistRef = ref(db, 'watchlists/' + user.uid);
  
  try {
    await push(watchlistRef, {
      title: title,
      poster: posterUrl,
      type: mediaType,
      addedAt: Date.now()
    });
    showToast("Added to your Watchlist!", "success");
  } catch (error) {
    showToast("Error saving.", "error");
  }
}

export async function fetchAndRenderWatchlist() {
  const user = auth.currentUser;
  const moviesGrid = document.getElementById("movies-watchlist-grid");
  const seriesGrid = document.getElementById("series-watchlist-grid");
  if (!user) return;

  if (moviesGrid) moviesGrid.innerHTML = '<p>Loading...</p>';
  if (seriesGrid) seriesGrid.innerHTML = '<p>Loading...</p>';

  try {
    const watchlistRef = ref(db, 'watchlists/' + user.uid);
    const snapshot = await get(watchlistRef);
    
    if (!snapshot.exists()) {
      if (moviesGrid) moviesGrid.innerHTML = '<p>No favourite movies.</p>';
      if (seriesGrid) seriesGrid.innerHTML = '<p>No favourite web series.</p>';
      return;
    }

    const data = snapshot.val();
    if (moviesGrid) moviesGrid.innerHTML = '';
    if (seriesGrid) seriesGrid.innerHTML = '';
    
    Object.keys(data).forEach((key) => {
      const item = data[key];
      const div = document.createElement("div");
      div.className = "watchlist-item glass-card";
      
      div.innerHTML = `
        <img src="${item.poster || 'placeholder.jpg'}" alt="${item.title}" style="width:100%; height:200px; object-fit:cover;">
        <p>${item.title}</p>
        <button class="btn-primary" data-key="${key}">Remove</button>
      `;
      
      div.querySelector("button").onclick = async () => {
        await remove(ref(db, `watchlists/${user.uid}/${key}`));
        div.remove();
        showToast("Removed.", "success");
      };
      
      const type = (item.type || "").toLowerCase();
      if (type.includes("movie")) {
        if (moviesGrid) moviesGrid.appendChild(div);
      } else if (type.includes("tv")) {
        if (seriesGrid) seriesGrid.appendChild(div);
      }
    });
  } catch (e) {
    if (moviesGrid) moviesGrid.innerHTML = '<p>Error loading.</p>';
    if (seriesGrid) seriesGrid.innerHTML = '<p>Error loading.</p>';
  }
}