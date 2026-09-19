// Parse pasted / imported key content with `=` separation.
// Ignores empty lines and lines starting with #.
// Returns [{ configName, value }]. Throws on malformed non-empty lines.
function parseKeyContent(content) {
  if (typeof content !== 'string') throw new Error('content must be a string');
  const out = [];
  const lines = content.split(/\r?\n/);
  for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) throw new Error(`Malformed line (missing NAME=value): ${raw}`);
    const configName = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!configName || !value) throw new Error(`Malformed line (empty name/value): ${raw}`);
    out.push({ configName, value });
  }
  return out;
}

module.exports = { parseKeyContent };
