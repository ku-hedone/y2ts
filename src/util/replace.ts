import { EMPTY_RECORD_PLACEHOLDER, MAP_KEY_SYMBOL } from "../constant";

export const replaceEmptyPlaceHolder = (str: string) => {
    return str
      .replaceAll(`"${EMPTY_RECORD_PLACEHOLDER}"`, `Record<string, unknown>`)
      .replaceAll(`'${EMPTY_RECORD_PLACEHOLDER}'`, `Record<string, unknown>`);
}

export const replaceMapKey = (str: string) => {
    return str
      .replaceAll(`"${MAP_KEY_SYMBOL}"`, `[key: string]`)
      .replaceAll(`'${MAP_KEY_SYMBOL}'`, `[key: string]`);
}