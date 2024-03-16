import { JSONSchema4, JSONSchema4TypeName } from 'json-schema'
import { inject } from './inject';
// 类型映射表，键都为小写
const typeMapping: Record<string, JSONSchema4TypeName> = {
    byte: 'integer',
    short: 'integer',
    int: 'integer',
    long: 'integer',
    float: 'number',
    double: 'number',
    bigdecimal: 'number',
    char: 'string',
    void: 'null',
}
/**
 * 
 * 将 json 中描述的 数据类型 转为 ts 中的类型
 * 
 * @param type JSONSchema 返回 的 类型
 * @returns 
 */
const processType = (type: JSONSchema4['type']) => {
  if (type) {
    const types: JSONSchema4TypeName[] = [];
    if (Array.isArray(type)) {
      type.forEach((item) => {
        const TYPE = item.toLowerCase();
        types.push(typeMapping[TYPE] || TYPE);
      });
      return types;
    } else {
      return typeMapping[type] || type;
    }
  }
  // type === null will gen type
  return 'null';
}
/**
 * 对 json 中描述的 数据类型 转为 ts 中的类型
 * 
 * @param properties 
 * @returns 
 */
const processProperties = (properties: JSONSchema4['properties']) => {
    if (properties) {
        const nextProperties: JSONSchema4['properties'] = {};

        Object.keys(properties).forEach((property) => {
            const key = property.trim();
            const props = properties[key];
            if (!props.description) {
                props.description = props.title;
            }
            // TODO: 基于 extends 进行改造
            // 实现 property 的 atomic 化的类型
            if (props.title) {
                // 当 title 存在时 会独立生成 type 或者 interface
                // 所以暂时删除
                delete props.title;
                if (props.enumDesc) {
                    props.description = props.enumDesc;
                    delete props.enumDesc;
                }
            }
            if (props.type === 'object') {
                nextProperties[key] = processObject(props, false);
            } else if (props.type === 'array') {
                nextProperties[key] = processArray(props);
            } else {
                nextProperties[key] = props;
            }
        })

        return nextProperties;
    }
}
const processRequired = (required: JSONSchema4['required']) => {
    if (required && Array.isArray(required)) {
        const nextRequired: JSONSchema4['required'] = [];

        required.forEach((require) => {
            nextRequired.push(require.trim())
        });

        return nextRequired;
    }
    return required
}

export const processArray = (jsonSchema: JSONSchema4): JSONSchema4 => {
  const { items, required, ...other } = jsonSchema;
  return {
    ...other,
    items: items
      ? Array.isArray(items)
        ? items.map((item) => {
            return processObject(item, false);
          })
        : processObject(items, false)
      : items,
    /**
     * when additionalProperties === true
     *
     * json schema to typescript will gen a key-value
     * which is [key: string]: any
     * in the end of local type | interface's properties
     *
     * eg: interface Test {
     *
     *      name: string;
     *      [key: string]: any;
     * }
     */
    additionalProperties: false,
  };
};

export const processObject = (jsonSchema: JSONSchema4, _isRoot = true): JSONSchema4 => {
  const { properties, required, ...other } = inject(jsonSchema);
  const type = processType(other.type);
  if (Array.isArray(type)) {
    const schema: JSONSchema4 = {
      properties,
      required,
      ...other,
    };
    if (type.includes("array")) {
      if (other.items) {
        Object.assign(schema, { items: processArray(other.items) });
      }
    }
    if (type.includes('object')) {
      Object.assign(schema, {
        properties: properties ? processProperties(properties) : void 0,
        additionalProperties: typeof properties === 'undefined',
      });
    }
    return schema;
  } else {
    switch (type) {
      case 'array': {
        return processArray(jsonSchema);
      }
      case 'object': {
        const nextProperties = processProperties(properties);
        /**
         * deal with oneOf
         */
        const { oneOf } = other;
        if (oneOf) {
          return {
            ...other,
            type,
            oneOf: oneOf.map((v) => {
              return processObject(v, false);
            }),
          };
        }
        /**
         * root could not use definitions
         */
        // const isNotRootEmptyObject =
        //   (!nextProperties || !Object.keys(nextProperties).length) && !isRoot;
        // if (isNotRootEmptyObject) {
        //   return {
        //     $ref: '#/definitions/emptyObject',
        //     additionalProperties: false,
        //   };
        // }
        return {
          ...other,
          type,
          properties: nextProperties,
          required: processRequired(required),
          // current json-schema-to-typescript support gen object which has additionalProperties equals true
          // to be { [key: string]: unknown }
          additionalProperties: typeof nextProperties === 'undefined',
        };
      }
      default: {        
        return {
          type
        };
      }
    }
  }
};

