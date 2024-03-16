import type { JSONSchema4 } from "json-schema";

export const EMPTY_RECORD_PLACEHOLDER = `@@EMPTY_RECORD@@`;

export const MAP_KEY_SYMBOL = `@@MAP_KEY@@`;

export const definitions = {
  emptyObject: {
    type: 'string',
    enum: [EMPTY_RECORD_PLACEHOLDER],
  },
} as Required<JSONSchema4>['definitions'];

/** 请求方式 */
export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
}

/** 是否必需 */
export enum RequiredStatus {
  /** 不必需 */
  false = '0',
  /** 必需 */
  true = '1',
}

/** 请求数据类型 */
export enum RequestBodyType {
  /** 查询字符串 */
  query = 'query',
  /** 表单 */
  form = 'form',
  /** JSON */
  json = 'json',
  /** 纯文本 */
  text = 'text',
  /** 文件 */
  file = 'file',
  /** 原始数据 */
  raw = 'raw',
  /** 无请求数据 */
  none = 'none',
}

/** 请求路径参数类型 */
export enum RequestParamType {
  /** 字符串 */
  string = 'string',
  /** 数字 */
  number = 'number',
}

/** 请求查询参数类型 */
export enum RequestQueryType {
  /** 字符串 */
  string = 'string',
  /** 数字 */
  number = 'number',
}

/** 请求表单条目类型 */
export enum RequestFormItemType {
  /** 纯文本 */
  text = 'text',
  /** 文件 */
  file = 'file',
}

/** 返回数据类型 */
export enum ResponseBodyType {
  /** JSON */
  json = 'json',
  /** 纯文本 */
  text = 'text',
  /** XML */
  xml = 'xml',
  /** 原始数据 */
  raw = 'raw',

  // yapi 实际上返回的是 json，有另外的字段指示其是否是 json schema
  /** JSON Schema */
  // jsonSchema = 'json-schema',
}

/** 查询字符串数组格式化方式 */
export enum QueryStringArrayFormat {
  /** 示例: `a[]=b&a[]=c` */
  'brackets' = 'brackets',
  /** 示例: `a[0]=b&a[1]=c` */
  'indices' = 'indices',
  /** 示例: `a=b&a=c` */
  'repeat' = 'repeat',
  /** 示例: `a=b,c` */
  'comma' = 'comma',
  /** 示例: `a=["b","c"]` */
  'json' = 'json',
}
