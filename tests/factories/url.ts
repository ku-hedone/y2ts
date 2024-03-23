import type { BodyType, PathVariable, RequestQuery } from '../../src/types/api';

type PrimitiveType = {
  type: 'string' | 'number' | 'boolean';
};
type ObjectType = {
  type: 'object';
  // properties: Record<string, PrimitiveType | ObjectType | ArrayType>;
};
type ArrayType = {
  type: 'array';
  // item: (PrimitiveType | ObjectType | ObjectType)[];
};

type URLFactoryOption = {
  title: string;
  url: {
    params?: {
      count: number;
    };
    query?: {
      count: number;
      required?: number;
    };
  };
  responseBody?: {
    values?: (PrimitiveType | ArrayType | ObjectType)[];
    required?: number;
  };
} & (
  | { method: 'GET' }
  | { method: 'POST'; requestBody?: { count: number; required?: number } }
);

const genRandomDescription = (
  baseDesc: string,
  probability: number,
): string | undefined => {
  return Math.random() < probability ? `${baseDesc}` : undefined;
};

const ensureAtLeastOneUndefinedDesc = (
  params: RequestQuery[] | PathVariable[],
) => {
  const allHaveDesc = params.every((param) => param.desc !== undefined);
  if (allHaveDesc) {
    // 随机选择一个参数将其描述设置为undefined
    const randomIndex = Math.floor(Math.random() * params.length);
    params[randomIndex].desc = undefined;
  }
};

const genQueryParameters = (
  params: URLFactoryOption['url']['query'],
):
  | {
      req_query: RequestQuery[];
    }
  | undefined => {
  if (params && params.count) {
    const req_query: RequestQuery[] = [];
    let id = Date.now();
    for (let i = 0; i < params.count; i++) {
      req_query.push({
        required: i < (params.required || 0) ? "1" : "0",
        _id: `${id++}${i.toString().padStart(3, '0')}`,
        name: `param${i}`,
        desc: genRandomDescription(`参数${i}`, 0.5),
      });
    }
    ensureAtLeastOneUndefinedDesc(req_query);
    return {
      req_query,
    };
  }
};

const genPathVariables = (params: URLFactoryOption['url']['params']): PathVariable[] => {
  const req_params: PathVariable[] = [];
  if (params && params.count) {
    let id = Date.now();
    for (let i = 0; i < params.count; i++) {
      req_params.push({
        _id: `${id++}${i.toString().padStart(3, '0')}`,
        name: `param${i}`,
        desc: genRandomDescription(`参数${i}`, 0.5),
      });
    }
    ensureAtLeastOneUndefinedDesc(req_params);
  }
  return req_params;
};

const genURL = (
  url: URLFactoryOption['url'],
): { path: string; req_params?: PathVariable[] } => {
  const path: string[] = ['/mock/api'];

  // 生成路径参数字符串
  const req_params = genPathVariables(url.params);
  if (req_params.length > 0) {
    // 将每个参数名称用大括号括起来，添加到路径中
    req_params.forEach((param) => {
      path.push(`{${param.name}}`);
    });
    return {
      path: path.join('/'),
      req_params,
    };
  }

  return {
    path: path.join('/'),
  };
};

const genRequestBody = (
  option: URLFactoryOption,
): {
  req_body_is_json_schema?: boolean;
  req_body_type?: BodyType;
  req_body_other?: string;
} => {
  //
  if (option.method === 'POST' && option.requestBody) {
    const { count, required = 0 } = option.requestBody;
    const types = ['number', 'boolean', 'string', 'object', 'array'] as const;
    const fieldNames: string[] = [];
    const properties: {
      [key: string]: {
        type: 'number' | 'boolean' | 'string' | 'object' | 'array';
      };
    } = {};

    // 根据 count 生成字段名并决定哪些字段是必填的
    for (let i = 0; i < count; i++) {
      const fieldName = `field${i}`;
      const typeIndex = Math.floor(Math.random() * types.length); // 随机选择类型
      const type = types[typeIndex];
      properties[fieldName] = { type };

      if (i < required) {
        fieldNames.push(fieldName);
      }
    }

    return {
      req_body_type: 'json',
      req_body_is_json_schema: true,
      req_body_other: JSON.stringify({
        type: 'object',
        required: fieldNames,
        properties,
      }),
    };
  }
  return {};
};

const genResponseBody = (
  option: URLFactoryOption,
): {
  res_body_is_json_schema?: boolean;
  res_body_type?: BodyType;
  res_body?: string;
} => {
  const { responseBody } = option;
  if (responseBody) {
    const { values, required = 0 } = responseBody;
    if (values) {
      const fieldNames: string[] = [];
      const properties: Record<string, unknown> = {};

      values.forEach((value, index) => {
        const fieldName = `field${index}`;

        if (index < required) {
          fieldNames.push(fieldName);
        }

        switch (value.type) {
          case 'object': {
            // Add more detailed handling if object has properties
            properties[fieldName] = {
              type: value.type,
              properties: {}, // Should be expanded based on object's definition
            };
            break;
          }
          case 'array': {
            // Add handling for array type, considering item types
            properties[fieldName] = {
              type: 'array',
              items: {}, // Should be expanded based on array's item definition
            };

            break;
          }
          case 'boolean':
          case 'number':
          case 'string': {
            // PrimitiveType
            properties[fieldName] = {
              type: value.type,
            };
            break;
          }
          default: {
            break;
          }
        }
      });

      return {
        res_body_type: 'json',
        res_body_is_json_schema: true,
        res_body: JSON.stringify({
          type: 'object',
          required: fieldNames,
          properties,
        }),
      };
    }
    return {
      res_body_is_json_schema: true,
      res_body_type: 'json',
      res_body: JSON.stringify({
        title: 'response_body',
        required: ['success', 'code', 'data'],
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          code: { type: 'number' },
          msg: { type: 'string' },
          timestamp: { type: 'number' },
          data: {
            type: 'object',
            properties: {},
          },
        },
      }),
    };
  }
  return {};
};

const createQueryURLConfig = (options: URLFactoryOption) => {
  return {
    status: 'done' as const,
    tag: [],
    _id: Date.now(),
    method: options.method,
    title: options.title,
    ...genURL(options.url),
    ...genQueryParameters(options.url.query),
    req_headers: [],
    req_body_form: [],
    markdown: '',
    ...genRequestBody(options),
    ...genResponseBody(options),
  };
};
export default createQueryURLConfig;
