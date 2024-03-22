import { expect, describe, it, beforeAll, afterAll } from 'vitest';
import QueryURL from '../src/core/query-url';
import createQueryURLConfig from './factories/url';
import type { Api, ApiWithPathVariables } from '../src/types';

describe('query url', () => {
  let instance: QueryURL | undefined;
  let api: Api | undefined;

  const clean = () => {
    instance = void 0;
    api = void 0;
  };

  describe('when there are no parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: '无参数的get请求',
        method: 'GET',
        url: {},
      });
      instance = new QueryURL(api, '/prefix');
    });
    it('should generate the correct URL', () => {
      expect(instance!.url).toBe('/prefix/mock/api');
    });
    it('should not generate any query or path parameters', () => {
      expect(instance!.queryParams).toBeUndefined();
      expect(instance!.pathParams).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });
  describe('when there are path parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: '有path参数的get请求',
        method: 'GET',
        url: {
          params: {
            count: 1,
          },
        },
      });
      instance = new QueryURL(api, '/prefix');
    });
    it('should generate the correct URL', () => {
      expect(instance!.url).toBe(
        `/prefix/mock/api/{${(api! as ApiWithPathVariables).req_params[0].name}}`,
      );
    });
    it('should not generate any query parameters', () => {
      expect(instance!.queryParams).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });
  describe('when there are query parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: '有query参数的get请求',
        method: 'GET',
        url: {
          query: {
            count: 2,
            required: 2,
          },
        },
      });
      instance = new QueryURL(api, '/prefix');
    });
    it('should generate the correct URL', () => {
      expect(instance!.url).toBe('/prefix/mock/api');
    });

    it('should not generate any path parameters', () => {
      expect(instance!.pathParams).toBeUndefined();
    });
    it('should define query parameters', () => {
      expect(instance!.queryParams).toBeDefined();
    });
    it('query params object should have the correct type', () => {
      expect(instance!.queryParams!.type).toBe('object');
    });
    it('query params object should two required property', () => {
      expect(instance!.queryParams!.required).toHaveLength(2);
    });
    afterAll(() => {
      clean();
    });
  });
  describe('when there are partial query parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: '全部为非必填query参数的get请求',
        method: 'GET',
        url: {
          query: {
            count: 3,
            required: 1,
          },
        },
      });
      instance = new QueryURL(api, '/prefix');
    });
    it('should generate the correct URL', () => {
      expect(instance!.url).toBe('/prefix/mock/api');
    });

    it('should not generate any path parameters', () => {
      expect(instance!.pathParams).toBeUndefined();
    });
    it('should define query parameters', () => {
      expect(instance!.queryParams).toBeDefined();
    });
    it('query params object should have the correct type', () => {
      expect(instance!.queryParams!.type).toBe('object');
    });
    it('query params required length should be one', () => {
      expect(instance!.queryParams!.required).toHaveLength(1);
    });
    afterAll(() => {
      clean();
    });
  });
});
