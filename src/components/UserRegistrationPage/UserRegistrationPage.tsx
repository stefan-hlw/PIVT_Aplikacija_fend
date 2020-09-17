import React from 'react';
import { Container, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';

interface UserRegistrationPageState {
    formData: {
        username: string;
        password: string;
    };

    message?: string;
    isRegistrationComplete: boolean;
}

export class UserRegistrationPage extends React.Component {
    state: UserRegistrationPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            isRegistrationComplete: false,
            formData: {
                username: '',
                password: '',
            },
        };
    }

    private formInputChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const newFormData = Object.assign(this.state.formData, {
            [ event.target.id ]: event.target.value,
        });

        const newState = Object.assign(this.state, {
            formData: newFormData,
        });

        this.setState(newState);
    }

    render() {
        return  ( 
        <Container>
             <Col md={ { span: 8, offset: 2 } }>
                <Card>
                  <Card.Body>
                      <Card.Title>
                           <FontAwesomeIcon icon= { faUserPlus } /> User Registration
                        </Card.Title>
                              {
                               (this.state.isRegistrationComplete === false) ?  
                                 this.renderForm() : 
                                 this.renderRegistrationCompleteMessage()
                                  }
                    </Card.Body>
                </Card>
            </Col>
        </Container>
    );
    }

    private renderForm() {
        return (  
        <>
        <Form>
        <Col md={ { span: 6, offset: 3 } }>
            <Form.Group>
            <Form.Label htmlFor="username">Username:</Form.Label>
            <Form.Control type="username" id="username" 
                          value= { this.state.formData.username } 
                          onChange = { event => this.formInputChanged(event as any) } />
            </Form.Group>
            <Form.Group>
            <Form.Label htmlFor="password">Password:</Form.Label>
            <Form.Control type="password" id="password"
                          value= { this.state.formData.password }
                          onChange = { event => this.formInputChanged(event as any) } />
            </Form.Group>
                <Button variant="primary"
                         onClick={ () => this.doRegister() }>
                    Register
                </Button>
             </Col>
        </Form>
    <Alert variant="danger"
            className={ this.state.message ? '' : 'd-none' }>  
        { this.state.message }
    </Alert>
    </>
    );
    }

    private renderRegistrationCompleteMessage() {
        return (
            <p>
                The account has been registered. <br />
                <Link to="/login">Click here</Link> to go to the login page.
            </p>
        );
    }

    private doRegister() {
        const data = {
            username: this.state.formData?.username,    
            password: this.state.formData?.password,    
        };

        api('auth/user/register', 'post', data)
            .then((res: ApiResponse) => {
                console.log(res);

                if(res.status === 'error') {
                    this.setErrorMessage('System error... try again!');
                    return; 
                }
              
                if(res.data.statusCode !== undefined) {
                    this.handleErrors(res.data);
                    return;
                }
                this.registrationComplete();
            })
    }
    private setErrorMessage(message: string) {
        const newState = Object.assign( this.state, {
            message: message,
        });
        this.setState(newState);
    }
    private handleErrors(data: any) {
        let message = '';

        switch (data.statusCode) {
            case -1001: message = 'Error!'; break;
        }

        this.setErrorMessage(message);
    }

    private registrationComplete() {
        const newState = Object.assign(this.state, {
            isRegistrationComplete: true,
        });
        this.setState(newState);
    }
}