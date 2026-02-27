// --- Configuration ---
const SHEETDB_URL = "https://sheetdb.io/api/v1/gswf61v23ihpz"; // your SheetDB API URL
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// --- Show popup ---
document.getElementById("openReviewWindow").addEventListener("click", function() {
  const popup = document.getElementById("reviewPopup");
  popup.style.display = "block";
});

// --- Close popup ---
document.getElementById("closeReviewPopup").addEventListener("click", function() {
  document.getElementById("reviewPopup").style.display = "none";
});

// --- Make draggable ---
dragElement(document.getElementById("reviewPopup"));

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = document.getElementById("reviewPopupTitle");
  if (header) header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
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

  const timestamp = new Date().toISOString(); // add timestamp for "new" label

  fetch(SHEETDB_URL, {
    method: "POST",
    body: JSON.stringify({ data: [{ review: reviewText, name: nameText, timestamp: timestamp }] }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Review submitted:", data);
    alert("Review submitted successfully!");
    reviewInput.value = "";
    if (nameInput) nameInput.value = "";
    loadReviews(); // refresh reviews after submitting
  })
  .catch(err => {
    console.error("Error submitting review:", err);
    alert("There was an error submitting your review. Please try again.");
  });
}

// --- Attach submit function to button ---
document.getElementById("reviewSubmitButton").addEventListener("click", function(e) {
  e.preventDefault(); // prevent form reload
  submitReview();
});

// --- Load reviews from SheetDB ---
function loadReviews() {
  fetch(SHEETDB_URL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("reviewContainer");
      container.innerHTML = ""; // clear existing reviews
      const reviews = data.data || []; // SheetDB returns { data: [...] }

      const now = new Date();
      const newReviews = [];
      const oldReviews = [];

      // Separate new and old reviews
      reviews.forEach(item => {
        const reviewDate = new Date(item.timestamp);
        if (now - reviewDate <= ONE_WEEK_MS) {
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

      const displayReviews = [...newReviews, ...oldReviews]; // new reviews on top

      // Display reviews
      displayReviews.forEach(item => {
        const div = document.createElement("div");
        div.className = "review";

        let content = "";

        // If review is new, add orange NEW label above it
        if (now - new Date(item.timestamp) <= ONE_WEEK_MS) {
          content += `<div style="color: orange; font-weight: bold; font-family: 'MS Sans Serif', Tahoma, sans-serif;">NEW</div>`;
        }

        content += `<strong>${item.name || "Anonymous"}</strong><br>${item.review}`;
        div.innerHTML = content;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error loading reviews:", err);
    });
}

// --- Load reviews on page load ---
window.addEventListener("DOMContentLoaded", loadReviews);
