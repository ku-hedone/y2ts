import type { JSONSchema4 } from "json-schema";

export interface ParamDocs {
  docs: { name: string; desc: string }[];
}

export interface QueryParameters
  extends Pick<Required<JSONSchema4>, 'properties'>,
    ParamDocs {
  type: 'object';
  required: string[];
}
export type PathVariables = QueryParameters;

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

type InnerQueryParameters = ParamsType<QueryParameters>;
type InnerPathVariables = ParamsType<PathVariables>;
type InnerSchema = ParamsType<JSONSchema4>;

export type BaseBluePrint<T = string> = {
  type: T;
  name: string;
  url: string;
  title: string;
  method: string;
  request?: InnerSchema;
  response?: InnerSchema;
};

export interface QueryBluePrint extends BaseBluePrint<'query'> {
  query: InnerQueryParameters;
}
export interface PathBluePrint extends BaseBluePrint<'path'> {
  path: InnerPathVariables;
}
export interface QueryAndPathBluePrint extends BaseBluePrint<'query&path'> {
  query: InnerQueryParameters;
  path: InnerPathVariables;
}
export interface NormalBluePrint extends BaseBluePrint<'normal'> {}

export type BluePrintInstance =
  | QueryBluePrint
  | QueryAndPathBluePrint
  | PathBluePrint
  | NormalBluePrint;
