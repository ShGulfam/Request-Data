// Define the web app URL – ensure this matches your deployed Apps Script web app URL.
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxpAnmDeAM7kYGkC4e_DlDpvXNb0AIo5l4lAqpWJSM1SLUqm2AtGejg1UcIahpn_LOD/exec";

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("requestForm");
  const dataTypeRadios = document.getElementsByName("dataType");
  const specificSection = document.getElementById("specificStudentSection");
  const bulkSection = document.getElementById("bulkSection");
  const addStudentQueryBtn = document.getElementById("addStudentQuery");
  const studentQueryContainer = document.getElementById("studentQueryContainer");

  // Toggle sections and disable inputs of hidden section so they aren't validated.
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

  // Allow adding additional "Reg. No. or Name" fields for specific student queries.
  addStudentQueryBtn.addEventListener("click", function() {
    let input = document.createElement("input");
    input.type = "text";
    input.name = "Reg. No. or Name of student";
    input.className = "student-query";
    input.placeholder = "Enter Reg. No. or Name";
    studentQueryContainer.appendChild(input);
  });

  // Handle form submission using fetch to POST data to the Apps Script web app.
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const urlParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlParams.append(key, value);
    });
    fetch(WEB_APP_URL, {
      method: "POST",
      body: urlParams
    })
    .then(response => response.text())
    .then(data => {
      alert("Request submitted successfully! Admin approval pending.");
      form.reset();
      toggleSections();
    })
    .catch(error => {
      console.error("Error:", error);
      alert("There was an error submitting your request.");
    });
  });
});
