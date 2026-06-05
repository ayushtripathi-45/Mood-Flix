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
  const grid = document.getElementById("watchlist-grid");
  if (!user || !grid) return;

  grid.innerHTML = '<p>Loading...</p>';

  try {
    const watchlistRef = ref(db, 'watchlists/' + user.uid);
    const snapshot = await get(watchlistRef);
    
    if (!snapshot.exists()) {
      grid.innerHTML = '<p>Watchlist is empty.</p>';
      return;
    }

    grid.innerHTML = '';
    const data = snapshot.val();
    
    // ... baaki code same rahega
Object.keys(data).forEach((key) => {
  const item = data[key];
  const div = document.createElement("div");
  div.className = "watchlist-item glass-card";
  
  // Image load na ho toh fallback image dikhane ke liye
  div.innerHTML = `
    <img src="${item.poster || 'placeholder.jpg'}" alt="${item.title}" style="width:100%; height:200px; object-fit:cover;">
    <p>${item.title}</p>
    <button class="btn-primary" data-key="${key}">Remove</button>
  `;
  // ... baaki code
      
      div.querySelector("button").onclick = async () => {
        await remove(ref(db, `watchlists/${user.uid}/${key}`));
        div.remove();
        showToast("Removed.", "success");
      };
      grid.appendChild(div);
    });
  } catch (e) {
    grid.innerHTML = '<p>Error loading.</p>';
  }
}