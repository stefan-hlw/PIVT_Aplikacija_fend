import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { Container, Card } from 'react-bootstrap';

export default class ContactPage extends React.Component {
    render() {
        return(
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon= {faPhone} />
                        </Card.Title>
                        <Card.Text>
                            Contact details
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        )
    }
}