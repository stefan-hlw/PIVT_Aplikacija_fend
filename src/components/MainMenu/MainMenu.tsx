import React from 'react';
import { Nav, Container } from 'react-bootstrap';

export class MainMenuItem {
    text: string = '';
    link: string = '#';

    constructor(text: string, link: string) {
        this.text = text;
        this.link = link;
    }
}

interface MainMenuProperties {
    items: MainMenuItem[];
}

export class MainMenu extends React.Component<MainMenuProperties> {
    render() {
        return(
            <Container>
                 <Nav variant="tabs">
                     { this.props.items.map(item => {
                         return (
                            <Nav.Link href = { item.link } >
                                { item.text }
                            </Nav.Link> 
                            );
                         }) 
                     }
                </Nav>
            </Container>
        )
    }
}