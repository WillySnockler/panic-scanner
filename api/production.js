import fs from 'fs';
import path from 'path';
import ux from './ux.js';

export default function handler(req, res) {
  const originalSend = res.send.bind(res);
  const wrapped = Object.create(res);
  wrapped.status = (code) => { res.status(code); return wrapped; };
  wrapped.setHeader = (name, value) => res.setHeader(name, value);
  wrapped.send = (html) => {
    const workspacePath = path.join(process.cwd(), 'public', 'panic-scanner-workspace.js');
    const authFixPath = path.join(process.cwd(), 'public', 'auth-fix.js');
    let workspace = '';
    let authFix = '';
    try { workspace = fs.readFileSync(workspacePath, 'utf8'); } catch (_) {}
    try { authFix = fs.readFileSync(authFixPath, 'utf8'); } catch (_) {}
    const tag = (workspace ? `<script id="panic-scanner-workspace-fix">${workspace}</script>` : '') +
      (authFix ? `<script id="panic-scanner-auth-fix">${authFix}</script>` : '');
    originalSend(String(html).replace('</body>', tag + '</body>'));
  };
  return ux(req, wrapped);
}
