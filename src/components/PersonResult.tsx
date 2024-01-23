import React from "react";
import { getFilmDisplayTitle, getPersonSubtitle } from "../tmdb";

type PersonResultProps = {
    person: any
};

export function PersonResult({ person }: PersonResultProps) {
    return (
        <div className="movie-result">
            <div className="header">
                <div className="thumbnail">
                    <img src={`https://image.tmdb.org/t/p/w500/${person.profile_path}`}></img>
                </div>
                <div className="content">
                    <p className="movie-title">
                        <b>{person.name}</b>
                        <br />
                        <span style={{ fontSize: 'small', color: 'gray' }}>
                            <i>{getPersonSubtitle(person)}</i>
                        </span>
                    </p>
                    {person.known_for?.length > 0 &&
                        <p className="movie-description" style={{ maxHeight: '50px' }}>
                            Known For: {person.known_for.map((f: any) => getFilmDisplayTitle(f)).join(', ')}
                        </p>
                    }
                </div>
            </div>
        </div>
    );
}

export default PersonResult;
