// --- Configuration ---
const SHEETDB_URL = "https://sheetdb.io/api/v1/gswf61v23ihpz"; // replace with your SheetDB API URL

// --- Show popup ---
document.getElementById("openReviewWindow").addEventListener("click", function() {
  const popup = document.getElementById("reviewPopup");
  popup.style.display = "flex";
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
      console.log("RAW RESPONSE:", data);
      const container = document.getElementById("reviewContainer");
      container.innerHTML = "";

      const reviews = Array.isArray(data) ? data : data.data || [];

      // Sort or shuffle as you like
      reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // newest first

      reviews.forEach(item => {
        const div = document.createElement("div");
        div.className = "review";

        // Check if the review is less than 7 days old
        const reviewDate = new Date(item.timestamp);
        const now = new Date();
        const diffDays = (now - reviewDate) / (1000 * 60 * 60 * 24); // diff in days

        const newBadge = diffDays <= 7 
          ? `<div style="color: orange; font-weight: bold; font-size: 10px;">NEW</div>` 
          : "";

        div.innerHTML = `
          ${newBadge}
          <strong>${item.name || "Anonymous"}</strong><br>
          ${item.review}
        `;
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error loading reviews:", err);
    });
}

// --- Load reviews on page load ---
window.addEventListener("DOMContentLoaded", loadReviews);
