import { compile } from 'json-schema-to-typescript';
import { definitions } from '../constant';
import { dedent, upperCaseFirstWord, flow } from '../shared';
import { replaceEmptyPlaceHolder, replaceMapKey } from '../util/replace';
import type { JSONSchema4 } from 'json-schema';
import type { BluePrintInstance } from '../types/instance';

const STATIC_CONFIG_CODE = 'config?: AxiosRequestConfig';

class Compiler {
  methods: Set<string>;
  flow = flow([replaceEmptyPlaceHolder, replaceMapKey]);
  constructor() {
    this.methods = new Set();
  }

  genRequestArgs(instance: BluePrintInstance) {
    const { type } = instance;
    const otherArgs = instance.request
      ? `data: ${instance.request.name}, ${STATIC_CONFIG_CODE}`
      : instance.method === 'POST'
        ? `data?: Record<string, unknown>, ${STATIC_CONFIG_CODE}`
        : STATIC_CONFIG_CODE;
    switch (type) {
      case 'normal': {
        return otherArgs;
      }
      case 'path': {
        return `path: ${instance.path.name}, ${otherArgs}`;
      }
      case 'query': {
        return `query: ${instance.query.name}, ${otherArgs}`;
      }
      case 'query&path': {
        return `path: ${instance.path.name}, query: ${instance.query.name}, ${otherArgs}`;
      }
      default: {
        return '';
      }
    }
  }

  genAxiosArgs(instance: BluePrintInstance) {
    const url = this.genUrl(instance);

    const args = instance.request
      ? `data, config`
      : instance.method === 'POST'
        ? `data, config`
        : 'config';

    switch (instance.type) {
      case 'normal':
      case 'path': {
        return `${url}, { ${args} }`;
      }
      case 'query':
      case 'query&path': {
        return `${url}, { query, ${args} }`;
      }
      default: {
        return '';
      }
    }
  }

  genUrl(instance: BluePrintInstance) {
    let url = instance.url;
    if ('path' in instance) {
      const { path } = instance;
      const keys = Reflect.ownKeys(path.type.properties) as string[];
      keys.forEach((key) => {
        // /url/{path param}/  -> /url/${path}
        url = url.replaceAll(`{${key}}`, `\${path.${key}}`);
      });
      return `\`${url}\``;
    }
    return `"${url}"`;
  }

  genFunctionName(instance: BluePrintInstance) {
    const { name, method } = instance;
    return `${method.toLocaleLowerCase()}${upperCaseFirstWord(name)}`;
  }

  genAxiosType(instance: BluePrintInstance) {
    const { method, response } = instance;
    return `${method.toLocaleLowerCase()}Request<${response ? response.name : 'never'}>`;
  }

  genCode(instance: BluePrintInstance) {
    this.methods.add(instance.method);
    const RequestArgs = this.genRequestArgs(instance);
    const AxiosArgs = this.genAxiosArgs(instance);
    const FunctionName = this.genFunctionName(instance);
    const AxiosType = this.genAxiosType(instance);
    // todo 补充 parameters 字段描述
    const description = instance.title
      ? dedent`\n
        /**
        * @remarks
        * ${instance.title}
        */`
      : '';
    return (
      // `${paramsDefine}` +
      dedent`${description}\r\nexport const ${FunctionName} = (${RequestArgs}) => {
        return ${AxiosType}(${AxiosArgs});
      }`
    );
  }

  genMethod() {
    return Array.from(this.methods);
  }

  genTypings = async (
    schema: JSONSchema4,
    typeName: string,
    declareExternallyReferenced = false,
  ) => {
    const { type } = schema;
    // TODO: deal with empty jsonSchema
    // TODO: deal with Type
    if (type === 'null') {
      return undefined;
    }
    // delete undefined properties
    const { title: _, $$ref, ...json } = schema;
    const code = await compile(
      {
        ...json,
        definitions,
      },
      typeName,
      {
        bannerComment: '',
        unknownAny: true,
        style: {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 90,
          tabWidth: 2,
          jsxBracketSameLine: true,
          endOfLine: 'auto',
        },
        /**
         * 控制是否生成外部引用
         * false 时 存在 $ref 的 内容不会被生成
         */
        declareExternallyReferenced,
      },
    );
    return {
      code: this.flow(code),
      name: typeName,
    };
  };
}

export default Compiler;
