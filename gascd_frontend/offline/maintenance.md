Recreating the self-contained maintenance page:

- Exported html from the GASCD prototype maintenance page
- Removed any <script> tags
- Removed any CSS <link tags>
- Exported application.css from GASCD prototype
- Run application.css through https://www.npmjs.com/package/minify
- Add minified application.css to <head> of HTML inside a <style> tag
