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

/**
 * -5.1% to 5.1%
 */
export function getReversePctNumber(value: string) {
  return `${-Number(value.replace(/[^\d\-\.]/g, ""))}%`;
}

/**
 * Return a dimension string in px if it's a numeric value, otherwise return the original value.
 */
export function getDimensionValue(attrValue: string | number | null): string {
  attrValue = `${attrValue}`;
  const trimmed = attrValue.trim();

  // Check if it's just a number without units
  const numVal = parseFloat(trimmed);
  if (!Number.isNaN(numVal) && trimmed === numVal.toString()) {
    return numVal + "px";
  }

  // Otherwise, check if it's a valid dimension with units
  if (isDimensionValue(trimmed)) {
    return trimmed;
  }

  return "";
}

function isDimensionValue(value: string) {
  if (typeof value !== "string") return false;

  // List of CSS length units
  const units = [
    "px",
    "em",
    "rem",
    "vw",
    "vh",
    "vmin",
    "vmax",
    "cm",
    "mm",
    "in",
    "pt",
    "pc",
    "q",
    "%",
  ];

  // Build a regex: optional sign, number (int or decimal), optional unit
  const unitPattern = units.join("|");
  const regex = new RegExp(`^[-+]?\\d*\\.?\\d+(?:${unitPattern})?$`, "i");

  return regex.test(value.trim());
}

/**
 * HTML attruibutes defined might have "false" as value and it should be equivalent to undefined or null,
 * otherwise. it's true, including empty string,.
 */
export function getTruthyAttrValue(attrValue: string | null | undefined): boolean {
  return attrValue === undefined || attrValue === null || attrValue === "false"
    ? false
    : true;
}

export function camelToDash(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
