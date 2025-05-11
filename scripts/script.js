// ========== Language Dropdown Functionality ==========
const dropdowns = document.querySelectorAll(".dropdown-container");
const inputLanguageDropdown = document.querySelector("#input-language");
const outputLanguageDropdown = document.querySelector("#output-language");

function populateDropdown(dropdown, options) {
  const list = dropdown.querySelector("ul");
  list.innerHTML = "";
  options.forEach(({ name, native, code }) => {
    const li = document.createElement("li");
    li.classList.add("option");
    li.textContent = `${name} (${native})`;
    li.dataset.value = code;
    list.appendChild(li);
  });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);
attachOptionListeners(); // Attach after populating

function attachOptionListeners() {
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", () => {
      dropdown.classList.toggle("active");
    });

    dropdown.addEventListener("mouseenter", () => {
      dropdown.classList.add("highlight");
    });

    dropdown.addEventListener("mouseleave", () => {
      dropdown.classList.remove("highlight");
    });

    dropdown.querySelectorAll(".option").forEach((option) => {
      option.addEventListener("click", () => {
        dropdown.querySelectorAll(".option").forEach((opt) => opt.classList.remove("active"));
        option.classList.add("active");

        const selected = dropdown.querySelector(".selected");
        selected.textContent = option.textContent;
        selected.dataset.value = option.dataset.value;

        translate(); // Auto-translate on language select
      });
    });
  });
}

// Close dropdowns on outside click
document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("active");
  });
});

// ========== Translation Logic ==========
const inputTextElem = document.querySelector("#input-text");
const outputTextElem = document.querySelector("#output-text");

function translate() {
  const from = inputLanguageDropdown.querySelector(".selected").dataset.value;
  const to = outputLanguageDropdown.querySelector(".selected").dataset.value;
  const text = inputTextElem.value.trim();

  if (!from || !to || !text) return;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      outputTextElem.value = data[0].map((item) => item[0]).join("");
    })
    .catch((err) => {
      console.error("Translation error:", err);
      outputTextElem.value = "Translation failed.";
    });
}

// ========== Input Text Change ==========
inputTextElem.addEventListener("input", () => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);
  }
  translate();
});

// ========== Translate Button ==========
document.querySelector("#translate-btn").addEventListener("click", translate);

// ========== Swap Function ==========
document.querySelector("#swap-btn").addEventListener("click", () => {
  const inputLang = inputLanguageDropdown.querySelector(".selected");
  const outputLang = outputLanguageDropdown.querySelector(".selected");

  [inputLang.textContent, outputLang.textContent] = [outputLang.textContent, inputLang.textContent];
  [inputLang.dataset.value, outputLang.dataset.value] = [outputLang.dataset.value, inputLang.dataset.value];

  // Swap text values
  [inputTextElem.value, outputTextElem.value] = [outputTextElem.value, inputTextElem.value];

  translate();
});

// ========== Upload File ==========
const uploadInput = document.querySelector("#upload-document");
const uploadTitle = document.querySelector("#upload-title");

uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const validTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!file || !validTypes.includes(file.type)) {
    alert("Please upload a valid text or document file.");
    return;
  }

  uploadTitle.textContent = file.name;

  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (e) => {
    inputTextElem.value = e.target.result;
    translate();
  };
});

// ========== Download Translated Text ==========
document.querySelector("#download-btn").addEventListener("click", () => {
  const text = outputTextElem.value;
  const lang = outputLanguageDropdown.querySelector(".selected").dataset.value;

  if (!text) {
    alert("There is no translated text to download.");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `translated-to-${lang}.txt`;
  a.href = url;
  a.click();
});

// ========== Dark Mode ==========
const darkModeToggle = document.getElementById("dark-mode-btn");
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

// ========== Scroll to Top Button ==========
const scrollToTopBtn = document.querySelector("#scroll-to-top");

if (scrollToTopBtn) {
  window.addEventListener("scroll", () => {
    scrollToTopBtn.style.opacity = document.documentElement.scrollTop > 200 ? "1" : "0";
  });

  scrollToTopBtn.addEventListener("click", () => {
    document.documentElement.scrollTop = 0;
  });
}

// ========== Tooltip Hover ==========
document.querySelectorAll(".tooltip").forEach((tooltip) => {
  tooltip.addEventListener("mouseenter", () => {
    tooltip.querySelector(".tooltip-text").style.visibility = "visible";
  });
  tooltip.addEventListener("mouseleave", () => {
    tooltip.querySelector(".tooltip-text").style.visibility = "hidden";
  });
});
