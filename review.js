// --- Configuration ---
const SHEETDB_URL = "https://sheetdb.io/api/v1/gswf61v23ihpz"; // replace with your SheetDB API URL

// --- Show popup ---
document.getElementById("openReviewWindow").addEventListener("click", function() {
  document.getElementById("reviewPopup").style.display = "block";
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

  fetch(SHEETDB_URL, {
    method: "POST",
    body: JSON.stringify({ data: [{ review: reviewText, name: nameText }] }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Review submitted:", data);
    alert("Review submitted successfully!");
    reviewInput.value = "";
    if (nameInput) nameInput.value = "";
    loadReviews(); // refresh reviews
  })
  .catch(err => {
    console.error("Error submitting review:", err);
    alert("There was an error submitting your review. Please try again.");
  });
}

document.getElementById("reviewSubmitButton").addEventListener("click", function(e) {
  e.preventDefault();
  submitReview();
});

// --- Load reviews from SheetDB ---
function loadReviews() {
  fetch(SHEETDB_URL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("reviewContainer");
      container.innerHTML = "";
      const reviews = data.data || [];

      // Sort by timestamp descending (newest first)
      reviews.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : 0;
        const dateB = b.timestamp ? new Date(b.timestamp) : 0;
        return dateB - dateA;
      });

      const now = new Date();
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

      reviews.forEach(item => {
        const div = document.createElement("div");
        div.className = "review";

        // Check if review is within the last 7 days
        let newLabel = "";
        if (item.timestamp) {
          const reviewDate = new Date(item.timestamp);
          if (now - reviewDate <= oneWeekMs) {
            newLabel = `<div style="color: orange; font-weight: bold; margin-bottom: 4px;">NEW</div>`;
          }
        }

        div.innerHTML = `${newLabel}<strong>${item.name || "Anonymous"}</strong><br>${item.review}`;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error loading reviews:", err);
    });
}

window.addEventListener("DOMContentLoaded", loadReviews);
