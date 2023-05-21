const todoListXpath = "//section/div/div/div/div/div[2]/div/div[2]/div/div/div[1]/div/div/div";
const plusXpath = "//section/div/div/div/div/div[2]/div/div[2]/div/div/div[2]/div[1]";
const saltLen = 4;

var textEncoder = new TextEncoder("utf-8");
var textDecoder = new TextDecoder("utf-8");

var encryptionKey = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31
];

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
</div>
`;

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const updateListEntry = async (idx, elem) => {
  const updateTitle = $("#updateInput" + idx);

  elem[0].click();
  await Sleep(300);
  let editViewContainer = elem.find(".edit-and-view-mode-input-container")[0];
  let drafty = elem.find(".public-DraftEditor-content")[0];
  drafty.focus();
  window.getSelection().selectAllChildren(editViewContainer);
  await Sleep(100);
  document.execCommand("insertText", false, encodeTitle(updateTitle.val()));
  await Sleep(100);
  updateTitle.focus();
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

const todoList = $(_x(todoListXpath));
const addBtn = $(_x(plusXpath));

const addOverflowNone = elem => {
  let styleProp = elem.attr("style");
  const newStyle = styleProp
    .replace(/overflow\s*:\s*auto\s*;/g, "overflow: none;")
    .replace(/overflow\s*:\s*hidden\s*;/g, "overflow: none;");
  elem.attr("style", newStyle);
};

const createRandomSalt = () => {
  let salt = [];
  for (let i = 0; i < saltLen; i++) {
    let rnd = Math.floor(Math.random() * 255);
    salt.push(rnd & 0xff);
  }
  return salt;
};

const padString = str => {
  let newLen = str.length;

  if (str.length < 32) {
    newLen = Math.pow(2, Math.ceil(Math.log2(str.length)));
  } else {
    newLen = Math.random() * 16 + 1;
  }

  let ret = [];
  ret.push(str.length);

  for (let i = 0; i < str.length; i++) {
    ret.push(str[i].charCodeAt(0));
  }

  for (let i = ret.length; i < newLen; i++) {
    ret.push(Math.random() * 65535);
  }

  return String.fromCharCode(...ret);
};

const uint16add = (a, b) => {
  a = a & 0xffff;
  b = b & 0xffff;
  return (a + b) % 0xffff;
};

const uint16sub = (a, b) => {
  a = a & 0xffff;
  b = b & 0xffff;
  return (a - b) % 0xffff;
};

const rotString = (salt, str, forward = true) => {
  let saltIdx = 0;
  let ret = [];

  if (forward) {
    for (let i = 0; i < salt.length; i++) {
      ret.push(salt[i] & 0xffff);
    }
  }

  for (let i = 0; i < str.length; i++) {
    if (forward) {
      ret.push(uint16add(str[i].charCodeAt(0), salt[saltIdx++]));
    } else {
      ret.push(uint16sub(str[i].charCodeAt(0), salt[saltIdx++]));
    }

    if (saltIdx >= salt.length) {
      saltIdx = 0;
    }
  }

  return String.fromCharCode(...ret);
};

const stringToNumArray = str => {
  let ret = [];
  for (let i = 0; i < str.length; i++) {
    ret.push(str[i].charCodeAt(0));
  }
  return ret;
};

const encodeTitle = title => {
  const saltBytes = createRandomSalt();
  let paddedTitle = padString(title);
  let rotTitle = rotString(saltBytes, paddedTitle, true);
  let titleBytes = textEncoder.encode(rotTitle);

  let aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(5));
  let encryptedBytes = aesCtr.encrypt(titleBytes);
  return aesjs.utils.hex.fromBytes(encryptedBytes);
};

const decodeTitle = encryptedHex => {
  let encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
  let aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(5));
  let decryptedBytes = aesCtr.decrypt(encryptedBytes);
  let decodedString = textDecoder.decode(decryptedBytes);
  let salt = stringToNumArray(decodedString.slice(0, saltLen));

  let paddedString = rotString(salt, decodedString.slice(saltLen, decodedString.length), false);

  let len = paddedString.charCodeAt(0) & 0xffff;
  return paddedString.slice(1, len + 1);
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
  todoList.children().each(function (idx) {
    let titleContainer = $(this).find(".simple-snippet-center-body");
    if (titleContainer.length <= 0) {
      return;
    }

    let titleElem = getTitleElement(titleContainer);
    let title = titleElem.text();

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
        .replaceAll("$updInputId", idx)
    );

    $("#updateBtn" + idx).on("click", async function () {
      await updateListEntry(idx, titleContainer);
    });
  });
};

function selectText(element) {
  if (document.selection) {
    // IE
    var range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}

const main = () => {
  if (!todoList.length) {
    return;
  }

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

    const updateTitle = $("#updateInput" + (todoList.children().length - 1));
    updateTitle.focus();
  });

  createEditBoxes();
};

main();
