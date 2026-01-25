import React from "react";

function Button({childeren, style}) {
    return (
        <button style={style}>{childeren}</button>
    );
}

export default Button;