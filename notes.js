const noteEditor = `
<div id="noteEditor" style="overflow: scroll; display: flex; justify-content: center; padding-top: 4rem; height: 10rem; border: 1px solid black;">
  <div style="display: flex;">
    <textarea id="noteEditorTextAreaDecrypted" placeholder="Plain text..." name="noteEditorTextAreaDecrypted" rows="128" cols="64"></textarea>
    <textarea id="noteEditorTextAreaEncrypted" placeholder="Encrypted text..." name="noteEditorTextAreaEncrypted" rows="128" cols="64"></textarea>
  </div>
</div>
`;

var onEncryptionChanged = false;
var onDecryptionChanged = false;

const insertNoteBox = () => {
  const editor = $("#noteEditor");
  if (editor.length !== 0) {
    return;
  }

  $(_x(outerContainerXpath)).first()?.prepend(noteEditor);
  if ($("#noteEditor").length === 0) {
    return;
  }

  const dec = $("#noteEditorTextAreaDecrypted");
  const enc = $("#noteEditorTextAreaEncrypted");

  dec.val("");
  enc.val("");

  dec.on("input", function () {
    if (dec.val() === "") {
      enc.val("");
      return;
    }
    enc.val(encodeTitle($(this).val()));
  });

  enc.on("input", function () {
    if (enc.val() === "") {
      dec.val("");
      return;
    }
    dec.val(decodeTitle($(this).val()));
  });
};
