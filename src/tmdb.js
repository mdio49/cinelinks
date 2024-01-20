import { request } from "./client";

const apiKey = process.env.REACT_APP_TMBD_API_KEY;
const apiReadAccessToken = process.env.REACT_APP_TMBD_API_READ_ACCESS_TOKEN;

const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${apiReadAccessToken}`
}

export async function authorizeTMBD() {
    try {
        const result = await request({
            url: 'https://api.themoviedb.org/3/authentication',
            method: 'GET',
            headers
        });
        if (!result?.success) {
            console.log(result);
        }
    }
    catch (err) {
        console.error('error', err);
    }
}

export async function searchForFilm(input) {
    const films = await request({
        url: 'https://api.themoviedb.org/3/search/movie',
        method: 'GET',
        headers,
        params: {
            query: input
        }
    });
    //console.log('films', films);
    const film = films?.results[0] || null;
    if (film) {
        await fillCredits(film);
    }
    return film;
}

export async function fillCredits(film) {
    const credits = await request({
        url: `https://api.themoviedb.org/3/movie/${film.id}/credits`,
        method: 'GET',
        headers
    });
    //console.log('credits', credits);
    film.cast = credits.cast;
    film.directors = credits.crew.filter(c => c.job === 'Director');
}

export async function searchForLinks(film, page = 1) {
    const people = [...film.cast, ...film.directors];
    const result = await request({
        url: 'https://api.themoviedb.org/3/discover/movie',
        method: 'GET',
        headers,
        params: {
            page,
            with_people: people.map(c => c.id).join('|')
        }
    });
    //console.log('films', result);
    const links = result?.results?.filter(m => m.id !== film.id) || [];
    await Promise.all(links.map(async l => {
        await fillCredits(l);
        const other = [...l.cast, ...l.directors];
        l.connections = people.filter(p => other.some(o => o.id === p.id));
    }))
    //console.log('links', links)
    return links.filter(l => l.connections?.length > 0);
}
