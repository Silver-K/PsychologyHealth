/**
 * 将字节转化为可读性更好的单位
 * @param {*} size 字节
 */
function prettyMemorySize(size) {
  const INC = 1024;
  const LIMIT = 0.9;
  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let cur = size;
  while (cur > INC * LIMIT) {
    index += 1;
    cur /= INC;
  }
  return `${cur}${UNITS[index]}`;
}

module.exports = {
  prettyMemorySize
}