// While false, an allow-list glob that matches no file only warns (so every phase stays green while
// the allow-listed files are still being created). FEAT-005 flips this to true once they all exist.
export const STRICT_ALLOWLIST = false;
