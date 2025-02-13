var WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwaOGs1kZZoSYCpvaOkf5OahiimVbyWWqhAHgFAxXwrHrAcV0OLqGFs1DnOlB1DfDuY/exec";
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("requestForm");
  const dataTypeRadios = document.getElementsByName("dataType");
  const specificSection = document.getElementById("specificStudentSection");
  const bulkSection = document.getElementById("bulkSection");
  const addStudentQueryBtn = document.getElementById("addStudentQuery");
  const studentQueryContainer = document.getElementById("studentQueryContainer");

  // Toggle sections and disable fields of the hidden section
  function toggleSections() {
    let selected = "";
    dataTypeRadios.forEach(radio => {
      if (radio.checked) {
        selected = radio.value;
      }
    });
    if (selected === "student") {
      specificSection.classList.remove("hidden");
      bulkSection.classList.add("hidden");
      Array.from(specificSection.querySelectorAll("input, select")).forEach(el => el.disabled = false);
      Array.from(bulkSection.querySelectorAll("input, select")).forEach(el => el.disabled = true);
    } else if (selected === "bulk") {
      bulkSection.classList.remove("hidden");
      specificSection.classList.add("hidden");
      Array.from(bulkSection.querySelectorAll("input, select")).forEach(el => el.disabled = false);
      Array.from(specificSection.querySelectorAll("input, select")).forEach(el => el.disabled = true);
    }
  }
  dataTypeRadios.forEach(radio => {
    radio.addEventListener("change", toggleSections);
  });
  toggleSections();

  // Add additional "Reg. No. or Name" field for specific student queries
  addStudentQueryBtn.addEventListener("click", function() {
    let input = document.createElement("input");
    input.type = "text";
    input.name = "Reg. No. or Name of student";
    input.className = "student-query";
    input.placeholder = "Enter Reg. No. or Name";
    studentQueryContainer.appendChild(input);
  });

  // On submit, use fetch to send form data to the Apps Script web app.
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    // Convert formData to URL-encoded string.
    const urlParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlParams.append(key, value);
    });
    // Use your deployed web app URL
    fetch(WEB_APP_URL, {
      method: "POST",
      body: urlParams
    })
    .then(response => response.text())
    .then(data => {
      alert("Request submitted successfully!");
      form.reset();
      toggleSections();
    })
    .catch(error => {
      console.error("Error:", error);
      alert("There was an error submitting your request.");
    });
  });
});
