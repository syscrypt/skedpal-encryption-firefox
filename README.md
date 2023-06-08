# AES encryption for SkedPal entries

### Description

This project is a quick hack to enable encryption within the skedpal calendar app.
It may get more user friendly and robust in the future. For now it provides just
an ugly overlay for encrypting and decrypting titles and notes in the todo list
and calendar view.

By using this extension, project, titles and notes get salted, padded and aes encrypted.
As naturally have a character limit, a hash map is stored in the extension storage,
containing the encrypted information. This map can be exported/imported through the
extensions configuration page.

SkedPal is a smart calendar application that is synchronized over the cloud.
This implies that SkedPal naturally has control over their customers data, that
is also shared with other companies such as google since it runs with firebase.

This project enables the users of SkedPal to encrypt their projects and tasks.

### Configuration Page Overlay

![Options page](https://github.com/syscrypt/skedpal-encryption-firefox/assets/103246733/43cff85e-5e8f-4f58-9dde-71bf1df6d349)

### Todo List Overlay

![Todo List Overlay](https://github.com/syscrypt/skedpal-encryption-firefox/assets/103246733/26c6db0d-1378-4870-8f9e-74265b842840)

# ToDos

- [x] Encrypt and decrypt entries
- [x] Use salting and padding for variation
- [x] Set password in extension settings
- [x] Make salt length variable
- [x] Use hashmap and store encrypted strings in browser storage
  - [x] Implement export functionality
  - [x] Implement import functionality
- [x] Decrypt entries in calendar view
- [x] Allow the encryption of notes
- [ ] Dynamic reload decryption for submenu points in todo list
- [ ] Support "Next 7 days" page
- [ ] Support "Today" page
- [ ] Replace execCommand for text insertion
- [ ] Replace time delays
- [ ] Show tooltips that contain the decrypted notes for a todo list entry
- [ ] Fix Oops hack on new entry creation
- [ ] Make a chromium version of this extension

# Disclaimer

By using the Data Loss Extension ("SkedPal Encryption"), you acknowledge and agree to the following terms. Please read them carefully before proceeding. If you do not agree, do not use the Extension.

- Limited Liability: The creators of the Extension are not liable for any damages or losses resulting from its use, including data loss or corruption.

- Use at Your Own Risk: The Extension may cause unintended consequences. It is your responsibility to back up your data and exercise caution.

- No Warranty: The Extension is provided as is, without warranties or guarantees of any kind.

- Backup and Data Loss Prevention: It is strongly advised to regularly back up your data before using the Extension.

- User Responsibility: You are solely responsible for your actions and the security of your data while using the Extension.

- Technical Limitations: The Extension may not be compatible with all devices or operating systems.

- Modification or Termination: The creators reserve the right to modify or discontinue the Extension without prior notice.

By using the Data Loss Extension, you agree to indemnify and hold harmless the creators from any claims or liabilities arising from its use.
Please note that the Extension is not intended for critical data management tasks. Seek professional advice for such scenarios.
Proceed with caution and ensure regular data backups.
