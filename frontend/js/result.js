const resultContainer = document.getElementById("resultContainer");

// Fetch stored prediction data
const prediction = sessionStorage.getItem("prediction");
const gradcamPath = sessionStorage.getItem("gradcamPath");
const reportId = sessionStorage.getItem("reportId");

// Display error if missing
if (!prediction) {
  resultContainer.innerHTML =
    "<p>Error: No prediction data found. Please upload again.</p>";
} else {
  resultContainer.innerHTML = `
    <div class="result-box">
      <h2>Prediction Result:</h2>
      <p class="prediction">${prediction}</p>

      ${
        gradcamPath
          ? `
        <h3>Model Explanation (Grad-CAM):</h3>
        <img src="http://localhost:5000/${gradcamPath}" alt="Grad-CAM Visualization" class="gradcam-img" />
      `
          : ""
      }

      ${
        reportId
          ? `
        <br><button onclick="window.location.href='http://localhost:5000/report/${reportId}'" class="btn-primary">
          View Medical Report
        </button>
      `
          : ""
      }
    </div>
  `;
}
