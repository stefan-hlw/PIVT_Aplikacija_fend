import React from 'react';
import { MainMenu, MainMenuItem } from '../MainMenu/MainMenu';

interface RoledMainMenuProperties {
    role: 'administrator' | 'visitor';
}

export default class RoledMainMenu extends React.Component<RoledMainMenuProperties> {
    render() {
        let items: MainMenuItem[] = [];

        switch (this.props.role) {
            case 'administrator': items = this.getAdministratorMenuItems(); break;
            case 'visitor':       items = this.getVisitorMenuItems(); break;
        }

        return <MainMenu items={ items } />

    }

    private getAdministratorMenuItems(): MainMenuItem[] {
        return [
            new MainMenuItem("Log out", "/administrator/logout/"),
            new MainMenuItem("Add recipe", "/administrator/addrecipe/"),
        ];
    }

    private getVisitorMenuItems(): MainMenuItem[] {
        return [
            new MainMenuItem("User register", "/user/register/"),
            new MainMenuItem("User log in", "/login/"),
            new MainMenuItem("home", "/"),
        ];
    }
}
