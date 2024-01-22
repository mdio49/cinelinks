import React from 'react';
import SearchBar from "../components/SearchBar";
import { searchForFilm, searchForFilms, searchForLinks, searchForPerson } from '../tmdb';
import { useScrollPosition } from '../hooks';

function IndexPage() {
    const [film, setFilm] = React.useState<any>(null);
    const [person, setPerson] = React.useState<any>(null);
    const [links, setLinks] = React.useState<any>([]);
    const [page, setPage] = React.useState(0);

    const [loading, setLoading] = React.useState(false);
    const [searchingLinks, setSearchingLinks] = React.useState(false);
    const [searchingEnd, setSearchingEnd] = React.useState(false);
    const linkSearchLock = React.useRef(false);

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
            const [film, person] = await Promise.all([
                searchForFilm(input),
                searchForPerson(input)
            ]);
            setFilm(film);
            /*if (film) {
                setFilm(film);
            }
            else if (person) {
                setPerson(person);
            }*/
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

    function getFilmDisplayTitle(film: any) {
        return `${film.original_title} (${new Date(film.release_date).getFullYear()})`;
    }

    return (
        <div className="page-content">
            <p>Movie Link Search</p>
            <SearchBar onSearch={onSearch} />
            <br />
            {loading ?
                <b>Loading...</b>
            : film ?
                <div style={{ fontSize: 'medium' }}>
                    {film ? <>
                        <div className="movie-result">
                            <div className="thumbnail">
                                <img src={`https://image.tmdb.org/t/p/w500/${film.poster_path}`}></img> 
                            </div>
                            <div className="content">
                                <p className="movie-title"><b>{getFilmDisplayTitle(film)}</b></p>
                                <p className="movie-description">
                                    Directed By: {film.directors.map((d: any) => d.name).join(', ')}
                                </p>
                                <p className="movie-description" style={{ maxHeight: '50px' }}>
                                    Cast: {film.cast.length > 10 ?
                                        [...film.cast].splice(0, 10).map((c: any) => c.name).join(', ') + '...'
                                    :
                                        film.cast.map((c: any) => c.name).join(', ')
                                    }
                                </p>
                            </div>
                        </div>
                        <hr />
                    </> : <>
                        <b>No Film Found</b>
                    </>}
                    {links?.length > 0 ?
                        links?.map((m: any) => {
                            return (
                                <div className="movie-result">
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
                                                        <span className="name" style={{ ...(excludedPeople.includes(c.id) ? { textDecoration: 'line-through' } : {}) }} /*onClick={(ev) => navigateToPerson(c)}*/>
                                                            {c.name}
                                                        </span>
                                                    </span>
                                                );
                                            })}
                                        </p>
                                    </div>
                                </div>
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
