# WOW SCHOOL — Teacher Application (Web3Forms)

This version does not use Google Apps Script.

## How it works

The teacher completes the form on GitHub Pages and clicks “Submit application.”
All answers are sent by email to `wow.school.english@gmail.com`.

## One-time setup

1. Open https://web3forms.com/
2. Enter `wow.school.english@gmail.com` and receive the Access Key by email.
3. Open `config.js`.
4. Paste the key here:

   window.WOW_WEB3FORMS_ACCESS_KEY = "YOUR_ACCESS_KEY";

5. Upload the updated files to GitHub Pages.

Done. No server, Google Apps Script, or Google Cloud is required.

## If the key has not been added yet

The form will still work: a pre-filled email to WOW SCHOOL will open for the teacher, and a text copy of the application will be saved automatically.

## Important

The free setup sends the structured application directly in the email body. If you later need an actual PDF attachment, you can connect paid file uploads or another service separately.
