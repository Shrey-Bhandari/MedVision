const urlParams = new URLSearchParams(window.location.search);
const diagnosisType = urlParams.get("type");
const pageTitle = document.getElementById("pageTitle");
const formContainer = document.getElementById("formContainer");
const spinner = document.getElementById("loadingSpinner");

// Step validation
if (!diagnosisType) {
  formContainer.innerHTML = "<p>Error: No diagnosis type specified.</p>";
  throw new Error("Diagnosis type not found in URL.");
}

// Set the dynamic title
pageTitle.textContent = `Upload for ${capitalize(diagnosisType)}`;

// Show correct UI based on diagnosis type
if (["pneumonia", "brain", "skin"].includes(diagnosisType)) {
  renderImageUpload();
} else if (diagnosisType === "diabetes") {
  renderNumericForm();
} else {
  formContainer.innerHTML = "<p>Invalid diagnosis type.</p>";
}

// Capitalize function
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Shared async submit handler
async function handleSubmit(formData) {
  spinner.classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    sessionStorage.setItem("prediction", data.prediction);
    if (data.gradcam_path)
      sessionStorage.setItem("gradcamPath", data.gradcam_path);
    if (data.report_id) sessionStorage.setItem("reportId", data.report_id);

    window.location.href = "result.html";
  } catch (err) {
    spinner.classList.add("hidden");
    formContainer.innerHTML += `<p style="color:red;">Error contacting backend: ${err.message}</p>`;
  }
}

// 🖼️ Image Upload UI
function renderImageUpload() {
  formContainer.innerHTML = `
    <form id="uploadForm" enctype="multipart/form-data">
      <label for="fileInput">Upload Image (JPG/PNG):</label><br><br>
      <input type="file" id="fileInput" name="file" accept="image/*" required /><br><br>
      <button type="submit" class="btn-primary">Diagnose</button>
    </form>
  `;

  document
    .getElementById("uploadForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const file = document.getElementById("fileInput").files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", diagnosisType);

      handleSubmit(formData);
    });
}

// 🔢 Numeric Input UI
function renderNumericForm() {
  formContainer.innerHTML = `
    <form id="numericForm">
      <label>Pregnancies:</label><input type="number" name="pregnancies" required><br><br>
      <label>Glucose:</label><input type="number" name="glucose" required><br><br>
      <label>Blood Pressure:</label><input type="number" name="bp" required><br><br>
      <label>Insulin:</label><input type="number" name="insulin" required><br><br>
      <label>BMI:</label><input type="number" step="0.1" name="bmi" required><br><br>
      <label>Age:</label><input type="number" name="age" required><br><br>
      <button type="submit" class="btn-primary">Diagnose</button>
    </form>
  `;

  document
    .getElementById("numericForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(e.target);
      formData.append("type", diagnosisType);

      handleSubmit(formData);
    });
}
