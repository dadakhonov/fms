import React, {Component} from "react";
import {FormControl, Navbar} from "react-bootstrap";

import HeaderLinks from "./HeaderLinks.jsx";
import './styles.css'
import dashboardRoutes from "routes/dashboard.jsx";

// import FormInputs from "../FormInputs/FormInputs";

class Header extends Component {
    constructor(props) {
        super(props);
        this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
        this.state = {
            sidebarExists: false
        };
    }

    mobileSidebarToggle(e) {
        if (this.state.sidebarExists === false) {
            this.setState({
                sidebarExists: true
            });
        }
        e.preventDefault();
        document.documentElement.classList.toggle("nav-open");
        var node = document.createElement("div");
        node.id = "bodyClick";
        node.onclick = function () {
            this.parentElement.removeChild(this);
            document.documentElement.classList.toggle("nav-open");
        };
        document.body.appendChild(node);
    }

    getBrand() {
        var name;
        dashboardRoutes.map((prop, key) => {
            if (prop.collapse) {
                prop.views.map((prop, key) => {
                    if (prop.path === this.props.location.pathname) {
                        name = prop.name;
                    }
                    return null;
                });
            } else {
                if (prop.redirect) {
                    if (prop.path === this.props.location.pathname) {
                        name = prop.name;
                    }
                } else {
                    if (prop.path === this.props.location.pathname) {
                        name = prop.name;
                    }
                }
            }
            return null;
        });
        return name;
    }

    render() {
        // console.log(this.props.location.pathname)
        return (
            <Navbar fluid>
                <Navbar.Header>
                    <Navbar.Toggle onClick={this.mobileSidebarToggle}/>
                </Navbar.Header>
                <Navbar.Collapse>
                    <HeaderLinks/>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;