export const $ = new Proxy({}, { get: (_, c) => document.querySelector(`.${c}`) })
