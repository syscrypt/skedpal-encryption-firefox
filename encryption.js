var saltLen = undefined;
var encryptionKey = [];

var textEncoder = new TextEncoder("utf-8");
var textDecoder = new TextDecoder("utf-8");

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

const storeItem = (key, val) => {
  browser.storage.local.set({
    [key]: val
  });
};

const removeItem = key => {
  browser.storage.local.remove(key);
};

const getItem = async key => {
  let promise = new Promise(function (resolve) {
    browser.storage.local.get(key, res => {
      resHash = res[key];
      resolve(resHash);
    });
  });
  return promise;
};

const loadKeyAndSalt = async () => {
  saltLen = await getItem("skedpal_salt_length");
  encryptionKey = await getItem("skedpal_encryption_key");

  if (!saltLen) {
    alert("Salt len not defined in Skedpal Encryption options page!");
  }

  if (!encryptionKey || encryptionKey.length === 0) {
    alert("Encryption key not defined in Skedpal Encryption options page!");
  }
};

loadKeyAndSalt();
