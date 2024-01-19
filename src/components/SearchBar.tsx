import React from 'react';

const fetch = require('node-fetch');

function SearchBar() {

    const [input, setInput] = React.useState('');

    async function search() {

        const url = 'https://api.themoviedb.org/3/authentication';
        const options = {method: 'GET', headers: { accept: 'application/json' } };

        fetch(url, options);
        
        setInput('');
    }

    return (
        <div style={{ display: 'flex' }}>
            <input className="search" type="search" placeholder="Enter Movie Title, Actor or Director" value={input} onChange={(ev) => setInput(ev.target.value)} />
            <button onClick={search}>Search</button>
        </div>
    );

}

export default SearchBar;
