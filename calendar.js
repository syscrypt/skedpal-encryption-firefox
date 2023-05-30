const decryptEntry = async elem => {
  let hashedTitle = $(elem)?.text();
  let extractedTitle = hashedTitle?.match(/[0-9a-fA-F]{32}/);
  if (extractedTitle?.length == 0 || extractedTitle == null) {
    return;
  }

  let encryptedTitle = await getItem(extractedTitle);
  const rest = hashedTitle[0].substring(hashedTitle[0].length);

  let decryptedTitle = "";
  try {
    decryptedTitle = decodeTitle(encryptedTitle);
  } catch (e) {
    decryptedTitle = encryptedTitle;
  }

  $(elem).text(decryptedTitle + rest);
};

const manageCalendar = () => {
  $("p[id^=normalEventContentWrapper]").each(async function () {
    await decryptEntry(this);
  });

  $("div[id^=normalEventWrapper]").each(async function () {
    $(this)
      .children()
      .each(async function () {
        const child = $(this);
        if (child.children().length != 0) {
          return;
        }

        await decryptEntry(this);
      });
  });

  $("div.halfEventContent").each(async function () {
    await decryptEntry(this);
  });
};

manageCalendar();

async function handleCalendarReload() {
  let calendarViewContentWrapper = $("div[id^=normalEventWrapper]");

  while (calendarViewContentWrapper.length < 1) {
    await Sleep(100);
    calendarViewContentWrapper = $("div[id^=normalEventWrapper]");
  }
  manageCalendar();
}

window.addEventListener("load", handleCalendarReload, false);
window.addEventListener(
  "beforeunload",
  function () {
    window.removeEventListener("load", handleCalendarReload, false);
    window.removeEventListener("beforeunload", this, false);
  },
  false
);
