const exportSkedpalEntries = data => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const fileName = `skedpal_entries_${Date.now()}.json`;
  const url = URL.createObjectURL(blob);

  browser.downloads.download({
    url: url,
    filename: fileName,
    saveAs: true
  });
};

browser.runtime.onMessage.addListener(message => {
  if (message.action === "export") {
    exportSkedpalEntries(message.data);
  } else if (message.action === "import") {
  }
});
