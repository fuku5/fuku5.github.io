
function getKeywords() {
  const keywords = document.getElementById("data-const").dataset.keywordList.replace('[', '').replace(']', '').split(',');

  keywords.forEach(function(elem, index, arr) {
      arr[index] = elem.replaceAll('"', '');
      });

  return keywords
}

function initKeywordSelector() {
  // Highlights items with keyword
  const keywords = getKeywords();

  function createKeywordSelector(keywords) {
    const keywordSelector = document.createElement("select");
    keywordSelector.id = "keyword-selector";
    const default_option = document.createElement("option");
    default_option.text = "Keywords";
    keywordSelector.appendChild(default_option);

    keywords.forEach((keyword, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = keyword;
        keywordSelector.appendChild(option);
        });
    return keywordSelector;
  }
  const keywordSelector = createKeywordSelector(keywords);

  function displaySelectedPublications(keyword) {
    document.querySelectorAll('.publication_element').forEach(element => {
        const data = element.dataset;
        if (data.keywords && data.keywords.includes(keyword)) {
        element.style.backgroundColor = "#FFEF6E";
        }
        });
  }

  function resetPublicationSelection() {
    document.querySelectorAll('.publication_element').forEach(element => {
        element.style.backgroundColor = "";
        });
  }

  function changeEventListener() {
    const val = this.value;
    resetPublicationSelection();
    if (val !== "") {
      displaySelectedPublications(parseInt(val));
    }
  }

  keywordSelector.addEventListener("change", changeEventListener); 

  document.getElementById("keyword-selector-block").append(keywordSelector);
}

export { initKeywordSelector };
