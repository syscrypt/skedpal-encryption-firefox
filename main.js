const todoListXpath = "//section/div/div/div/div/div[2]/div/div[2]/div/div/div[1]/div/div/div";

const saltLen = 16;

var textEncoder = new TextEncoder("utf-8");
var textDecoder = new TextDecoder("utf-8");

var encryptionKey = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31
];

const EditBoxStyle = `
position: absolute;
width: 14rem;
height: 100%;
margin-left: -200px;
z-index: 1;
margin-top: 1px;
`;

const InputBoxStyle = `
`;

const EditBox = `
<div style="$style">
    <input style="$inputBoxStyle" type="text" value="$value" placeholder="Project Title..." />
</div>
`;

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
  const newLen = Math.pow(2, Math.ceil(Math.log2(str.length + 8)));
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
    // ret.push(str[i].charCodeAt(0));
    // continue;

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

const utf8ToUtf16Arr = arr => {
  let ret = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 >= arr.length) {
      ret.push(arr[i]);
      break;
    }

    ret.push((arr[i] << 8) | (arr[i + 1] & 0xff));
  }
  return ret;
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

const main = () => {
  if (!todoList.length) {
    return;
  }

  addOverflowNone(todoList);
  addOverflowNone(todoList.parent());
  addOverflowNone(todoList.parent().parent().parent().parent());

  todoList.children().each(function () {
    let titleContainer = $(this).find(".simple-snippet-title-container");
    if (titleContainer.length <= 0) {
      return;
    }

    let title = titleContainer
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
      .first()
      .text();

    $(this).prepend(
      EditBox.replaceAll("$style", EditBoxStyle)
        .replaceAll("$inputBoxStyle", InputBoxStyle)
        .replaceAll("$value", encodeTitle(title))
    );
  });
};

main();
