import { inject } from './inject';
import type { JSONSchema4, JSONSchema4TypeName } from 'json-schema';

type RefName = string;
type Type = JSONSchema4['type'];
type Properties = JSONSchema4['properties'];
type NextProperties = Required<JSONSchema4>['properties'];

class Processor {
  private book: Map<RefName, JSONSchema4>;
  private mapping: Map<string, JSONSchema4TypeName>;
  constructor() {
    this.book = new Map();
    this.mapping = new Map([
      ['byte', 'number'],
      ['short', 'number'],
      ['int', 'number'],
      ['long', 'number'],
      ['float', 'number'],
      ['double', 'number'],
      ['bigdecimal', 'number'],
      ['char', 'string'],
      ['void', 'null'],
    ]);
  }

  /**
   *
   * 将 json 中描述的 数据类型 转为 ts 中的类型
   *
   * @param type JSONSchema 返回 的 类型
   * @returns
   */
  processType = (type: Type) => {
    if (type) {
      const types: JSONSchema4TypeName[] = [];
      if (Array.isArray(type)) {
        type.forEach((item) => {
          types.push(this.mapping.get(item.toLowerCase()) || item);
        });
        return types;
      } else {
        return this.mapping.get(type.toLowerCase()) || type;
      }
    }
    return 'null';
  };

  sign = (schema: JSONSchema4) => {
    if (schema.title && schema.$$ref) {
      if (!this.book.has(schema.$$ref)) {
        this.book.set(schema.$$ref, {
          ...schema,
          additionalProperties: false,
        });
      } else {
        return true;
      }
    }
    return false;
  };

  clearTitle = (schema: JSONSchema4, isRoot: boolean) => {
    if (isRoot) {
      schema.title = undefined;
    } else {
      const { title, $$ref } = schema;
      // number string boolean null must does not has $$ref
      if (title && !$$ref) {
        schema.title = undefined;
      }
    }
  };

  /**
   *
   * @param oneOf
   * @returns
   */
  private processOneOf = (
    oneOf: Required<JSONSchema4>['oneOf'],
  ): Required<JSONSchema4>['oneOf'] => {
    return oneOf.map((one) => this.processItem(one, false));
  };

  /**
   * 对 json 中描述的 数据类型 转为 ts 中的类型
   *
   * @param properties
   * @returns
   */
  private processProperties = (properties: Properties): Properties => {
    if (properties) {
      const nextProperties: NextProperties = {};
      Object.keys(properties).forEach((key) => {
        const value = properties[key];
        if (!value.description) {
          value.description = value.title;
        }
        if (value.enumDesc) {
          value.description = value.description
            ? `${value.description} (${value.enumDesc})`
            : value.enumDesc;
        }
        nextProperties[key] = this.processItem(value, false);
      });
      return nextProperties;
    }
  };

  private processRequired = (required: JSONSchema4['required']) => {
    if (required && Array.isArray(required)) {
      const nextRequired: JSONSchema4['required'] = [];
      required.forEach((require) => {
        nextRequired.push(require.trim());
      });

      return nextRequired;
    }
    return required;
  };

  private processUseExternal = (schema: JSONSchema4) => {
    return schema.title ? this.book.has(schema.title) : false;
  };

  private processNull(_: JSONSchema4): JSONSchema4 {
    return {
      type: 'null',
    };
  }

  private processArray(schema: JSONSchema4): JSONSchema4 {
    const { items, ...other } = schema;
    return {
      ...other,
      items: items
        ? Array.isArray(items)
          ? items.map((item) => this.processItem(item, false))
          : this.processItem(items, false)
        : undefined,
      additionalProperties: false,
      // declareExternallyReferenced: this.processUseExternal(schema),
      // title: undefined,
    };
  }

  private processItem(schema: JSONSchema4, isRoot: boolean): JSONSchema4 {
    this.clearTitle(schema, isRoot);
    const nextSchema = inject(schema);
    const type = this.processType(nextSchema.type);
    this.sign(nextSchema);
    const { oneOf } = nextSchema;
    if (type === 'null') {
      return this.processNull(schema);
    } else if (type === 'array') {
      return this.processArray(schema);
    } else if (type === 'object') {
      if (oneOf) {
        return {
          ...nextSchema,
          oneOf: this.processOneOf(oneOf),
        };
      }
      return {
        ...nextSchema,
        properties: this.processProperties(nextSchema.properties),
        additionalProperties: false,
      };
    }
    return {
      ...nextSchema,
      type,
      additionalProperties: false,
    };
  }

  process = (schema: JSONSchema4): JSONSchema4 => {
    return this.processItem(schema, true);
  };

  reset() {
    const lastBook = [...this.book.values()];
    this.book.clear();
    return lastBook;
  }
}

export default Processor;
