export const api = new Proxy({}, {
  get(target, prop) {
    return new Proxy({}, {
      get(t, p) {
        return `${String(prop)}:${String(p)}`;
      }
    });
  }
});
