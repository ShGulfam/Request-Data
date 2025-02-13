document.addEventListener("DOMContentLoaded", function() {
  // Elements
  const form = document.getElementById("requestForm");
  const dataTypeRadios = document.getElementsByName("dataType");
  const specificSection = document.getElementById("specificStudentSection");
  const bulkSection = document.getElementById("bulkSection");
  const addStudentQueryBtn = document.getElementById("addStudentQuery");
  const studentQueryContainer = document.getElementById("studentQueryContainer");
  
  // Function to toggle sections based on data type selection.
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
  
  // Attach change event listener to radio buttons.
  dataTypeRadios.forEach(radio => {
    radio.addEventListener("change", toggleSections);
  });
  
  // Initial toggle in case a radio is preselected.
  toggleSections();
  
  // Allow adding additional "Reg. No. or Name" input fields.
  addStudentQueryBtn.addEventListener("click", function() {
    let input = document.createElement("input");
    input.type = "text";
    input.name = "studentQuery[]";
    input.className = "student-query";
    input.placeholder = "Enter Reg. No. or Name";
    studentQueryContainer.appendChild(input);
  });
});
