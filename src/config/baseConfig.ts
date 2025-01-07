export const baseURL_dev: string = process.env.BASE_URL_DEV || 'http://127.0.0.1:17788/api/v1/';
export const baseURL_pro: string = process.env.BASE_URL_PRO || 'https://novelsapi.sanaoll.com/api/v1/';
export const customPort: number = Number(process.env.CUSTOM_PORT) || 27788;


export const baseURL: string = process.env.NODE_ENV === 'production' ? baseURL_pro : baseURL_dev;

console.log('Current Environment:', process.env.NODE_ENV);
console.log('Base URL:', baseURL);
console.log('Custom Port:', customPort);