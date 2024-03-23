interface AdditionalDescription {
  /**
   * comments
   */
  desc?: string;
  example?: string;
}

/**
 * 0: optional
 * 
 * 1: required
 */
type Status = "0" | "1";

interface RequestHeader extends AdditionalDescription {
  name: string;
  value: string;
  required: Status;
}

interface PathVariable extends AdditionalDescription {
  _id: string;
  name: string;
}

interface RequestQuery extends AdditionalDescription {
  _id: string;
  name: string;
  required: Status;
}
/**
 * type of request body form
 * 
 * text or file
 */
export type RequestBodyFormType = "text" | "file";

interface RequestBodyForm extends AdditionalDescription {
  name: string;
  type: RequestBodyFormType;
  required: Status;
}

export type BodyType = 'json' | 'text' | 'xml' | 'raw';

interface PathVariables {
  req_params: PathVariable[];
}

interface QueryParameters {
  req_query: RequestQuery[];
}

interface RequestBody {
  req_body_type?: BodyType | 'form';
  req_body_is_json_schema: boolean;
  /**
   * content of request when req_body_type is form
   */
  req_body_form: RequestBodyForm[];
  /**
   * content of request when req_body_type is json
   */
  req_body_other?: string;
}

interface ResponseBody {
  res_body_type: BodyType;
  res_body_is_json_schema: boolean;
  /**
   * content of request when res_body_type is json
   */
  req_body_other?: string;
  res_body: string;
}
/**
 * base HTTP
 */
export interface ApiBase {
  _id: number;
  title: string;
  /**
   * done: finished
   * 
   * undone: unfinished
   */
  status: 'done' | 'undone';
  /**
   * remark of interface
   */
  markdown: string;
  /**
   * request path
   */
  path: string;
  /**
   * request methods
   */
  method: string;
  /**
   * tags of interface
   */
  tag: string[];
  req_headers: RequestHeader[];
  // project_id: number;
  // catid: number;
  // add_time: number;
  // up_time: number;
  // uid: number;
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

/** YAPI */
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
