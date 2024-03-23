import { expect, describe, it, beforeAll, afterAll } from 'vitest';
import BluePrint from '../src/core/blue-print';
import createQueryURLConfig from './factories/url';
import type { BluePrintInstance, PathBluePrint, QueryAndPathBluePrint, QueryBluePrint } from '../src/types/instance';
import type { Api } from '../src/types/api';

describe('blue print', () => {
  let instance: BluePrintInstance | undefined;
  let api: Api | undefined;

  const clean = () => {
    instance = void 0;
    api = void 0;
  };

  describe('GET request with no extra parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'GET request with no extra parameters',
        method: 'GET',
        url: {},
      });
      instance = new BluePrint(api, '/prefix').instance;
    });
    it('type value on the instance should be "normal"', () => {
      expect(instance!.type).toBe('normal');
    });
    it('instance should not have a query property', () => {
      expect('query' in instance!).toBeFalsy();
    });
    it('instance should not have a path property', () => {
      expect('path' in instance!).toBeFalsy();
    });
    it('instance should not have a request property', () => {
      expect(instance!.request).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });

  describe('GET request with only query parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'GET request with only query parameters',
        method: 'GET',
        url: {
          query: {
            count: 2,
          },
        },
      });
      instance = new BluePrint(api, '/prefix').instance;
    });
    it('type value on the instance should be "query"', () => {
      expect(instance!.type).toBe('query');
    });
    it('instance should have a query property', () => {
      expect('query' in instance!).toBeTruthy();
    });
    it('instance should have 2 query parameters', () => {
      expect(
        Reflect.ownKeys((instance as QueryBluePrint).query.type.properties),
      ).toHaveLength(2);
    });
    it('instance should not have a path property', () => {
      expect('path' in instance!).toBeFalsy();
    });
    it('instance should not have a request property', () => {
      expect(instance!.request).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });

  describe('GET request with only path parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'GET request with only path parameters',
        method: 'GET',
        url: {
          params: {
            count: 2,
          },
        },
      });
      instance = new BluePrint(api, '/prefix').instance;
    });
    it('type value on the instance should be "path"', () => {
      expect(instance!.type).toBe('path');
    });
    it('instance should not have a query property', () => {
      expect('query' in instance!).toBeFalsy();
    });
    it('instance should have a path property', () => {
      expect('path' in instance!).toBeTruthy();
    });
    it('instance should have 2 path variables', () => {
      expect(
        Reflect.ownKeys((instance as PathBluePrint).path.type.properties),
      ).toHaveLength(2);
    });
    it('both path variables should be required', () => {
      expect((instance as PathBluePrint).path.type.required).toHaveLength(2);
    });
    it('instance should not have a request property', () => {
      expect(instance!.request).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });

  describe('GET request with both query and path parameters', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'GET request with both query and path parameters',
        method: 'GET',
        url: {
          query: {
            count: 2,
            required: 1,
          },
          params: {
            count: 1,
          },
        },
      });
      instance = new BluePrint(api, '/prefix').instance;
    });
    it('type value on the instance should be "query&path"', () => {
      expect(instance!.type).toBe('query&path');
    });
    it('instance should have a query property', () => {
      expect('query' in instance!).toBeTruthy();
    });
    it('instance should have 2 query parameters', () => {
      expect(
        Reflect.ownKeys((instance as QueryAndPathBluePrint).query.type.properties),
      ).toHaveLength(2);
    });
    it('instance should have a path property', () => {
      expect('path' in instance!).toBeTruthy();
    });
    it('instance should have 1 path variable', () => {
      expect(
        Reflect.ownKeys((instance as QueryAndPathBluePrint).path.type.properties),
      ).toHaveLength(1);
    });
    it('instance should not have a request property', () => {
      expect(instance!.request).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });

  describe('POST request with only requestBody', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'POST request with only requestBody',
        method: 'POST',
        requestBody: {
          count: 3,
          required: 2,
        },
        url: {},
      });
      instance = new BluePrint(api, '/prefix').instance;
    });

    it('instance should have a request property', () => {
      expect(instance!.request).toBeDefined();
    });

    it('instance should have 3 request body fields', () => {
      expect(Object.keys(instance!.request!.type.properties!)).toHaveLength(3);
    });

    it('2 of the request body fields should be required', () => {
      expect(instance!.request!.type!.required).toHaveLength(2);
    });

    afterAll(() => {
      clean();
    });
  });

  describe('POST request with only responseBody (default)', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'POST request with only requestBody',
        method: 'POST',
        responseBody: {},
        url: {},
      });
      instance = new BluePrint(api, '/prefix').instance;
    });

    it('instance should not have request property', () => {
      expect(instance!.request).toBeUndefined();
    });

    it('instance should have a response property', () => {
      expect(instance!.response).toBeDefined();
    });

    it('instance should have 0 response body fields', () => {
      expect(Reflect.ownKeys(instance!.response!.type.properties!)).toHaveLength(0);
    });

    it("instance's response should not have a required property", () => {
      expect(instance!.response!.type!.required).toBeUndefined();
    });
    afterAll(() => {
      clean();
    });
  });

  describe('POST request with only responseBody (customization)', () => {
    beforeAll(() => {
      api = createQueryURLConfig({
        title: 'POST request with only requestBody',
        method: 'POST',
        responseBody: {
          values: [
            {
              type: 'string',
            },
            {
              type: 'number',
            },
            {
              type: 'boolean',
            },
            {
              type: 'object',
            },
          ],
          required: 3,
        },
        url: {},
      });
      instance = new BluePrint(api, '/prefix').instance;
    });

    it('instance should not have request property', () => {
      expect(instance!.request).toBeUndefined();
    });

    it('instance should have a response property', () => {
      expect(instance!.response).toBeDefined();
    });

    it('instance should have 4 response body fields', () => {
      expect(Reflect.ownKeys(instance!.response!.type.properties!)).toHaveLength(4);
    });

    it("instance's response should have 3 required properties", () => {
      expect(instance!.response!.type!.required).toHaveLength(3);
    });
    afterAll(() => {
      clean();
    });
  });
});
