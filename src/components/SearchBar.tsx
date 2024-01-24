import React from 'react';

type AutocompleteOption = {
    label: JSX.Element | string,
    onClick?: () => void
};

type SearchBarProps = {
    autocompleteOptions: AutocompleteOption[],
    showSearchButton?: boolean,
    onInputChange: (input: string) => void,
    onSearch: (input: string) => void
};

function SearchBar({ autocompleteOptions = [], showSearchButton = false, onInputChange = () => {}, onSearch = () => {} }: SearchBarProps) {
    const [input, setInput] = React.useState('');
    const [selectedOption, setSelectedOption] = React.useState(-1);
    const [lostFocus, setLostFocus] = React.useState(false);

    //const container = React.useRef<any>();

    /*React.useEffect(() => {
        const handler = (ev: Event) => {
            if (!container.current.contains(ev.target)) {
                setLostFocus(true);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);*/

    React.useEffect(() => {
        onInputChange(input);
    }, [input]);

    React.useEffect(() => {
        setSelectedOption(0);
    }, [autocompleteOptions]);

    async function search() {
        const autocomplete = autocompleteOptions[selectedOption];
        if (autocomplete?.onClick) {
            autocomplete.onClick();
        }
        else {
            onSearch(input);
        }
        setInput('');
    }

    return (
        <div tabIndex={100} className="search" onFocus={() => setLostFocus(false)} /*ref={container}*/ onBlur={(e) => {
            const currentTarget = e.currentTarget;
    
            // Give browser time to focus the next element
            requestAnimationFrame(() => {
                // Check if the new focused element is a child of the original container
                if (!currentTarget.contains(document.activeElement)) {
                    setLostFocus(true);
                }
            })
        }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input className="search" type="search" placeholder="Enter Movie Title, Actor or Director" value={input} onChange={(ev) => setInput(ev.target.value)} onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                        search();
                    }
                    else if (ev.key === "ArrowDown") {
                        ev.preventDefault();
                        setSelectedOption(Math.min(selectedOption + 1, (autocompleteOptions?.length || 0) - 1));
                    }
                    else if (ev.key === "ArrowUp") {
                        ev.preventDefault();
                        setSelectedOption(Math.max(selectedOption - 1, 0));
                    }
                }} />
                {showSearchButton &&
                    <button onClick={search}>Search</button>
                }
            </div>
            {(autocompleteOptions?.length > 0 && !lostFocus) &&
                <div className="search-autocomplete" onMouseLeave={() => setSelectedOption(-1)}>
                    {autocompleteOptions.map((o, i) => {
                        return (
                            <div className={`autocomplete-option ${selectedOption === i ? 'selected' : ''}`} onClick={() => {
                                if (o.onClick) {
                                    setInput('');
                                    o.onClick();
                                }
                            }} onMouseMove={() => setSelectedOption(i)}>
                                {o.label}
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    );
}

export default SearchBar;
