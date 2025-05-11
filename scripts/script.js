// Select the dropdown containers and language dropdowns
const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language");

// Function to populate dropdown with language options
function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";  // Clear existing options
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;  // Set option title with language name and native name
    li.dataset.value = option.code;  // Store the language code as a dataset value
    li.classList.add("option");  // Add option class for styling
    dropdown.querySelector("ul").appendChild(li);  // Append to the dropdown list
  });
}

// Populate the input and output language dropdowns
populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

// Add event listeners to toggle dropdown visibility on click
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");  // Toggle 'active' class to show/hide dropdown
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      // Remove 'active' class from other options
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");  // Add 'active' class to selected option
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;  // Display selected option's name
      selected.dataset.value = item.dataset.value;  // Set the selected language code
      translate();  // Trigger translation after selection
    });
  });
});

// Close dropdown if click occurs outside of dropdown container
document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");  // Remove active class on outside click
    }
  });
});

// ========== Translate Button ==========
// Trigger translation when the translate button is clicked
document.querySelector("#translate-btn").addEventListener("click", translate);

const swapBtn = document.querySelector(".swap-position"),
  inputLanguage = inputLanguageDropdown.querySelector(".selected"),
  outputLanguage = outputLanguageDropdown.querySelector(".selected"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text");

// Swap input and output languages when swap button is clicked
swapBtn.addEventListener("click", (e) => {
  // Swap selected language names
  const temp = inputLanguage.innerHTML;
  inputLanguage.innerHTML = outputLanguage.innerHTML;
  outputLanguage.innerHTML = temp;

  // Swap language codes
  const tempValue = inputLanguage.dataset.value;
  inputLanguage.dataset.value = outputLanguage.dataset.value;
  outputLanguage.dataset.value = tempValue;

  // Swap the input and output text content
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();  // Trigger translation after swap
});

// Function to handle text translation using Google Translate API
function translate() {
  const inputText = inputTextElem.value;
  const inputLanguage =
    inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
    inputText,
  )}`;  // Construct API URL for translation

  // Fetch translation from Google Translate API
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);  // Log the API response
      outputTextElem.value = json[0].map((item) => item[0]).join("");  // Display translated text
    })
    .catch((error) => {
      console.log(error);  // Log any errors
    });
}

// Limit input text to 5000 characters and trigger translation on input change
inputTextElem.addEventListener("input", (e) => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);  // Trim text if it exceeds 5000 characters
  }
  translate();  // Trigger translation after input change
});

// ========== File Upload Functionality ==========
// Handle document upload and display uploaded file name
const uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title");

uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  // Check if the uploaded file is of valid type
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name;  // Display file name
    const reader = new FileReader();
    reader.readAsText(file);  // Read file as text
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;  // Set file content to input text area
      translate();  // Trigger translation after file upload
    };
  } else {
    alert("Please upload a valid file");  // Alert if the file type is invalid
  }
});

// ========== Download Translated Text ==========
// Handle downloading the translated text as a text file
const downloadBtn = document.querySelector("#download-btn");

downloadBtn.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });  // Create a blob from translated text
    const url = URL.createObjectURL(blob);  // Create URL for the blob
    const a = document.createElement("a");  // Create a temporary anchor element
    a.download = `translated-to-${outputLanguage}.txt`;  // Set file name for download
    a.href = url;  // Set URL for the download
    a.click();  // Trigger download
  }
});

// ========== Dark Mode Toggle ==========
// Toggle dark mode when the checkbox is changed
const darkModeCheckbox = document.getElementById("dark-mode-btn");

darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");  // Toggle dark mode class on the body
});

// ========== Input Character Count ==========
// Display the number of characters typed in the input text
const inputChars = document.querySelector("#input-chars");

inputTextElem.addEventListener("input", (e) => {
  inputChars.innerHTML = inputTextElem.value.length;  // Update character count display
});

// ========== Speaker (Text-to-Speech) ==========
// Convert translated text to speech when the speak button is clicked
document.querySelector("#speak-btn")?.addEventListener("click", () => {
  const utterance = new SpeechSynthesisUtterance(outputTextElem.value);
  utterance.lang = outputLanguageDropdown.querySelector(".selected")?.dataset.value || "en";  // Set language for speech
  window.speechSynthesis.speak(utterance);  // Speak the translated text
});
