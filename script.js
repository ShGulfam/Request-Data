document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("requestForm");
  const dataTypeRadios = document.getElementsByName("dataType");
  const specificSection = document.getElementById("specificStudentSection");
  const bulkSection = document.getElementById("bulkSection");
  const addStudentQueryBtn = document.getElementById("addStudentQuery");
  const studentQueryContainer = document.getElementById("studentQueryContainer");

  // Toggle sections based on selected data type
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
    } else if (selected === "bulk") {
      bulkSection.classList.remove("hidden");
      specificSection.classList.add("hidden");
    }
  }
  dataTypeRadios.forEach(radio => {
    radio.addEventListener("change", toggleSections);
  });
  toggleSections();

  // Allow adding additional "Reg. No. or Name" fields
  addStudentQueryBtn.addEventListener("click", function() {
    let input = document.createElement("input");
    input.type = "text";
    input.name = "Reg. No. or Name of student";
    input.className = "student-query";
    input.placeholder = "Enter Reg. No. or Name";
    studentQueryContainer.appendChild(input);
  });

  // Handle form submission via google.script.run
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const requestData = {};
    formData.forEach((value, key) => {
      if (requestData[key]) {
        if (Array.isArray(requestData[key])) {
          requestData[key].push(value);
        } else {
          requestData[key] = [requestData[key], value];
        }
      } else {
        requestData[key] = value;
      }
    });
    google.script.run
      .withSuccessHandler(response => {
        alert("Request submitted successfully!");
        form.reset();
        toggleSections();
      })
      .submitRequest(requestData);
  });
});
