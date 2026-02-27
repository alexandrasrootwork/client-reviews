// --- Configuration ---
const SHEETDB_URL = "https://sheetdb.io/api/v1/gswf61v23ihpz"; // Your SheetDB API URL

// --- Show popup ---
document.getElementById("openReviewWindow").addEventListener("click", function() {
  const popup = document.getElementById("reviewPopup");
  popup.style.display = "block";
});

// --- Close popup ---
document.getElementById("closeReviewPopup").addEventListener("click", function() {
  document.getElementById("reviewPopup").style.display = "none";
});

// --- Make draggable (desktop + mobile) ---
dragElement(document.getElementById("reviewPopup"));

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = document.getElementById("reviewPopupTitle");
  if (!header) return;
  
  header.onmousedown = dragMouseDown;
  header.ontouchstart = dragTouchStart;

  // Mouse drag
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = drag;
  }

  function drag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  // Touch drag
  function dragTouchStart(e) {
    e.preventDefault();
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    document.ontouchend = closeTouchDrag;
    document.ontouchmove = touchDrag;
  }

  function touchDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeTouchDrag() {
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// --- Submit review to SheetDB ---
function submitReview() {
  const reviewInput = document.getElementById("reviewInput");
  const nameInput = document.getElementById("reviewName");
  const reviewText = reviewInput.value.trim();
  const nameText = nameInput?.value.trim() || "";

  if (!reviewText) {
    alert("Please write a review before submitting!");
    return;
  }

  // Include timestamp
  const timestamp = new Date().toISOString();

  fetch(SHEETDB_URL, {
    method: "POST",
    body: JSON.stringify({ data: [{ review: reviewText, name: nameText, timestamp }] }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Review submitted:", data);
    alert("Review submitted successfully!");
    reviewInput.value = "";
    if (nameInput) nameInput.value = "";
    loadReviews();
  })
  .catch(err => {
    console.error("Error submitting review:", err);
    alert("There was an error submitting your review. Please try again.");
  });
}

// --- Attach submit button ---
document.getElementById("reviewSubmitButton").addEventListener("click", function(e) {
  e.preventDefault();
  submitReview();
});

// --- Load reviews ---
function loadReviews() {
  fetch(SHEETDB_URL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("reviewContainer");
      container.innerHTML = "";
      const reviews = data.data || [];

      const now = new Date();
      const newThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

      // Separate NEW reviews
      const newReviews = [];
      const oldReviews = [];

      reviews.forEach(item => {
        const reviewDate = item.timestamp ? new Date(item.timestamp) : null;
        if (reviewDate && (now - reviewDate <= newThreshold)) {
          newReviews.push(item);
        } else {
          oldReviews.push(item);
        }
      });

      // Shuffle old reviews
      for (let i = oldReviews.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [oldReviews[i], oldReviews[j]] = [oldReviews[j], oldReviews[i]];
      }

      // Display NEW reviews first
      newReviews.forEach(item => {
        const div = document.createElement("div");
        div.className = "review";
        div.innerHTML = `<div style="color: orange; font-weight: bold;">NEW</div>
                         <strong>${item.name || "Anonymous"}</strong><br>${item.review}`;
        container.appendChild(div);
      });

      // Display shuffled old reviews
      oldReviews.forEach(item => {
        const div = document.createElement("div");
        div.className = "review";
        div.innerHTML = `<strong>${item.name || "Anonymous"}</strong><br>${item.review}`;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Error loading reviews:", err));
}

// --- Load reviews on page load ---
window.addEventListener("DOMContentLoaded", loadReviews);
