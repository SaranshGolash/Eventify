import React from "react";
import Button from "./Button";

function Header() {
    return(
        <NavBar/>
    );
}

function NavBar() {
    return (
        <div className="navBar">
            <div>
                <span>Eventify</span>
            </div>
            <div>
                <ul>
                <li>Home</li>
                <li>About</li>
                <li>Events</li>
                <li>Support</li>
            </ul>
            </div>
            <div className="navBar-btn">
                <Button style="">Register</Button>
                <Button style="">Login</Button>
            </div>
        </div>
    );
}

export default Header;