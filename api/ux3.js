import ux2 from './ux2.js';

export default async function handler(req, res) {
  const send = res.send.bind(res);
  const intercepted = {
    ...res,
    status(code) { res.status(code); return this; },
    setHeader(name, value) { res.setHeader(name, value); },
    send(html) {
      // ux2 injects its enhancement stylesheet into the existing stylesheet.
      // Normalize the wrapper so the production HTML contains valid CSS/HTML.
      const cleaned = String(html)
        .replace('<style id="panic-scanner-ux2">', '')
        .replace('</style></style>', '</style>');
      return send(cleaned);
    }
  };
  return ux2(req, intercepted);
}
