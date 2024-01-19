import React from 'react';

function SearchBar({ onSearch = (input: string) => {} }) {
    const [input, setInput] = React.useState('');

    async function search() {
        onSearch(input);
        setInput('');
    }

    return (
        <>
            <div style={{ display: 'flex' }}>
                <input className="search" type="search" placeholder="Enter Movie Title, Actor or Director" value={input} onChange={(ev) => setInput(ev.target.value)} />
                <button onClick={search}>Search</button>
            </div>
        </>
    );
}

export default SearchBar;
