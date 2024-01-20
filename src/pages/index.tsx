import React from 'react';
import SearchBar from "../components/SearchBar";
import { searchForFilm, searchForLinks } from '../tmdb';
import { useScrollPosition } from '../hooks';

function IndexPage() {
    const [film, setFilm] = React.useState<any>(null);
    const [links, setLinks] = React.useState<any>([]);
    const [page, setPage] = React.useState(0);

    const [loading, setLoading] = React.useState(false);
    const [searchingLinks, setSearchingLinks] = React.useState(false);
    const linkSearchLock = React.useRef(false);

    const scrollY = useScrollPosition();

    React.useEffect(() => {
        if (!film)
            return; 
        if (scrollY > document.body.scrollHeight - window.innerHeight - 100) {
            fetchLinks();
        }
    }, [scrollY, film, page]);

    async function fetchLinks() {
        if (linkSearchLock.current)
            return;
        linkSearchLock.current = true;
        setSearchingLinks(true);
        //console.log('fetching links', page);
        try {
            const newLinks = await searchForLinks(film, page + 1);
            setLinks([...links, ...newLinks]);
            setPage(page + 1);
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
        setFilm(null);
        setLinks([]);
        setPage(0);
        try {
            const film = await searchForFilm(input);
            setFilm(film);
        }
        catch (err) {
            console.log('Error fetching film', err);
        }
        finally {
            setLoading(false);
        }
    }

    function getFilmDisplayTitle(film: any) {
        return `${film.original_title} (${new Date(film.release_date).getFullYear()})`;
    }

    return (
        <>
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
                                        <p className="movie-title">{getFilmDisplayTitle(m)}</p>
                                        <p className="connections">Through: {m.connections.map((c: any) => c.name).join(', ')}</p>
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
        </>
    );
}

export default IndexPage;
