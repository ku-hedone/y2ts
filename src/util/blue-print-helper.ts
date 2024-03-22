import { split, upperCaseFirstWord } from '../shared';
import type { JSONSchema4 } from 'json-schema';
import type { Api } from '../types';

const delimiters = new Set(['-', '_']);

export const genApiName = (path: string): string => {
  const names = split(path, '/');
  const apiName = names.reduce((p, l) => {
    l = l.replace('{', '').replace('}', '');
    const [first, ...other] = l;
    let needUpper = false;
    const res: string[] = [];
    other.forEach((w) => {
      if (delimiters.has(w)) {
        needUpper = true;
      } else {
        if (needUpper) {
          res.push(w.toLocaleUpperCase());
          needUpper = false;
        } else {
          res.push(w.toLocaleLowerCase());
        }
      }
    });
    return `${p}${first.toLocaleUpperCase()}${res.join('')}`;
  }, '');
  return apiName;
};

export const typeName = (kind: string, name: string, method: string): string => {
  return `${method}${upperCaseFirstWord(
    name.replace(
      /(^\s*[^a-zA-Z_$])|([^a-zA-Z_$\d])|(_[a-z])|([\d$]+[a-zA-Z])|(\s+[a-zA-Z])|\s/g,
      (match, p1, p2, p3, p4, p5) => {
        if (p1) {
          // replace chars which are not valid for typescript identifiers with whitespace
          return ' ';
        } else if (p2) {
          // uppercase leading underscores followed by lowercase
          return match.toUpperCase();
        } else if (p3) {
          // remove non-leading underscores followed by lowercase (convert snake_case)
          return match.substr(1, match.length).toUpperCase();
        } else if (p4) {
          // uppercase letters after digits, dollars
          return match.toUpperCase();
        } else if (p5) {
          // uppercase first letter after whitespace
          return match.toUpperCase().trim();
        } else {
          // remove remaining whitespace
          return '';
        }
      },
    ),
  )}${kind}`;
};

export const genRequestBodyParams = (
  api: Api,
  method: string,
): JSONSchema4 | undefined => {
  if ('req_body_type' in api) {
    const { req_body_type, req_body_other } = api;
    if (
      req_body_type === 'json' &&
      req_body_other &&
      method.toLocaleLowerCase() !== 'get'
    ) {
      return JSON.parse(req_body_other);
    }
  }
  // TODO more req_body_type support : form...
  return void 0;
};

export const genMethod = (method: string): string => {
  return upperCaseFirstWord(method.toLocaleLowerCase());
};

export const genResponse = (api: Api): JSONSchema4 => {
  if ('res_body_type' in api) {
    const { res_body_type, res_body_is_json_schema, res_body } = api;
    if (res_body_type === 'json' && res_body_is_json_schema && res_body) {
      const { title: _, ...json } = JSON.parse(res_body);
      if ('properties' in json && json.properties.data) return json.properties.data;
    }
  }

  return { type: 'null' };
};
