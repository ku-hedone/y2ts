import { RequestFormItemType, RequiredStatus } from './constant';
import type { JSONSchema4 } from 'json-schema';

interface OriginalRequestHeader {
  /** 名称 */
  name: string;
  /** 值 */
  value: string;
  /** 备注 */
  desc: string;
  /** 示例 */
  example: string;
  /** 是否必需 */
  required: RequiredStatus;
}
export interface OriginalPathVariable {
  _id: string;
  /** 名称 */
  name: string;
  /** 备注 */
  desc?: string;
  /** 示例 */
  example?: string;
}
export interface OriginalRequestQuery {
  _id: string;
  /** 名称 */
  name: string;
  /** 备注 */
  desc?: string;
  /** 示例 */
  example?: string;
  /** 是否必需 */
  required: RequiredStatus;
}

interface OriginalRequestBodyForm {
  /** 名称 */
  name: string;
  /** 类型 */
  type: RequestFormItemType;
  /** 备注 */
  desc: string;
  /** 示例 */
  example: string;
  /** 是否必需 */
  required: RequiredStatus;
}

export type BodyType = 'json' | 'text' | 'xml' | 'raw';

interface PathVariables {
  req_params: OriginalPathVariable[];
}

interface QueryParameters {
  req_query: OriginalRequestQuery[];
}
interface RequestBody {
  /** 仅 POST：请求内容类型。为 text, file, raw 时不必特殊处理。 */
  req_body_type?: BodyType;
  /** `req_body_type = json` 时是否为 json schema */
  req_body_is_json_schema: boolean;
  /** `req_body_type = form` 时的请求内容 */
  req_body_form: OriginalRequestBodyForm[];
  /** `req_body_type = json` 时的请求内容 */
  req_body_other?: string;
}
interface ResponseBody {
  /** `req_body_type = json` 时的请求内容 */
  req_body_other?: string;
  /** 返回数据类型 */
  res_body_type: BodyType;
  /** `res_body_type = json` 时是否为 json schema */
  res_body_is_json_schema?: boolean;
  /** 返回数据 */
  res_body: string;
}
/**
 * base HTTP
 */
export interface ApiBase {
  /** 接口 ID */
  _id: number;
  /** 接口名称 */
  title: string;
  /** 状态 */
  status: 'done' | 'undone';
  /** 接口备注 */
  markdown: string;
  /** 请求路径 */
  path: string;
  /** 请求方式，HEAD、OPTIONS 处理与 GET 相似，其余处理与 POST 相似 */
  method: string;
  /** 标签列表 */
  tag: string[];
  /** 所属项目 id */
  // project_id: number;
  /** 所属分类 id */
  // catid: number;
  /** 创建时间（unix时间戳） */
  // add_time: number;
  /** 更新时间（unix时间戳） */
  // up_time: number;
  /** 创建人 ID */
  // uid: number;
  /** 请求头 */
  req_headers: OriginalRequestHeader[];
}
/**
 * HTTP with PathVariables
 */
export interface ApiWithPathVariables extends ApiBase, PathVariables {}
/**
 * HTTP with QueryParameters
 */
export interface ApiWithQueryParameters extends ApiBase, QueryParameters {}
/**
 * HTTP with PathVariables, QueryParameters
 */
export interface ApiWithPathVariablesQueryParameters
  extends ApiBase,
    PathVariables,
    QueryParameters {}
/**
 * HTTP with RequestBody
 */
export interface ApiWithRequestBody extends ApiBase, RequestBody {}
/**
 * HTTP with PathVariables, RequestBody
 */
export interface ApiWithPathVariablesRequestBody
  extends ApiWithPathVariables,
    RequestBody {}
/**
 * HTTP with QueryParameters, RequestBody
 */
export interface ApiWithQueryParametersRequestBody
  extends ApiWithQueryParameters,
    RequestBody {}
/**
 * HTTP with PathVariables, QueryParameters, RequestBody
 */
export interface ApiWithPathVariablesQueryParametersRequestBody
  extends ApiWithPathVariablesQueryParameters,
    RequestBody {}
/**
 * HTTP  ResponseBody
 */
export interface ApiWithResponseBody extends ApiBase, ResponseBody {}
/**
 * HTTP with PathVariables, ResponseBody
 */
export interface ApiWithPathVariablesResponseBody
  extends ApiWithPathVariables,
    ResponseBody {}
/**
 * HTTP with QueryParameters, ResponseBody
 */
export interface ApiWithQueryParametersResponseBody
  extends ApiWithQueryParameters,
    ResponseBody {}
/**
 * HTTP with RequestBody, ResponseBody
 */
export interface ApiWithRequestBodyResponseBody
  extends ApiWithRequestBody,
    ResponseBody {}
/**
 * HTTP with PathVariables, QueryParameters, ResponseBody
 */
export interface ApiWithPathVariablesQueryParametersResponseBody
  extends ApiWithPathVariablesQueryParameters,
    ResponseBody {}
/**
 * HTTP with PathVariables, RequestBody, ResponseBody
 */
export interface ApiWithPathVariablesRequestBodyResponseBody
  extends ApiWithPathVariablesRequestBody,
    ResponseBody {}
/**
 * HTTP with QueryParameters, RequestBody, ResponseBody
 */
export interface ApiWithQueryParametersRequestBodyResponseBody
  extends ApiWithQueryParametersRequestBody,
    ResponseBody {}
/**
 * HTTP with PathVariables, QueryParameters, RequestBody, ResponseBody
 */
export interface ApiWithPathVariablesQueryParametersRequestBodyResponseBody
  extends ApiWithPathVariablesQueryParametersRequestBody,
    ResponseBody {}

/** 接口定义 */
export type Api =
  | ApiBase
  | ApiWithPathVariables
  | ApiWithQueryParameters
  | ApiWithPathVariablesQueryParameters
  | ApiWithRequestBody
  | ApiWithPathVariablesRequestBody
  | ApiWithQueryParametersRequestBody
  | ApiWithPathVariablesQueryParametersRequestBody
  | ApiWithResponseBody
  | ApiWithPathVariablesResponseBody
  | ApiWithQueryParametersResponseBody
  | ApiWithRequestBodyResponseBody
  | ApiWithPathVariablesQueryParametersResponseBody
  | ApiWithPathVariablesRequestBodyResponseBody
  | ApiWithQueryParametersRequestBodyResponseBody
  | ApiWithPathVariablesQueryParametersRequestBodyResponseBody;
/** 接口列表 */
export type InterfaceList = Api[];

/** 分类信息 */
export interface Category {
  /** ID */
  _id: number;
  /** 分类名称 */
  name: string;
  /** 分类备注 */
  desc: string;
  /** 分类接口列表 */
  list: InterfaceList;
  /** 创建时间（unix时间戳） */
  add_time: number;
  /** 更新时间（unix时间戳） */
  up_time: number;
}

/** 分类列表，对应数据导出的 json 内容 */
export type CategoryList = (Category & {
  list: Omit<
    Api,
    | '_id'
    | 'title'
    | 'status'
    | 'path'
    | 'method'
    | 'project_id'
    | 'catid'
    | 'tag'
    | 'add_time'
    | 'up_time'
    | 'uid'
  >[];
})[];

/** 项目信息 */
export interface Project {
  /** ID */
  _id: number;
  /** 名称 */
  name: string;
  /** 描述 */
  desc: string | null;
  /** 基本路径 */
  basepath: string;
  /** 标签 */
  tag: string[];
  /** 环境配置 */
  env: {
    /** 环境名称 */
    name: string;
    /** 环境域名 */
    domain: string;
  }[];
}

type Ids = string[] | number[];

type MainConfig = {
  /**
   * default value http://testyapi.akulaku.com/
   */
  host?: string;
  /**
   * project unique token
   */
  token: string;
  /**
   * default value: @/api/request
   */
  requestApiPath?: string;
};
/**
 * 共享的配置。
 */
export interface Y2ApiConfig {
  /**
   * project name
   */
  [key: string]: MainConfig &
    (
      | {
          /**
           * categories which will be gen
           */
          exclude?: Ids;
        }
      | {
          /**
           * categories which will be gen
           */
          include?: Ids;
        }
    );
}

export interface CLIArgs {
  /**
   * y2ts config path
   */
  config: string;
  /**
   * projects which will be gen
   */
  filter?: string[];
}

export type FullCategory = CategoryList[0] & {
  project_id: number;
  project_name: string;
  token: string;
  host: string;
  base: string;
};

interface CategoryConfig {
  /**
   * default value is src/api
   */
  output?: string | ((category: FullCategory & { LCP: string }) => string);
}

export interface Config {
  output?: CategoryConfig['output'];
  category: CategoryConfig[];
}

export interface ParamDocs {
  docs: { name: string; desc: string }[];
}

export interface RequestQuery
  extends Pick<Required<JSONSchema4>, 'properties'>,
    ParamDocs {
  type: 'object';
  required: string[];
}
export type RequestPath = RequestQuery;

export interface RequestBodyParams {
  requestBody: JSONSchema4;
  paramsTypeName: string;
}

export type ParamsType<T> = [undefined] extends [T]
  ? [T] extends [undefined]
    ? undefined
    :
        | {
            name: string;
            type: NonNullable<T>;
          }
        | undefined
  : {
      name: string;
      type: NonNullable<T>;
    };

type Query = ParamsType<RequestQuery>;
type Path = ParamsType<RequestPath>;
type Schema = ParamsType<JSONSchema4>;

export type BaseBluePrint<T = string> = {
  type: T;
  name: string;
  url: string;
  title: string;
  method: string;
  request?: Schema;
  response?: Schema;
};

export interface QueryBluePrint extends BaseBluePrint<'query'> {
  query: Query;
}
export interface PathBluePrint extends BaseBluePrint<'path'> {
  path: Path;
}
export interface QueryAndPathBluePrint extends BaseBluePrint<'query&path'> {
  query: Query;
  path: Path;
}
export interface NormalBluePrint extends BaseBluePrint<'normal'> {}

export type BluePrintInstance =
  | QueryBluePrint
  | QueryAndPathBluePrint
  | PathBluePrint
  | NormalBluePrint;
