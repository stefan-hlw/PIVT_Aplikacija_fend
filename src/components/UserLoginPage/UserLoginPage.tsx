import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Container, Card } from 'react-bootstrap';

export default class UserLoginPage extends React.Component {
    render() {
        return(
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon= { faSignInAlt } />
                        </Card.Title>
                        <Card.Text>
                            Form will be shown here 
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        )
    }
}