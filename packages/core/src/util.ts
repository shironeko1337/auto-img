export function iterateCartesianProduct(arr: any[], callback: Function) {
  let s: number[] = Array(arr.length).fill(-1),
    i = 0;

  while (i > -1) {
    if (s[i] + 1 < arr[i].length) {
      // set value for current permutation
      s[i] += 1;
      if (i == arr.length - 1) {
        callback(s, arr);
      } else {
        i += 1;
      }
    } else {
      s[i] = -1;
      i -= 1;
    }
  }
}
