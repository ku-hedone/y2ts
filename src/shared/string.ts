export const split = (s: string, match: string) => {
    const length = s.length;
    const res = [];
    let word = '';
    for(let i = 0; i < length; i++) {
        if (s[i] !== match) {
            word += s[i];
        } else {
            if (word !== '') {
                res.push(word);
                word = '';
            }
        }
    }
    if (word !== '') {
        res.push(word)
    }
    return res;
}


export const upperCaseFirstWord = (
  word: string,
) => {
    const n = word.length;
    if (n) {
        let res = word[0].toLocaleUpperCase();
        for(let i = 1; i < n; i++) {
            res += word[i];
        }
        return res;
    }
    return '';
}