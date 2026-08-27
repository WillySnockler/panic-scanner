import fs from 'fs';
import path from 'path';
import ux from './ux.js';

export default function handler(req, res) {
  const originalSend = res.send.bind(res);
  const wrapped = Object.create(res);
  wrapped.status = (code) => { res.status(code); return wrapped; };
  wrapped.setHeader = (name, value) => res.setHeader(name, value);
  wrapped.send = (html) => {
    const scriptPath = path.join(process.cwd(), 'public', 'panic-scanner-workspace.js');
    let script = '';
    try { script = fs.readFileSync(scriptPath, 'utf8'); } catch (_) {}
    const tag = script ? `<script id="panic-scanner-workspace-fix">${script}</script>` : '';
    originalSend(String(html).replace('</body>', tag + '</body>'));
  };
  return ux(req, wrapped);
}
