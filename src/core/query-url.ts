import type { JSONSchema4 } from 'json-schema';
import type { ParamDocs, PathVariables, QueryParameters } from '../types/instance';
import type { Api, PathVariable, RequestQuery } from '../types/api';

class QueryURL {
  url: string;
  queryParams: QueryParameters | undefined;
  pathVariables: PathVariables | undefined;

  constructor(api: Api, baseUrl: string) {
    this.url = this.genURL(api, baseUrl);
    this.queryParams = this.genQueryParams(api);
    this.pathVariables = this.genPathParams(api);
  }

  private genURL({ path }: Api, prefix: string): string {
    return `${prefix}${path}`;
  }

  private generator(
    params: PathVariable[] | RequestQuery[],
  ): QueryParameters | undefined {
    const docs: ParamDocs['docs'] = [];
    const required: JSONSchema4['required'] = [];
    const properties = {} as Required<JSONSchema4>['properties'];
    params.forEach((i: PathVariable | RequestQuery) => {
      const { name, desc = '' } = i;
      docs.push({ name, desc });
      properties[name] = {
        type: 'string',
        description: desc,
      };
      if ('required' in i) {
        // current params type is req_query
        if (i.required === "1") {
          required.push(name);
        }
      } else {
        // current params type is req_params
        // all path params is required
        required.push(name);
      }
    });
    return {
      type: 'object',
      properties,
      required,
      docs,
    };
  }

  private genQueryParams(api: Api): QueryURL['queryParams'] {
    if ('req_query' in api && api.req_query.length) {
      return this.generator(api.req_query);
    }
  }

  private genPathParams(api: Api): QueryURL['pathVariables'] {
    if ('req_params' in api && api.req_params.length) {
      return this.generator(api.req_params);
    }
  }
}

export default QueryURL;
