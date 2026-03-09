const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

(async () => {
  try {
    const root = __dirname;
    const htmlPath = path.join(root, 'index.html');
    const jsPath = path.join(root, 'app.js');

    const html = fs.readFileSync(htmlPath, 'utf8');
    const js = fs.readFileSync(jsPath, 'utf8');

    const inlined = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

    const virtualConsole = new VirtualConsole();
    virtualConsole.on('log', (...args) => console.log('PAGE LOG:', ...args));
    virtualConsole.on('error', (...args) => console.error('PAGE ERROR:', ...args));
    virtualConsole.on('warn', (...args) => console.warn('PAGE WARN:', ...args));

    const dom = new JSDOM(inlined, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost:8000/',
      virtualConsole,
    });

    // Provide minimal navigator.clipboard shim to avoid errors
    dom.window.navigator.clipboard = {
      writeText: async (text) => {
        console.log('clipboard.writeText called (shim)');
        return Promise.resolve();
      }
    };

    // Wait a short time for scripts to run
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Test run completed.');
  } catch (err) {
    console.error('Test runner error:', err);
    process.exit(2);
  }
})();
