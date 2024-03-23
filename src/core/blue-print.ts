import QueryURL from './query-url';
import * as helper from '../util/blue-print-helper';
import type {
  BaseBluePrint,
  BluePrintInstance,
  NormalBluePrint,
  ParamsType,
  PathBluePrint,
  QueryAndPathBluePrint,
  QueryBluePrint,
} from '../types/instance';
import type { Api } from '../types/api';

class BluePrint {
  instance: BluePrintInstance;
  constructor(api: Api, baseUrl: string) {
    this.instance = this.build(api, baseUrl);
  }

  private genParamsType =
    (name: string, method: string) =>
    <T>(prefix: string, type: T): ParamsType<NonNullable<T>> | undefined => {
      if (typeof type === 'undefined') {
        return void 0;
      }
      return {
        name: helper.typeName(prefix, name, method),
        type,
      } as ParamsType<NonNullable<T>>;
    };

  private build(api: Api, baseUrl: string): BluePrintInstance {
    const Query = new QueryURL(api, baseUrl);
    const name = helper.genApiName(api.path);
    const method = helper.genMethod(api.method);
    const genType = this.genParamsType(name, method);
    const query = genType('Query', Query.queryParams);
    const path = genType('Path', Query.pathVariables);
    const instance: Omit<BaseBluePrint, 'type'> = {
      name,
      url: Query.url,
      title: api.title,
      method: method.toLocaleUpperCase(),
      request: genType('RequestParams', helper.genRequestBodyParams(api, method)),
      response: genType('ResponseType', helper.genResponse(api)),
    };

    if (query && path) {
      return { ...instance, type: 'query&path', query, path } as QueryAndPathBluePrint;
    } else if (query) {
      return { ...instance, type: 'query', query } as QueryBluePrint;
    } else if (path) {
      return { ...instance, type: 'path', path } as PathBluePrint;
    } else {
      return { ...instance, type: 'normal' } as NormalBluePrint;
    }
  }
}

export default BluePrint;
