var encoder = new TextEncoder();

const addEventListeners = () => {
  $("#exportBtn").on("click", async function () {
    let allKeys = await browser.storage.local.get(null);
    allKeys = Object.keys(allKeys).filter(key => {
      return key?.match(/[0-9a-fA-F]{32}/)?.length !== 0;
    });

    let entries = {};
    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[i];
      entries[key] = await getItem(key);
    }

    browser.runtime.sendMessage({ action: "export", data: entries });
  });

  $("#importBtn").on("change", async function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const contents = e.target.result;
      const jsonObject = JSON.parse(contents);

      const shouldImport = confirm(
        "Are you sure you want to import the data?, existing keys get overwritten"
      );

      if (!shouldImport) {
        return;
      }

      Object.keys(jsonObject).forEach(key => {
        storeItem(key, jsonObject[key]);
      });

      alert("Entries successfully imported!");
    };

    reader.readAsText(file);
  });

  $("#saveEncryptionKey").on("click", async function () {
    const shouldUpdate = confirm("Are you sure you want to update the encryption key?");
    if (!shouldUpdate) {
      return;
    }

    const encryptionKey = $("#skedpalKey").val();
    const paddedKey = encryptionKey.padEnd(32, "dyfOyiYddYt3LHF9c456xiNt2Gw2Z3BI");
    storeItem("skedpal_encryption_key", encoder.encode(paddedKey));
  });

  $("#saveSaltLen").on("click", async function () {
    const shouldUpdate = confirm("Are you sure you want to update the salt length?");
    if (!shouldUpdate) {
      return;
    }

    storeItem("skedpal_salt_length", $("#skedpalSaltLen").val());
  });
};

addEventListeners();
