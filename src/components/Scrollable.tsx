import React from "react";

export function Scrollable({ scrollAmount = 200, scrollSpeed = 1, ...props }) {
    const [scroll, setScroll] = React.useState(0);

    return (
        <>
            <div style={{ display: 'inline-flex', position: 'relative', right: scroll, transitionDuration: `${scrollSpeed}s` }}>
                {props.children}
            </div>
            <div style={{ position: 'absolute', cursor: 'pointer', userSelect: 'none' }} onClick={() => setScroll(Math.max(scroll - scrollAmount, 0))}>
                <div style={{ position: 'relative', top: '50px' }}>
                    <i style={{ position: 'absolute', color: '#88888840', fontSize: '2em' }} className="material-icons">circle</i>
                    <i style={{ position: 'absolute', color: '#00000088', fontSize: '2em' }} className="material-icons">arrow_back</i>
                </div>                
            </div>
            <div style={{ position: 'absolute', cursor: 'pointer', userSelect: 'none' }} onClick={() => setScroll(scroll + scrollAmount)}>
                <div style={{ position: 'relative', top: '50px', left: '480px' }}>
                    <i style={{ position: 'absolute', color: '#88888840', fontSize: '2em' }} className="material-icons">circle</i>
                    <i style={{ position: 'absolute', color: '#00000088', fontSize: '2em' }} className="material-icons">arrow_forward</i>
                </div>
            </div>
        </>
    );
}

export default Scrollable;
