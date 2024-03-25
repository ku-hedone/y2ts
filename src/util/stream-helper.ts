export const generatorImportCode = (path: { api: string; methods: string[] }) => {
  const methods = path.methods.map((i) => `${i.toLocaleLowerCase()}Request`);
  const codes =
    methods.length === 1
      ? `\t${methods[0]}\n`
      : methods.reduce((p, l) => {
          p += `\t${l},\n`;
          return p;
        }, '');
  return `import {\n${codes}} from '${path.api}';\nimport type { AxiosRequestConfig } from 'axios';\n`;
};
