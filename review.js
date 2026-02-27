/* --- Responsive Adjustments for Mobile --- */
@media (max-width: 600px) {
  /* Main client reviews window */
  .window {
    width: 95vw;     /* almost full width */
    height: 80vh;    /* most of the height */
    font-size: 14px; /* slightly bigger for readability */
  }

  .content {
    padding: 10px;
  }

  /* Review popup */
  .review-popup {
    width: 85vw;      /* slightly smaller than main */
    height: 60vh;     /* smaller than main window */
    font-size: 14px;
  }

  .review-popup .content textarea,
  .review-popup .content input {
    font-size: 14px;
  }
}

/* Optional: make NEW label a bit more compact on mobile */
@media (max-width: 600px) {
  .review div[style*="color: orange"] {
    font-size: 12px;
  }
}
