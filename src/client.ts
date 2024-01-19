const fetch = require('node-fetch');

export type RequestOptions = {
    url: string,
    method: 'GET' | 'POST',
    headers: any,
    params?: any,
    body?: any
};

export async function request(options: RequestOptions) {
    const url = `${options.url}?` + new URLSearchParams(options.params);
    const fetchOptions = {
        method: options.method,
        headers: {
            ...options.headers,
            accept: 'application/json'
        },
        body: options.body
    };
    const res = await fetch(url, fetchOptions);
    return res.json();
}
