import React from "react";
import Button from "./Button";

function App() {
    return (
        <div>
            <h1>Eventify</h1>
        </div>
    );
}

function NavBar() {
    return (
        <div className="navBar">
            <ul>
                <li>Home</li>
                <li>About</li>
                <li>Events</li>
                <li>Support</li>
            </ul>
            <div className="navBar-btn">
                <Button style="">Register</Button>
                <Button style="">Login</Button>
            </div>
        </div>
    );
}

export default App;