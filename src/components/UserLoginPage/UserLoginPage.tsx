import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Container, Card, Form, Button, Col, Alert } from 'react-bootstrap';
import api, { ApiResponse, saveToken, saveRefreshToken } from '../../api/api'
import { Redirect } from 'react-router-dom';

interface UserLoginPageState {
    username: string;
    password: string;
    errorMessage: string;
    isLoggedIn: boolean;
}

export default class UserLoginPage extends React.Component {
    state: UserLoginPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            username: '',
            password: '',
            errorMessage: '',
            isLoggedIn: false,
        }
    }

    private formInputChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const newState = Object.assign(this.state, {
            [ event.target.id ]: event.target.value,
        });

        this.setState(newState)
    }

    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign( this.state, {
            isLoggedIn: isLoggedIn,
    });
          this.setState(newState);
}


    private setErrorMessage(message: string) {
        const newState = Object.assign( this.state, {
            errorMessage: message,
        });
        this.setState(newState);
    }


    private doLogin() {
        api('auth/user/login', 'post', {
            username: this.state.username,
            password: this.state.password
        })
        .then((res: ApiResponse) => {
            if(res.status === 'error') {
                this.setErrorMessage('System error, try again!');
                return;
            }
            if (res.status === 'ok') {
                if ( res.data.statusCode !==undefined ) {
                    let message = '';

                    switch (res.data.statusCode) {
                        case -3001: message = 'Uknown e-mail!'; break
                        case -3002: message = 'Bad password!'; break
                    }

                    this.setErrorMessage(message);

                    return;
                }
            }

            saveToken(res.data.token);
            saveRefreshToken(res.data.refreshToken);

            this.setLogginState(true);

        });
    }

    render() {
        if (this.state.isLoggedIn === true ) {
            return ( 
                <Redirect to="/"/>
            );
        }
        return(
            <Container>
                <Col md={ { span: 6, offset: 3 } }>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon= { faSignInAlt } />
                        </Card.Title>
                       
                            <Form>
                                <Form.Group>
                                <Form.Label htmlFor="username">Username:</Form.Label>
                                <Form.Control type="username" id="username" 
                                              value= { this.state.username } 
                                              onChange = { event => this.formInputChanged(event as any) } />
                                </Form.Group>
                                <Form.Group>
                                <Form.Label htmlFor="password">Password:</Form.Label>
                                <Form.Control type="password" id="password"
                                              value= { this.state.password }
                                              onChange = { event => this.formInputChanged(event as any) } />
                                </Form.Group>
                                    <Button variant="primary"
                                             onClick={ () => this.doLogin }>
                                        Log in
                                    </Button>
                            </Form>
                        <Alert variant="danger"
                                className={ this.state.errorMessage ? '' : 'd-none' }>  
                            { this.state.errorMessage }
                        </Alert>
                    </Card.Body>
                </Card>
            </Col>
            </Container>
        )
    }
}