const todoListXpath = "//section/div/div/div/div/div[2]/div/div[2]/div/div/div[1]/div/div/div";
const plusXpath = "//section/div/div/div/div/div[2]/div/div[2]/div/div/div[2]/div[1]";
const outerContainerXpath = "//section/div/div/div/div";

var active = false;

const EditBoxStyle = `
display: flex;
flex-direction: row;
position: absolute;
width: 14rem;
height: 100%;
margin-left: -16rem;
z-index: 1;
align-items: flex-start;
`;

const InputBoxStyle = `
`;

const EditBox = `
<div class="encryption" style="$style">
    <input id="updateInput$updInputId" style="$inputBoxStyle" type="text" value="$value" placeholder="Project Title..." />
    <button id="updateBtn$btnId">Update</button>
    <button id="deleteBtn$delId">-</button>
</div>
`;

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const updateListEntry = async (idx, elem, removal) => {
  const updateTitle = $("#updateInput" + idx);

  elem[0].click();
  await Sleep(300);
  let editViewContainer = elem.find(".edit-and-view-mode-input-container")[0];
  let drafty = elem.find(".public-DraftEditor-content")[0];
  drafty.focus();
  window.getSelection().selectAllChildren(editViewContainer);
  await Sleep(100);

  removeItem(removal);
  let encryptedTitle = encodeTitle(updateTitle.val());
  let hash = md5(encryptedTitle);

  storeItem(hash, encryptedTitle);

  document.execCommand("insertText", false, hash);
  await Sleep(100);
  updateTitle.focus();
};

const deleteListEntry = async (idx, elem, removal) => {
  const updateTitle = $("#updateInput" + idx);

  elem[0].click();
  await Sleep(300);
  let editViewContainer = elem.find(".edit-and-view-mode-input-container")[0];
  let drafty = elem.find(".public-DraftEditor-content")[0];
  drafty.focus();
  window.getSelection().selectAllChildren(editViewContainer);
  await Sleep(100);
  removeItem(removal);
  document.execCommand("delete", false, "");
  await Sleep(100);
  updateTitle.focus();
  updateTitle.click();
};

function _x(STR_XPATH) {
  var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
  var xnodes = [];
  var xres;
  while ((xres = xresult.iterateNext())) {
    xnodes.push(xres);
  }

  return xnodes;
}

var todoList = $(_x(todoListXpath));
var addBtn = $(_x(plusXpath));

const addOverflowNone = elem => {
  let styleProp = elem.attr("style");
  const newStyle = styleProp
    .replace(/overflow\s*:\s*auto\s*;/g, "overflow: none;")
    .replace(/overflow\s*:\s*hidden\s*;/g, "overflow: none;");
  elem.attr("style", newStyle);
};

const getMostInnerFirstChild = elem => {
  let lastElem = elem;
  while (elem && elem != null && elem != undefined && elem.children().length > 0) {
    lastElem = elem;
    elem = elem.children().first();
  }
  return lastElem;
};

const getTitleElement = titleContainer => {
  return titleContainer
    .first()
    .children()
    .first()
    .children()
    .first()
    .children()
    .first()
    .children()
    .first()
    .children()
    .first();
};

const createEditBoxes = () => {
  todoList.children().each(async function (idx) {
    let titleContainer = $(this).find(".simple-snippet-center-body");
    if (titleContainer.length <= 0) {
      return;
    }

    let titleElem = getTitleElement(titleContainer);
    let title = titleElem.text();
    let titleFromMap = await getItem(title);

    if (titleFromMap != "" && titleFromMap !== undefined) {
      title = titleFromMap;
    }

    let decodedTitle = "";
    try {
      decodedTitle = decodeTitle(title);
    } catch (e) {
      decodedTitle = title;
    }

    $(this).prepend(
      EditBox.replaceAll("$style", EditBoxStyle)
        .replaceAll("$inputBoxStyle", InputBoxStyle)
        .replaceAll("$value", decodedTitle)
        .replaceAll("$btnId", idx)
        .replaceAll("$delId", idx)
        .replaceAll("$updInputId", idx)
    );

    $("#updateBtn" + idx).on("click", async function () {
      await updateListEntry(idx, titleContainer, titleElem.text());
    });

    $("#deleteBtn" + idx).on("click", async function () {
      await deleteListEntry(idx, titleContainer, titleElem.text());
    });
  });
};

const manageTodoList = () => {
  if (!todoList || todoList.length == 0) {
    return;
  }

  insertNoteBox();

  addOverflowNone(todoList);
  addOverflowNone(todoList.parent());
  addOverflowNone(todoList.parent().parent().parent().parent());

  addBtn.on("click", async function () {
    await Sleep(300);
    let drafty = $(this).parent().parent().find(".public-DraftEditor-content")[0];
    drafty.focus();
    await Sleep(100);
    document.execCommand("insertText", false, " ");
    await Sleep(100);
    let reload = $(this).parent().parent().find(".draftjs--errorBoundary--reload")[0];
    reload.click();
    await Sleep(100);
    $("div.encryption").remove();
    createEditBoxes();

    await Sleep(100);
    const updateTitle = $("#updateInput" + (todoList.children().length - 1));
    updateTitle.focus();
  });

  createEditBoxes();

  $(".simple-snippet-description-container").hover(async function () {
    await Sleep(300);
    decryptTooltips();
  });
};

const decryptTooltips = () => {
  $(".MuiTooltip-popper").each(function () {
    try {
      let decryptedTitle = decodeTitle($(this).text());
      //$(this).text(decryptedTitle);
    } catch (e) {}
  });
};

manageTodoList();

async function handleTodoListReload() {
  todoList = $(_x(todoListXpath));
  addBtn = $(_x(plusXpath));
  while (!todoList || !addBtn || todoList.length == 0 || addBtn.length == 0) {
    await Sleep(100);
    todoList = $(_x(todoListXpath));
    addBtn = $(_x(plusXpath));
  }
  manageTodoList();
}

window.addEventListener("load", handleTodoListReload, false);
window.addEventListener(
  "beforeunload",
  function () {
    window.removeEventListener("load", handleTodoListReload, false);
    window.removeEventListener("beforeunload", this, false);
  },
  false
);
