import {
  __name,
  init_esm
} from "./chunk-ORWORNPV.mjs";

// ../../Users/realt/AppData/Local/npm-cache/_npx/f35930adf21a2162/node_modules/uncrypto/dist/crypto.node.mjs
init_esm();
import nodeCrypto from "node:crypto";
var subtle = nodeCrypto.webcrypto?.subtle || {};
var randomUUID = /* @__PURE__ */ __name(() => {
  return nodeCrypto.randomUUID();
}, "randomUUID");
var getRandomValues = /* @__PURE__ */ __name((array) => {
  return nodeCrypto.webcrypto.getRandomValues(array);
}, "getRandomValues");
var _crypto = {
  randomUUID,
  getRandomValues,
  subtle
};
export {
  _crypto as default,
  getRandomValues,
  randomUUID,
  subtle
};
//# sourceMappingURL=crypto.node-3A7GW2ND.mjs.map
