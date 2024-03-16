/**
 * 
 * @param str string or Template literals
 * @param values embedded expressions in Template literals
 * @returns 
 */
const dedent = (
  str: string | TemplateStringsArray,
  ...values: string[]
) => {
  // 如果 templateStrings 是一个字符串，将其转换为一个只包含这个字符串的数组
  const strings = typeof str === 'string' ? [str] : [...str];

  // 移除最后一个字符串的尾部空白
  strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, '');

  // 寻找所有的换行符，以确定最高的公共缩进级别
  const matches = [];
  for (let i = 0; i < strings.length; i++) {
    let match;
    if ((match = strings[i].match(/\n[\t ]+/g))) {
      matches.push(...match);
    }
  }

  // 从所有字符串中移除公共缩进
  if (matches.length) {
    const size = Math.min(...matches.map((value) => value.length - 1));
    const pattern = new RegExp(`\n[\t ]{${size}}`, 'g');
    for (let i = 0; i < strings.length; i++) {
      strings[i] = strings[i].replace(pattern, '\n');
    }
  }

  // 移除第一个字符串的首部空白
  strings[0] = strings[0].replace(/^\r?\n/, '');

  // 在所有字符串处理完毕后执行插值
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += values[i] + strings[i + 1];
  }

  return result;
}

export default dedent;