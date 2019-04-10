// TODO: make scoped function!

// const LS = localStorage;

// const parseStr = JSON.parse;

// const stringify = JSON.stringify;

// const saveToLS = (k, v) => {
//   LS.setItem(k, stringify(v));
// };

// const rmFromLS = k => {
//   LS.removeItem(k);
// };

// const getFromLS = k => {
//   try {
//     return parseStr(LS.getItem(k));
//   } catch (e) {
//     rmFromLS(k);
//   }
// };

const LS = (() => {
  const LS = localStorage;
  const parseStr = JSON.parse;
  const stringify = JSON.stringify;

  return {
    save: (k, v) => LS.setItem(k, stringify(v)),
    remove: k => LS.removeItem(k),
    get(k) {
      return parseStr(LS.getItem(k)) || this.remove(k);
    },
    len: () => LS.length,
    getAll: () => LS,
    clear: () => LS.clear(),
  };
})();
