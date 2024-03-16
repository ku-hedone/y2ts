import { RequiredStatus } from '../constant';
import type { JSONSchema4 } from 'json-schema';
import type { Api, ParamDocs, RequestPath, RequestQuery } from '../types';

class QueryURL {
  url: string;
  queryParams: RequestQuery | undefined;
  pathParams: RequestPath | undefined;

  constructor(api: Api, baseUrl: string) {
    this.url = this.genURL(api, baseUrl);
    this.queryParams = this.genQueryParams(api.req_query);
    this.pathParams = this.genPathParams(api.req_params);
  }

  private genURL({ path }: Api, prefix: string): string {
    return `${prefix}${path}`;
  }

  private generator(params: Api['req_query'] | Api['req_params']) {
    if (params.length) {
      const docs: ParamDocs['docs'] = [];
      const required: JSONSchema4['required'] = [];
      const properties = {} as Required<JSONSchema4>['properties'];
      params.forEach((i) => {
        const { name, desc = '' } = i;
        docs.push({ name, desc });
        properties[name] = {
          type: 'string',
          description: desc,
        };
        if ('required' in i) {
          // current params type is req_query
          if (i.required === RequiredStatus.true) {
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
    return void 0;
  }

  private genQueryParams(params: Api['req_query']): QueryURL['queryParams'] {
    return this.generator(params);
  }

  private genPathParams(params: Api['req_params']): QueryURL['pathParams'] {
    return this.generator(params);
  }
}

export default QueryURL;
