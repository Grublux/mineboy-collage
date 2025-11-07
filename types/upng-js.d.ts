declare module "upng-js" {
  export function encode(
    imgs: ArrayBuffer[],
    width: number,
    height: number,
    cnum: number,
    dels?: number[]
  ): ArrayBuffer;

  export function decode(data: ArrayBuffer): {
    width: number;
    height: number;
    depth: number;
    ctype: number;
    frames: ArrayBuffer[];
    tabs: Record<string, any>;
  };

  export function toRGBA8(img: any): ArrayBuffer[];
}

export default UPNG;
declare const UPNG: typeof import("upng-js");


