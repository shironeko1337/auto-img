// Export API class and singleton.
import { autoImgAPI } from "./api";
export { AutoImgAPI, autoImgAPI } from "./api";

// Expose singleton to global namespace on browser.
// Using uppercase because it's a singleton.
if (typeof window !== "undefined") {
  (window as any).AutoImgAPI = autoImgAPI;
}
