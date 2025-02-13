// script.js

// Helper to get all selected option values from a multiple select
function getSelectValues(select) {
  var result = [];
  for (var i = 0; i < select.options.length; i++) {
    if (select.options[i].selected) {
      result.push(select.options[i].value);
    }
  }
  return result;
}


document.addEventListener("DOMContentLoaded", function() {
  var dataTypeRadios = document.getElementsByName("dataType");
  var specificSection = document.getElementById("specificSection");
  var bulkSection = document.getElementById("bulkSection");
  
  // Disable inactive section's inputs so required fields aren’t validated
  function toggleSectionInputs(section, disable) {
    section.querySelectorAll("input, select, textarea, button").forEach(function(el) {
      el.disabled = disable;
    });
  }
  
  // Initially disable bulk section inputs
  toggleSectionInputs(bulkSection, true);
  
  // Toggle sections based on selection
  dataTypeRadios.forEach(function(radio) {
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
  
  // Update visibility of "Remove" buttons in student query blocks
  function updateRemoveButtons() {
    var queryBlocks = document.querySelectorAll(".student-query");
    queryBlocks.forEach(function(block) {
      var removeBtn = block.querySelector(".removeStudentBtn");
      removeBtn.style.display = queryBlocks.length > 1 ? "inline-block" : "none";
    });
  }
  
  // Add another student query block
  document.getElementById("addStudentBtn").addEventListener("click", function() {
    var container = document.getElementById("studentQueriesContainer");
    var queryDiv = document.createElement("div");
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
  
  // Attach remove functionality for the initial query block
  var initialRemoveBtn = document.querySelector(".student-query .removeStudentBtn");
  if (initialRemoveBtn) {
    initialRemoveBtn.addEventListener("click", function() {
      if (document.querySelectorAll(".student-query").length > 1) {
        this.parentElement.remove();
        updateRemoveButtons();
      }
    });
  }
  
  // Handle form submission
  document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var form = e.target;
    var formData = {};
    
    formData.email = form.email.value;
    formData.dataType = form.dataType.value;
    
    if (formData.dataType === "specific student") {
      formData.specificFormat = form.specificFormat.value;
      var specificColumns = [];
      form.querySelectorAll("input[name='specificColumns']:checked").forEach(function(cb) {
        specificColumns.push(cb.value);
      });
      formData.specificColumns = specificColumns;
      
      var studentQueries = [];
      document.querySelectorAll(".student-query").forEach(function(div) {
        var query = div.querySelector("input[name='studentQuery']").value;
        var classSelect = div.querySelector("select[name='studentClass']");
        var sessionSelect = div.querySelector("select[name='studentSession']");
        var sClass = getSelectValues(classSelect);
        var session = getSelectValues(sessionSelect);
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
      var bulkColumns = [];
      form.querySelectorAll("input[name='bulkColumns']:checked").forEach(function(cb) {
        bulkColumns.push(cb.value);
      });
      formData.bulkColumns = bulkColumns;
    }
    
    form.querySelector("button[type='submit']").disabled = true;
    document.getElementById("result").innerText = "Submitting request...";
    
    google.script.run.withSuccessHandler(function(response) {
      document.getElementById("result").innerText = response.message;
      form.querySelector("button[type='submit']").disabled = false;
      form.reset();
      specificSection.style.display = "block";
      bulkSection.style.display = "none";
      toggleSectionInputs(specificSection, false);
      toggleSectionInputs(bulkSection, true);
      var container = document.getElementById("studentQueriesContainer");
      container.innerHTML = container.querySelector(".student-query").outerHTML;
      updateRemoveButtons();
    }).withFailureHandler(function(err) {
      document.getElementById("result").innerText = "Error: " + err.message;
      form.querySelector("button[type='submit']").disabled = false;
    }).processForm(formData);
  });
});
