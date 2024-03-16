export const longestCommonPrefixCompare = (str1: string, str2: string) => {
    const length = Math.min(str1.length, str2.length);
    let index = 0;
    let str = ''
    while (index < length && str1[index] === str2[index]) {
        str += str1[index];
        index++;
    }
    return str;
}