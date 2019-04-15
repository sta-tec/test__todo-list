const LS = (() => {
  const LS = localStorage;
  const parseStr = JSON.parse;
  const stringify = JSON.stringify;

  return {
    set: (k, v) => LS.setItem(k, stringify(v)),
    remove: k => LS.removeItem(k),
    get: k => parseStr(LS.getItem(k)),
    getAll: () => {
      const result = {};
      Object.keys(LS).forEach(key => (result[key] = parseStr(LS.getItem(key))));
      return result;
    },
    getLen: () => LS.length,
    clear: () => LS.clear(),
  };
})();
