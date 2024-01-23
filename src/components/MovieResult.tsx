import React from "react";
import { getFilmDisplayTitle } from "../tmdb";
import Scrollable from "./Scrollable";

type MovieResultProps = {
    film: any,
    onClickTitle?: () => void
    onClickPerson?: (p: any) => void
};

export function MovieResult({ film, onClickTitle, onClickPerson }: MovieResultProps) {
    const [showCast, setShowCast] = React.useState(false);

    return (
        <div className="movie-result">
            <div className="header">
                <div className="thumbnail">
                    <img src={`https://image.tmdb.org/t/p/w500/${film.poster_path}`}></img> 
                </div>
                <div className="content">
                    <p className="movie-title">
                        {onClickTitle ?
                            <span className="clickable" onClick={onClickTitle}>{getFilmDisplayTitle(film)}</span>
                        :
                            <b>{getFilmDisplayTitle(film)}</b>
                        }
                    </p>
                    <p className="movie-description">
                        Directed By: {film.directors?.map((d: any) => d.name).join(', ')}
                    </p>
                    <p className="movie-description" style={{ maxHeight: '50px' }}>
                        Cast: {film.cast?.length > 10 ?
                            [...film.cast].splice(0, 10).map((c: any) => c.name).join(', ') + '...'
                        :
                            film.cast?.map((c: any) => c.name).join(', ')
                        }
                    </p>
                    {/*<span onClick={() => setShowCast(!showCast)} style={{ cursor: 'pointer', userSelect: 'none' }}><i className="material-icons">chevron_right</i></span>*/}
                </div>
            </div>
            {/*showCast &&
                <div className="cast">
                    <Scrollable>
                        {film.cast?.map((c: any) => {
                            return (
                                <div className="cast-member">
                                        <div className="thumbnail">
                                            <img src={`https://image.tmdb.org/t/p/w500/${c.profile_path}`}></img> 
                                        </div>
                                        {c.name}
                                </div>
                            )
                        })}
                    </Scrollable>
                </div>
            */}
        </div>
    );
}

export default MovieResult;
