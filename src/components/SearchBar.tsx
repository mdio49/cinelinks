import React from 'react';

type AutocompleteOption = {
    label: JSX.Element | string,
    onClick?: () => void
}

function SearchBar({ autocompleteOptions = new Array<AutocompleteOption>(), onInputChange = (input: string) => {}, onSearch = (input: string) => {} }) {
    const [input, setInput] = React.useState('');

    React.useEffect(() => {
        onInputChange(input);
    }, [input]);

    async function search() {
        onSearch(input);
        setInput('');
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input className="search" type="search" placeholder="Enter Movie Title, Actor or Director" value={input} onChange={(ev) => setInput(ev.target.value)} onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                        search();
                    }
                }} />
                <button onClick={search}>Search</button>
            </div>
            {autocompleteOptions?.length > 0 &&
                <div className="search-autocomplete">
                    {autocompleteOptions.map(o => {
                        return (
                            <div className="autocomplete-option" onClick={() => {
                                if (o.onClick) {
                                    setInput('');
                                    o.onClick();
                                }
                            }}>
                                {o.label}
                            </div>
                        )
                    })}
                </div>
            }
        </>
    );
}

export default SearchBar;
