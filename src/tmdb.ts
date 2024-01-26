import { request } from "./client";

const apiKey = process.env.REACT_APP_TMBD_API_KEY;
const apiReadAccessToken = process.env.REACT_APP_TMBD_API_READ_ACCESS_TOKEN;

const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${apiReadAccessToken}`
}

function isValidMovie(film: any) {
    return film.release_date && new Date(film.release_date).getTime() <= Date.now();
}

function isValidPerson(person: any) {
    return person.known_for_department === 'Acting' || person.known_for_department === 'Directing';
}

export function getFilmDisplayTitle(film: any) {
    return `${film.original_title /*+ (film.original_language !== 'en' ? ` / ${film.title}` : '')*/} (${new Date(film.release_date).getFullYear() || '???'})`;
}

export function getPersonSubtitle(person: any) {
    return person.known_for_department === 'Acting' ? 'Actor' : 'Director';
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

export async function searchGeneral(input: string): Promise<any[]> {
    const result = await request({
        url: 'https://api.themoviedb.org/3/search/multi',
        method: 'GET',
        headers,
        params: {
            query: input
        }
    });
    const results = result?.results?.filter((r: any) => {
        if (r.media_type === 'movie') {
            return isValidMovie(r);
        }
        else if (r.media_type === 'person') {
            return isValidPerson(r);
        }
        else {
            return false;
        }
    });
    //console.log('results', results);
    return results || null;
}

export async function searchForFilm(input: string) {
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

export async function searchForPerson(input: string) {
    const people = await request({
        url: 'https://api.themoviedb.org/3/search/person',
        method: 'GET',
        headers,
        params: {
            query: input
        }
    });
    //console.log('people', people);
    return people?.results[0] || null;
}

export async function fillCredits(film: any) {
    const credits = await request({
        url: `https://api.themoviedb.org/3/movie/${film.id}/credits`,
        method: 'GET',
        headers
    });
    //console.log('credits', credits);
    film.cast = credits.cast;
    film.directors = credits.crew.filter((c: any) => c.job === 'Director');
}

export async function searchForLinks(film: any, page = 1, excludedPeople: any[] = []) {
    const people = [...film.cast, ...film.directors].filter(p => !excludedPeople.includes(p.id));
    const result = await request({
        url: 'https://api.themoviedb.org/3/discover/movie',
        method: 'GET',
        headers,
        params: {
            page,
            with_people: people.map(p => p.id).join('|')
        }
    });
    //console.log('films', result);
    const links = result?.results?.filter((m: any) => m.id !== film.id && isValidMovie(m)) || [];
    await Promise.all(links.map(async (l: any) => {
        await fillCredits(l);
        const other = [...l.cast, ...l.directors];
        l.connections = people.filter(p => other.some(o => o.id === p.id));
        l.connections = l.connections.filter((p: any, i: number) => !l.connections.some((q: any, j: number) => p.id === q.id && i > j));
    }));
    //console.log('links', links)
    return links.filter((l: any) => l.connections?.length > 0);
}

export async function searchForFilms(person: any, page = 1) {
    const result = await request({
        url: 'https://api.themoviedb.org/3/discover/movie',
        method: 'GET',
        headers,
        params: {
            page,
            with_people: person.id
        }
    });
    const films = result?.results || [];
    await Promise.all(films.map((l: any) => fillCredits(l)));
    //console.log('films', films)
    return films.filter((f: any) => f.cast.some((c: any) => c.id === person.id) || f.directors.some((d: any) => d.id === person.id));
}
