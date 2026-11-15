// Legacy event facade retained for feature compatibility; no third-party provider.
export const isPostHogConfigured=false;
const posthog={capture(event:string,properties?:Record<string,unknown>){void event;void properties;},logger:{info(message:string,attributes:Record<string,string|number|boolean>){void message;void attributes;}}};
export default posthog;
