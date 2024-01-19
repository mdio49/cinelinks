import React from 'react';
import SearchBar from "../components/SearchBar";
import { searchForLinks } from '../tmdb';

function IndexPage() {
    const [result, setResult] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    async function onSearch(input: string) {
        setLoading(true);
        setResult(null);
        try {
            const result = await searchForLinks(input);
            setResult(result);
        }
        catch (err) {
            console.log('Error fetching links', err);
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
            : result ?
                <div style={{ fontSize: 'medium' }}>
                    {result.film ? <>
                        <div>
                            <img style={{ maxWidth: '100px' }} src={`https://image.tmdb.org/t/p/w500/${result.film.poster_path}`}></img> <b>{getFilmDisplayTitle(result.film)}</b>
                        </div>
                        <hr />
                    </> : <>
                        <b>No Film Found</b>
                    </>}
                    {result.links.map((m: any) => {
                        return (
                            <div>
                                <img style={{ maxWidth: '100px' }} src={`https://image.tmdb.org/t/p/w500/${m.poster_path}`}></img> {getFilmDisplayTitle(m)}
                            </div>
                        );
                    })}
                </div>
            : null}
        </>
    );
}

export default IndexPage;
