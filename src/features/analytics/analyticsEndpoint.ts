// Defined only by the public GitHub Pages build. Runtime secrets never enter this value.
declare const __ALTWING_API_ORIGIN__: string | undefined;
export const analyticsBackendOrigin=typeof __ALTWING_API_ORIGIN__==='string'?__ALTWING_API_ORIGIN__:'';
export function analyticsEndpoint(path:string){return analyticsBackendOrigin+path;}
