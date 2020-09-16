import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import HomePage from './components/HomePage/HomePage';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import { MainMenu, MainMenuItem } from './components/MainMenu/MainMenu';
import { Route, HashRouter } from 'react-router-dom';
import Switch from 'react-bootstrap/esm/Switch';
import ContactPage from './components/ContactPage/ContactPage';
import UserLoginPage from './components/UserLoginPage/UserLoginPage';
import CategoryPage from './components/CategoryPage.tsx/CategoryPage';
import { UserRegistrationPage } from './components/UserRegistrationPage/UserRegistrationPage';
import RoledMainMenu from './components/RoledMainMenu/RoledMainMenu';
import AdministratorDashboard from './components/AdministratorDashboard.tsx/AdministratorDashboard';
import AdministratorDashboardCategory from './components/AdministratorDashboardCategory/AdministratorDashboardCategory';
import AdministratorDashboardIngredient from './components/AdministratorDashboardIngredient/AdministratorDashboardIngredient';


const menuItems = [
  new MainMenuItem("Browse", "/"),
  new MainMenuItem("Register", "/user/register"),
  new MainMenuItem("Log in", "/login"),
]
ReactDOM.render(
  <React.StrictMode>
    <MainMenu items= { menuItems }></MainMenu>
    <HashRouter>
      <Switch>
        <Route exact path="/" component= { HomePage }></Route>
        <Route path="/contact" component= { ContactPage }></Route>
        <Route path="/login" component= { UserLoginPage  }></Route>
        <Route path="/user/register" component= { UserRegistrationPage  }></Route>
        <Route path="/category/:cId" component= { CategoryPage  }></Route>
        <Route exact path="/administrator/dashboard" component={ AdministratorDashboard } />
        <Route path="/administrator/dashboard/category" component={ AdministratorDashboardCategory } />
        <Route path="/administrator/dashboard/ingredient/:cId" component={ AdministratorDashboardIngredient } />
      </Switch>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
