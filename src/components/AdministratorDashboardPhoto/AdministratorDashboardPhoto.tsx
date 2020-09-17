import React from 'react';
import { Container, Card, Col, Button, Row, Form, Nav} from 'react-bootstrap';
import { faBackspace, faImage, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { apiFile, ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import PhotoType from '../../types/PhotoType';
import { ApiConfig } from '../../config/api.config';

interface AdministratorDashboardPhotoProperties {
    match: {
        params: {
            rId: number;
        }
    }
}

interface AdministratorDashboardPhotoState {
    isAdministratorLoggedIn: boolean;
    photos: PhotoType[];
}
class AdministratorDashboardPhoto extends React.Component<AdministratorDashboardPhotoProperties> {
    state: AdministratorDashboardPhotoState;

    constructor(props: Readonly<AdministratorDashboardPhotoProperties>) {
        super(props);

        this.state = {
            isAdministratorLoggedIn: true,
            photos: [],
            };
        };
    

    componentDidMount() {
        this.getPhotos();
    }

    componentDidUpdate(oldProps: any) {
        if (this.props.match.params.rId === oldProps.match.params.rId){
            return;
        }
        this.getPhotos();
    }

    private getPhotos() {
        api('/api/recipe/' +this.props.match.params.rId  , 'get', {})
        .then((res: ApiResponse) => {
            if (res.status === 'error' || res.status === 'login') {
                this.setLogginState(false);
                return;
            }
            this.setState(Object.assign(this.state, {
                photos: res.data.recipeImages,
            }));
        });
    }

    private setLogginState(isLoggedIn: boolean) {
        this.setState(Object.assign(this.state, {
            isAdministratorLoggedIn: isLoggedIn,
        }));
    }

    render() {
        if (this.state.isAdministratorLoggedIn === false) {
            return (
                <Redirect to="/login" />
            );
        }

        return (
            <Container>
                <RoledMainMenu role="administrator" />
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={ faImage } /> Images
                        </Card.Title>
                        <Nav className="mb-2">
                            <Nav.Item>
                                <Link to="/administrator/dashboard/recipe/" className="btn btn-sm btn-info">
                                    <FontAwesomeIcon icon= { faBackspace } /> Back
                                </Link>
                            </Nav.Item>
                        </Nav>
                        <Row>
                            { this.state.photos.map(this.printSinglePhoto, this) }
                        </Row>
                        <Form className="mt-5">
                        <Form.Group>
                            <p>
                                <strong>Add photo</strong>
                            </p>
                            <Form.Label htmlFor="add-photo">New Photo</Form.Label>
                            <Form.File id="add-photo" />
                        </Form.Group>
                       <Form.Group>
                          <Button variant="primary"
                              onClick={ () => this.doUpload() }>
                                <FontAwesomeIcon icon={ faPlus } /> Upload 
                            </Button>
                        </Form.Group>  
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    private printSinglePhoto(photo: PhotoType) {
        return(
            <Col xs="10" sm="5" md="4" lg="3">
                <Card>
                    <Card.Body>
                        <img alt={ "Photo " + photo.imgId } 
                        src ={ ApiConfig.PHOTO_PATH + 'small/' + photo.imagePath} 
                        className="w-100"/>
                    </Card.Body>
                    <Card.Footer>
                        { this.state.photos.length > 1 ? (
                            <Button variant="danger" block
                                onClick={ () => this.deletePhoto(photo.imgId)}>
                                <FontAwesomeIcon icon ={ faBackspace }/> Delete Img  
                            </Button>
                        ) : '' }
                    </Card.Footer>
                </Card>
            </Col>
        );
    }

   private async doUpload() {
        const filePicker: any = document.getElementById('add-photo');
        if(filePicker?.files.length === 0 ) {
            return;
        }
        const file = filePicker.files[0];
        await this.uploadRecipePhoto(this.props.match.params.rId, file);
        filePicker.value = '';

        this.getPhotos();
    } 
    private async uploadRecipePhoto(recipeId: number, file: File) {
        return await apiFile('/api/recipe/' + recipeId + '/uploadPhoto/', 'photo', file);
    }


    private deletePhoto(imgId: number) {
        api('api/recipe/' + this.props.match.params.rId + '/deletePhoto/' + imgId + '/', 'delete', {})
        .then((res: ApiResponse) => {
            if (res.status === 'error' || res.status === 'login') {
                this.setLogginState(false);
                return;
            }
        })
    }
   
} 
export default AdministratorDashboardPhoto;
