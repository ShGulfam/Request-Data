// script.js

// Helper function to get all selected option values (for multiple select elements)
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
  
  // Function to disable/enable all inputs in a given section
  function toggleSectionInputs(section, disable) {
    section.querySelectorAll("input, select, textarea, button").forEach(function(el) {
      el.disabled = disable;
    });
  }
  
  // On initial load, disable bulk section inputs.
  toggleSectionInputs(bulkSection, true);
  
  // Toggle sections based on data type selection
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
  
  // Function to update remove buttons visibility
  function updateRemoveButtons() {
    var queryBlocks = document.querySelectorAll(".student-query");
    queryBlocks.forEach(function(block) {
      var removeBtn = block.querySelector(".removeStudentBtn");
      if (queryBlocks.length > 1) {
        removeBtn.style.display = "inline-block";
      } else {
        removeBtn.style.display = "none";
      }
    });
  }
  
  // Add functionality to add another student query row
  document.getElementById("addStudentBtn").addEventListener("click", function() {
    var container = document.getElementById("studentQueriesContainer");
    // Create a new query block element
    var queryDiv = document.createElement("div");
    queryDiv.className = "student-query";
    queryDiv.innerHTML = `
      <hr>
      <div class="form-group">
        <label>Reg. No. or Name of Student *</label>
        <input type="text" name="studentQuery" required>
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
    
    // Attach event listener to the new remove button
    queryDiv.querySelector(".removeStudentBtn").addEventListener("click", function() {
      // Only remove if more than one block exists
      if (document.querySelectorAll(".student-query").length > 1) {
        queryDiv.remove();
        updateRemoveButtons();
      }
    });
  });
  
  // Attach remove functionality for the initial student query block (if needed)
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
    
    // Get email and data type
    formData.email = form.email.value;
    formData.dataType = form.dataType.value;
    
    if (formData.dataType === "specific student") {
      formData.specificFormat = form.specificFormat.value;
      // Get specific columns (checkboxes)
      var specificColumns = [];
      form.querySelectorAll("input[name='specificColumns']:checked").forEach(function(cb) {
        specificColumns.push(cb.value);
      });
      formData.specificColumns = specificColumns;
      
      // Gather all student query rows
      var studentQueries = [];
      document.querySelectorAll(".student-query").forEach(function(div) {
        var query = div.querySelector("input[name='studentQuery']").value;
        // For multiple select elements, gather all selected values.
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
      // For multiple select elements, gather all selected values.
      formData.bulkClass = getSelectValues(form.bulkClass);
      formData.bulkSession = getSelectValues(form.bulkSession);
      formData.bulkFormat = form.bulkFormat.value;
      var bulkColumns = [];
      form.querySelectorAll("input[name='bulkColumns']:checked").forEach(function(cb) {
        bulkColumns.push(cb.value);
      });
      formData.bulkColumns = bulkColumns;
    }
    
    // Disable submit button and show submitting message
    form.querySelector("button[type='submit']").disabled = true;
    document.getElementById("result").innerText = "Submitting request...";
    
    // Call the server-side function using google.script.run
    google.script.run.withSuccessHandler(function(response) {
      document.getElementById("result").innerText = response.message;
      form.querySelector("button[type='submit']").disabled = false;
      form.reset();
      // Reset section visibility: default back to specific student.
      specificSection.style.display = "block";
      bulkSection.style.display = "none";
      toggleSectionInputs(specificSection, false);
      toggleSectionInputs(bulkSection, true);
      
      // Remove extra student queries, leaving only the first block.
      var container = document.getElementById("studentQueriesContainer");
      container.innerHTML = container.querySelector(".student-query").outerHTML;
      updateRemoveButtons();
    }).withFailureHandler(function(err) {
      document.getElementById("result").innerText = "Error: " + err.message;
      form.querySelector("button[type='submit']").disabled = false;
    }).processForm(formData);
  });
});
