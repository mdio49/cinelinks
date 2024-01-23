import React from 'react';
import SearchBar from "../components/SearchBar";
import { fillCredits, getFilmDisplayTitle, getPersonSubtitle, searchForFilm, searchForFilms, searchForLinks, searchForPerson, searchGeneral } from '../tmdb';
import { useScrollPosition } from '../hooks';
import { debounce } from '../utils';
import MovieResult from '../components/MovieResult';
import PersonResult from '../components/PersonResult';

function IndexPage() {
    const [film, setFilm] = React.useState<any>(null);
    const [person, setPerson] = React.useState<any>(null);
    const [links, setLinks] = React.useState<any>([]);
    const [page, setPage] = React.useState(0);

    const [loading, setLoading] = React.useState(false);
    const [searchingLinks, setSearchingLinks] = React.useState(false);
    const [searchingEnd, setSearchingEnd] = React.useState(false);
    const linkSearchLock = React.useRef(false);

    const [autoCompleteResults, setAutoCompleteResults] = React.useState<any[]>([]);
    const [excludedPeople, setExcludedPeople] = React.useState<any[]>([]);

    const scrollY = useScrollPosition();

    React.useEffect(() => {
        if (!film && !person)
            return;
        if (searchingEnd)
            return;
        if (scrollY > document.body.scrollHeight - window.innerHeight - 100) {
            fetchLinks();
        }
    }, [scrollY, film, person, page]);

    const fillAutoComplete = debounce(async (input) => {
        if (!input) {
            setAutoCompleteResults([]);
            return;
        }
        try {
            const results = await searchGeneral(input);
            setAutoCompleteResults([...results].splice(0, 5));
        }
        catch (err) {
            console.log(err);
        }
    });

    async function fetchLinks() {
        if (linkSearchLock.current)
            return;

        linkSearchLock.current = true;
        setSearchingLinks(true);

        try {
            let newLinks: any[] = [];
            if (film) {
                // Filter out excluded people.
                const filteredLinks = links?.filter((l: any) => !l.connections.every((c: any) => excludedPeople.includes(c.id))) || [];
                setLinks(filteredLinks);

                // Fetch new links.
                const fetchedLinks = await searchForLinks(film, page + 1, excludedPeople);
                newLinks = [...filteredLinks, ...fetchedLinks];
            }
            else {
                const fetchedLinks = await searchForFilms(person, page + 1);
                newLinks = [...links, ...fetchedLinks];
            }

            if (newLinks?.length > 0) {
                setLinks(newLinks);
                setPage(page + 1);
            }
            else {
                setSearchingEnd(true);
            }
        }
        catch (err) {
            console.log('Error fetching links', err);
        }
        finally {
            linkSearchLock.current = false;
            setSearchingLinks(false);
        }
    }

    async function onSearch(input: string) {
        setLoading(true);
        reset();
        try {
            const results = await searchGeneral(input);
            const result = results?.[0] || null;
            if (result?.media_type === 'movie') {
                await fillCredits(result);
                setFilm(result);
            }
            else {
                setPerson(result);
            }
        }
        catch (err) {
            console.log('Error fetching film', err);
        }
        finally {
            setLoading(false);
        }
    }

    function reset() {
        setFilm(null);
        setPerson(null);
        setLinks([]);
        setPage(0);
        setExcludedPeople([]);
        setSearchingEnd(false);
    }

    function navigateToFilm(film: any) {
        reset();
        setFilm(film);
    }

    function navigateToPerson(person: any) {
        reset();
        setPerson(person);
    }

    function excludePerson(id: number) {
        const newExcludedPeople = Array.from(new Set([...excludedPeople, id]));
        const filteredLinks = links?.filter((l: any) => !l.connections.every((c: any) => newExcludedPeople.includes(c.id))) || [];
        setExcludedPeople(newExcludedPeople);
        setLinks(filteredLinks);
    }

    const autoCompleteOptions = autoCompleteResults?.map(r => {
        if (r.media_type === 'person') {
            return {
                label: (
                    <>
                        <span>{r.name}</span>&nbsp;<span style={{ fontSize: 'x-small', color: 'gray' }}>{getPersonSubtitle(r)}</span>
                    </>
                ),
                onClick: async () => {
                    //reset();
                    setAutoCompleteResults([]);
                    navigateToPerson(r);
                }
            };
        }
        else {
            return {
                label: (
                    <>
                        <span>{getFilmDisplayTitle(r)}</span>&nbsp;<span style={{ fontSize: 'x-small', color: 'gray' }}>Movie</span>
                    </>
                ),
                onClick: async () => {
                    //reset();
                    setAutoCompleteResults([]);
                    await fillCredits(r);
                    navigateToFilm(r);
                }
            };
        }
    });

    return (
        <div className="page-content">
            <p>Movie Link Search</p>
            <SearchBar onSearch={onSearch} /*onInputChange={fillAutoComplete} autocompleteOptions={autoCompleteOptions}*/ />
            <br />
            {loading ?
                <b>Loading...</b>
            : film ?
                <div style={{ fontSize: 'medium' }}>
                    <MovieResult film={film} />
                    <hr />
                    {links?.length > 0 ?
                        links?.map((m: any) => {
                            return (
                                <div className="movie-result">
                                    <div className="header">
                                        <div className="thumbnail">
                                            <img src={`https://image.tmdb.org/t/p/w500/${m.poster_path}`}></img>
                                        </div>
                                        <div className="content">
                                            <p className="movie-title">
                                                <span className="connection-title" onClick={(ev) => navigateToFilm(m)}>
                                                    {getFilmDisplayTitle(m)}
                                                </span>
                                            </p>
                                            <p className="connections">
                                                {m.connections.map((c: any) => {
                                                    return (
                                                        <span className="connection">
                                                            <span className="delete" onClick={(ev) => excludePerson(c.id)}>
                                                                <i className="material-icons">close</i>
                                                            </span>
                                                            <span className="name" style={{ ...(excludedPeople.includes(c.id) ? { textDecoration: 'line-through' } : {}) }} onClick={(ev) => navigateToPerson(c)}>
                                                                {c.name}
                                                            </span>
                                                        </span>
                                                    );
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    : searchingLinks ?
                        <b>Loading...</b>
                    : null}
                </div>
            : person ?
                <div style={{ fontSize: 'medium' }}>
                    <PersonResult person={person} />
                    <hr />
                    {links?.length > 0 ?
                        links?.map((m: any) => {
                            return (
                                <MovieResult film={m} onClickTitle={() => navigateToFilm(m)} />
                            );
                        })
                    : searchingLinks ?
                        <b>Loading...</b>
                    : null}
                </div>
            :
                <footer>This product uses the TMDB API but is not endorsed or certified by TMDB.</footer>
            }
        </div>
    );
}

export default IndexPage;
