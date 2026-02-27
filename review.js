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
  if (header) {
    header.onmousedown = dragMouseDown;
  }

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

// --- Submit review to Google Sheets ---
function submitReview() {
  const reviewInput = document.getElementById("reviewText");
  const nameInput = document.getElementById("reviewerName");
  const reviewText = reviewInput.value.trim();
  const nameText = nameInput?.value.trim() || "";

  if (!reviewText) {
    alert("Please write a review before submitting!");
    return;
  }

  fetch("https://script.google.com/macros/s/AKfycbx8q42Tmcix2CxNLbYuCelLTiX8HoN1cU0WATSwigYTp7B1PanF0yYgv8WKCo67l3ib/exec", {
    method: "POST",
    body: JSON.stringify({ review: reviewText, name: nameText }),
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

// --- Load and display reviews from Google Sheets ---
async function loadReviews() {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbx8q42Tmcix2CxNLbYuCelLTiX8HoN1cU0WATSwigYTp7B1PanF0yYgv8WKCo67l3ib/exec");
    const reviews = await response.json();

    // Shuffle reviews
    for (let i = reviews.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
    }

    // Display reviews
    const container = document.getElementById("reviewContainer");
    container.innerHTML = ""; // clear previous reviews
    reviews.forEach(r => {
      const div = document.createElement("div");
      div.className = "review";
      div.textContent = `${r.review}\n– ${r.name}`;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load reviews:", err);
  }
}

// --- Load reviews on page load ---
loadReviews();
