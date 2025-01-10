import React, { useState } from 'react';
function Navbar(props) {
    return (
        <>
        <nav id="barre"> 
            { props.children }
    </nav>
        </>
    )
}
export default Navbar;