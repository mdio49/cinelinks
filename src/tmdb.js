import { request } from "./client";

const apiKey = process.env.REACT_APP_TMBD_API_KEY;
const apiReadAccessToken = process.env.REACT_APP_TMBD_API_READ_ACCESS_TOKEN;

const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${apiReadAccessToken}`
}

export function authorizeTMBD() {
    const url = 'https://api.themoviedb.org/3/authentication';
    const options = {
        method: 'GET',
        headers
    };
    fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
}

export async function searchForLinks(input) {
    const films = await request({
        url: 'https://api.themoviedb.org/3/search/movie',
        method: 'GET',
        headers,
        params: {
            query: input
        }
    });
    const topResult = films.results[0];
    console.log('film', topResult);
    const credits = await request({
        url: `https://api.themoviedb.org/3/movie/${topResult.id}/credits`,
        method: 'GET',
        headers
    });
    console.log('credits', [...credits.cast, ...credits.crew.filter(c => c.job === 'Director')]);
    const result = await request({
        url: 'https://api.themoviedb.org/3/discover/movie',
        method: 'GET',
        headers,
        params: {
            with_people: [...credits.cast, ...credits.crew.filter(c => c.job === 'Director')].map(c => c.id).join('|')
        }
    });

    console.log('films', result);
    return {
        film: topResult,
        links: result?.results || []
    };
}
