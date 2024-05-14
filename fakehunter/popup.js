document.addEventListener("DOMContentLoaded", function () {
  const fakeNewsCountElement = document.getElementById("fakeCount");
  const siteStatusElement = document.getElementById("siteStatus");
  const detectorStatusElement = document.getElementById("detectorStatus");
  const sourceButton = document.getElementById("sourceButton"); 
  const toggleButton = document.getElementById("extensionToggle");

  let extensionActive = true;
  toggleButton.checked = extensionActive;
  updateContent(extensionActive);

  toggleButton.addEventListener("change", function () {
    extensionActive = this.checked;
    updateContent(extensionActive);
  });

  function updateContent(active) {
    if (active) {
      fetchSiteData();
      detectorStatusElement.style.color = "green";
      detectorStatusElement.textContent = "Detector Activat";
    } else {
      clearContent();
      detectorStatusElement.style.color = "red";
      detectorStatusElement.textContent = "Detectorul este oprit";
    }
  }

  function fetchSiteData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      fetch(
        `https://dimonxxll.pythonanywhere.com/api/sites?url=${encodeURIComponent(
          tab.url
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          const siteFound = data.find(
            (site) => new URL(site.url).hostname === new URL(tab.url).hostname
          );
          // Verifică dacă site-ul a fost găsit și are un număr de știri false detectate
          if (siteFound) {
            fakeNewsCountElement.textContent = siteFound.fake_news_detected;
            if (siteFound.fake_news_detected > 3) {
              siteStatusElement.textContent = "Multe știri false detectate";
            } else if (siteFound.fake_news_detected > 0) {
              siteStatusElement.textContent = "Unele știri false detectate";
            } else {
              // Situația când sunt 0 știri false detectate
              siteStatusElement.textContent =
                "Nu au fost detectate știri false sau site-ul încă nu a fost verificat";
            }
            sourceButton.style.display = siteFound.source ? "block" : "none";
            sourceButton.onclick = siteFound.source
              ? () => window.open(siteFound.source, "_blank")
              : null;
          } else {
            // Când site-ul nu este găsit în baza de date
            siteStatusElement.textContent =
              "Nu au fost detectate știri false sau site-ul încă nu a fost verificat";
            fakeNewsCountElement.textContent = "";
            sourceButton.style.display = "none";
          }
        })
        .catch((error) => {
          console.error("Error fetching site data:", error);
          siteStatusElement.textContent = "Nu au fost detectate știri false sau site-ul încă nu a fost verificat";
          fakeNewsCountElement.textContent = "";
          sourceButton.style.display = "none";
        });
    });
  }

  function clearContent() {
    fakeNewsCountElement.textContent = "";
    siteStatusElement.textContent = "";
    sourceButton.style.display = "none";
  }

  if (extensionActive) {
    fetchSiteData();
  }
});
