export function info(msg: string, ...args: any[]) { console.log([INFO] , ...args); }
export function warn(msg: string, ...args: any[]) { console.warn([WARN] , ...args); }
export function error(msg: string, ...args: any[]) { console.error([ERROR] , ...args); }
export function debug(msg: string, ...args: any[]) { console.debug([DEBUG] , ...args); }
export default { info, warn, error, debug };

