// script.js
document.addEventListener("DOMContentLoaded", function() {
  var dataTypeRadios = document.getElementsByName("dataType");
  var specificSection = document.getElementById("specificSection");
  var bulkSection = document.getElementById("bulkSection");
  
  // Toggle sections based on data type selection
  dataTypeRadios.forEach(function(radio) {
    radio.addEventListener("change", function() {
      if (this.value === "specific student") {
        specificSection.style.display = "block";
        bulkSection.style.display = "none";
      } else if (this.value === "bulk") {
        specificSection.style.display = "none";
        bulkSection.style.display = "block";
      }
    });
  });

  
  // Add functionality to add another student query row
  document.getElementById("addStudentBtn").addEventListener("click", function() {
    var container = document.getElementById("studentQueriesContainer");
    var queryDiv = document.createElement("div");
    queryDiv.className = "student-query";
    queryDiv.innerHTML = `
      <hr>
      <div class="form-group">
        <label>Reg. No. or Name of Student *</label>
        <input type="text" name="studentQuery" required>
      </div>
      <div class="form-group">
        <label>Class</label>
        <select name="studentClass">
          <option value="">--Select Class--</option>
          <option value="9th">9th</option>
          <option value="10th">10th</option>
          <option value="11th">11th</option>
          <option value="12th">12th</option>
        </select>
      </div>
      <div class="form-group">
        <label>Session</label>
        <select name="studentSession">
          <option value="">--Select Session--</option>
          <option value="2022-23">2022-23</option>
          <option value="2023-24">2023-24</option>
          <option value="2024-25">2024-25</option>
        </select>
      </div>
    `;
    container.appendChild(queryDiv);
  });
  
  // Handle form submission
  document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    var form = e.target;
    var formData = {};
    
    // Get email and data type
    formData.email = form.email.value;
    formData.dataType = form.dataType.value;
    
    if(formData.dataType === "specific student") {
      formData.specificFormat = form.specificFormat.value;
      // Get specific columns (checkboxes)
      var specificColumns = [];
      form.querySelectorAll("input[name='specificColumns']:checked").forEach(function(cb) {
        specificColumns.push(cb.value);
      });
      formData.specificColumns = specificColumns;
      
      // Gather all student query rows
      var studentQueries = [];
      form.querySelectorAll(".student-query").forEach(function(div) {
        var query = div.querySelector("input[name='studentQuery']").value;
        var sClass = div.querySelector("select[name='studentClass']").value;
        var session = div.querySelector("select[name='studentSession']").value;
        studentQueries.push({
          query: query,
          class: sClass,
          session: session
        });
      });
      formData.studentQueries = studentQueries;
    } else if(formData.dataType === "bulk") {
      formData.bulkName = form.bulkName.value;
      formData.bulkClass = form.bulkClass.value;
      formData.bulkSession = form.bulkSession.value;
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
      // Remove extra student queries, keeping only the first one.
      var container = document.getElementById("studentQueriesContainer");
      container.innerHTML = container.querySelector(".student-query").outerHTML;
    }).withFailureHandler(function(err) {
      document.getElementById("result").innerText = "Error: " + err.message;
      form.querySelector("button[type='submit']").disabled = false;
    }).processForm(formData);
  });
});
