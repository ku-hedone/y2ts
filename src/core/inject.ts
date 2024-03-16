import { JSONSchema4 } from "json-schema";
import { MAP_KEY_SYMBOL } from "../constant";

export const inject = (jsonSchema: JSONSchema4): JSONSchema4 => {
  const { required, properties } = jsonSchema;

  if (Array.isArray(required) && properties) {
    if (required.includes(MAP_KEY_SYMBOL)) {
      const items = Object.values(properties);
      return {
        ...jsonSchema,
        properties: {
          ...properties,
          [MAP_KEY_SYMBOL]: {
            type: 'object',
            oneOf: items,
          },
        },
      };
    }
  }

  return jsonSchema;
};
