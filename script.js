// script.js

// **REPLACE WITH YOUR ACTUAL DEPLOYED WEB APP URL**
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwaOGs1kZZoSYCpvaOkf5OahiimVbyWWqhAHgFAxXwrHrAcV0OLqGFs1DnOlB1DfDuY/exec";

// Helper to get selected values from a multiple select element.
function getSelectValues(select) {
  let result = [];
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].selected) {
      result.push(select.options[i].value);
    }
  }
  return result;
}

document.addEventListener("DOMContentLoaded", function() {
  const dataTypeRadios = document.getElementsByName("dataType");
  const specificSection = document.getElementById("specificSection");
  const bulkSection = document.getElementById("bulkSection");

  // Disable inactive section's inputs so required fields aren’t validated.
  function toggleSectionInputs(section, disable) {
    section.querySelectorAll("input, select, textarea, button").forEach(el => {
      el.disabled = disable;
    });
  }

  // Initially disable bulk section inputs.
  toggleSectionInputs(bulkSection, true);

  // Toggle sections when data type radio buttons change.
  dataTypeRadios.forEach(radio => {
    radio.addEventListener("change", function() {
      if (this.value === "specific student") {
        specificSection.style.display = "block";
        bulkSection.style.display = "none";
        toggleSectionInputs(specificSection, false);
        toggleSectionInputs(bulkSection, true);
      } else if (this.value === "bulk") {
        bulkSection.style.display = "block";
        specificSection.style.display = "none";
        toggleSectionInputs(bulkSection, false);
        toggleSectionInputs(specificSection, true);
      }
    });
  });

  // Update visibility of "Remove" buttons in student query blocks.
  function updateRemoveButtons() {
    const queryBlocks = document.querySelectorAll(".student-query");
    queryBlocks.forEach(block => {
      const removeBtn = block.querySelector(".removeStudentBtn");
      removeBtn.style.display = queryBlocks.length > 1 ? "inline-block" : "none";
    });
  }

  // Add another student query block.
  document.getElementById("addStudentBtn").addEventListener("click", function() {
    const container = document.getElementById("studentQueriesContainer");
    const queryDiv = document.createElement("div");
    queryDiv.className = "student-query";
    queryDiv.innerHTML = `
      <hr>
      <div class="form-group">
        <label>Reg. No. or Name of Student *</label>
        <input type="text" name="studentQuery" placeholder="Enter student name or reg. number" required>
      </div>
      <div class="form-group">
        <label>Class (Select one or more)</label>
        <select name="studentClass" multiple>
          <option value="9th">9th</option>
          <option value="10th">10th</option>
          <option value="11th">11th</option>
          <option value="12th">12th</option>
        </select>
      </div>
      <div class="form-group">
        <label>Session (Select one or more)</label>
        <select name="studentSession" multiple>
          <option value="2022-23">2022-23</option>
          <option value="2023-24">2023-24</option>
          <option value="2024-25">2024-25</option>
        </select>
      </div>
      <button type="button" class="removeStudentBtn">Remove</button>
    `;
    container.appendChild(queryDiv);
    updateRemoveButtons();
    queryDiv.querySelector(".removeStudentBtn").addEventListener("click", function() {
      if (document.querySelectorAll(".student-query").length > 1) {
        queryDiv.remove();
        updateRemoveButtons();
      }
    });
  });

  // Attach remove functionality for the initial query block.
  const initialRemoveBtn = document.querySelector(".student-query .removeStudentBtn");
  if (initialRemoveBtn) {
    initialRemoveBtn.addEventListener("click", function() {
      if (document.querySelectorAll(".student-query").length > 1) {
        this.parentElement.remove();
        updateRemoveButtons();
      }
    });
  }

  // Handle form submission.
  document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const form = e.target;
    let formData = {};

    formData.email = form.email.value;
    formData.dataType = form.dataType.value;

    if (formData.dataType === "specific student") {
      formData.specificFormat = form.specificFormat.value;
      let specificColumns = [];
      form.querySelectorAll("input[name='specificColumns']:checked").forEach(cb => {
        specificColumns.push(cb.value);
      });
      formData.specificColumns = specificColumns;

      let studentQueries = [];
      document.querySelectorAll(".student-query").forEach(div => {
        const query = div.querySelector("input[name='studentQuery']").value;
        const classSelect = div.querySelector("select[name='studentClass']");
        const sessionSelect = div.querySelector("select[name='studentSession']");
        const sClass = getSelectValues(classSelect);
        const session = getSelectValues(sessionSelect);
        studentQueries.push({
          query: query,
          class: sClass,
          session: session
        });
      });
      formData.studentQueries = studentQueries;
    } else if (formData.dataType === "bulk") {
      formData.bulkName = form.bulkName.value;
      formData.bulkClass = getSelectValues(form.bulkClass);
      formData.bulkSession = getSelectValues(form.bulkSession);
      formData.bulkFormat = form.bulkFormat.value;
      let bulkColumns = [];
      form.querySelectorAll("input[name='bulkColumns']:checked").forEach(cb => {
        bulkColumns.push(cb.value);
      });
      formData.bulkColumns = bulkColumns;
    }

    // Disable submit button and show submitting message.
    form.querySelector("button[type='submit']").disabled = true;
    document.getElementById("result").innerText = "Submitting request...";

    // Use Fetch API to POST the JSON data.
    fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("result").innerText = data.message;
      form.querySelector("button[type='submit']").disabled = false;
      form.reset();
      specificSection.style.display = "block";
      bulkSection.style.display = "none";
      toggleSectionInputs(specificSection, false);
      toggleSectionInputs(bulkSection, true);
      const container = document.getElementById("studentQueriesContainer");
      container.innerHTML = container.querySelector(".student-query").outerHTML;
      updateRemoveButtons();
    })
    .catch(error => {
      document.getElementById("result").innerText = "Error: " + error.message;
      form.querySelector("button[type='submit']").disabled = false;
    });
  });
});
