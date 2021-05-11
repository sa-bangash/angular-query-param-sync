export enum CONTROL_TYPES {
  ARRAY = 'ARRAY',
  INT_ARRAY = 'INT_ARRAY',
  BOOLEAN = 'BOOLEAN',
  OBJECT = 'OBJECT',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
}
export const parse = (value: any, valueType: CONTROL_TYPES) => {
  switch (valueType) {
    case CONTROL_TYPES.STRING: {
      return value;
    }
    case CONTROL_TYPES.BOOLEAN: {
      return value === 'false' ? false : !!value;
    }
    case CONTROL_TYPES.INT_ARRAY: {
      if (Array.isArray(value)) {
        return value.map((item) => +item);
      } else if (value) {
        return [+value];
      }
      return [];
    }
    case CONTROL_TYPES.ARRAY: {
      if (Array.isArray(value)) {
        return value;
      } else if (value) {
        return [value];
      }
      return [];
    }
    case CONTROL_TYPES.NUMBER: {
      return +value;
    }
    case CONTROL_TYPES.OBJECT: {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  }
  return value;
};
export const isObjectEmpty = (obj: any): boolean =>
  !!!Object.keys(obj || {}).length;

export const PREFIX = '__filter__';
