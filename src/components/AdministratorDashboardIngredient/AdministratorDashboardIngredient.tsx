import React from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { faEdit, faSave, faListUl, faPlus, faBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import IngredientType from '../../types/IngredientType';
import ApiIngredientDto from '../../dtos/ApiIngredientDto';

interface AdministratorDashboardIngredientProperties {
    match: {
        params: {
            cId: number;
        }
    }
}

interface AdministratorDashboardIngredientState {
    isAdministratorLoggedIn: boolean;
    ingredients: IngredientType[];

    addModal: {
        visible: boolean;
        name: string;
        message: string;
    };

    editModal: {
        ingredientId?: number;
        visible: boolean;
        name: string;
        message: string;
    };
}

class AdministratorDashboardIngredient extends React.Component<AdministratorDashboardIngredientProperties> {
    state: AdministratorDashboardIngredientState;

    constructor(props: Readonly<AdministratorDashboardIngredientProperties>) {
        super(props);

        this.state = {
            isAdministratorLoggedIn: true,
            ingredients: [],

            addModal: {
                visible: false,
                name: '',
                message: '',
            },

            editModal: {
                visible: false,
                name: '',
                message: '',
            },
        };
    }

    private setAddModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                visible: newState,
            }),
        ));
    }

    private setAddModalStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                [ fieldName ]: newValue,
            }),
        ));
    }

 
    private setEditModalVisibleState(newState: boolean) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editModal, {
                visible: newState,
            }),
        ));
    }

    private setEditModalStringFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editModal, {
                [ fieldName ]: newValue,
            }),
        ));
    }

    private setEditModalNumberFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editModal, {
                [ fieldName ]: (newValue === 'null') ? null : Number(newValue),
            }),
        ));
    }

    componentDidMount() {
        this.getIngredients();
    }

    componentDidUpdate(oldProps: any) {
        if (this.props.match.params.cId === oldProps.match.params.cId){
            return;
        }
        this.getIngredients();
    }

    private getIngredients() {
        api('/api/ingredients/?filter=categoryId||$eq||' +this.props.match.params.cId , 'get', {})
        .then((res: ApiResponse) => {
            if (res.status === 'error' || res.status === 'login') {
                this.setLogginState(false);
                return;
            }

            this.putIngredientsInState(res.data);
        });
    }

    private putIngredientsInState(data: ApiIngredientDto[]) {
        const ingredients: IngredientType[] = data.map(ingredient => {
            return {
                ingredientId: ingredient.ingredientId,
                name: ingredient.name,
                categoryId: ingredient.categoryId,
            };
        });
        this.setState(Object.assign(this.state, {
            ingredients: ingredients,
        }));
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
                            <FontAwesomeIcon icon={ faListUl } /> Ingredients
                        </Card.Title>
                        <Table hover bordered size="sm">
                            <thead>
                                <tr>
                                    <th colSpan={ 2 }>
                                        <Link to="/administrator/dashboard/category/"
                                            className="btn btn-sm btn-secondary">
                                                <FontAwesomeIcon icon= { faBackward } /> Categories
                                            </Link>
                                    </th>
                                    <th className="text-center">
                                        <Button variant="primary" size="sm"
                                                onClick={ () => this.showAddModal() }>
                                            <FontAwesomeIcon icon={ faPlus } /> Add
                                        </Button>
                                    </th>
                                </tr>
                                <tr>
                                    <th className="text-right">ID</th>
                                    <th>Name</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.ingredients.map(ingredient => (
                                    <tr>
                                        <td className="text-right">{ ingredient.categoryId }</td>
                                        <td>{ ingredient.name }</td>
                                        <td className="text-center">
                                        <Button variant="info" size="sm"
                                                onClick={ () => this.showEditModal(ingredient) }>
                                            <FontAwesomeIcon icon={ faEdit } /> Edit
                                        </Button>
                                        </td>
                                    </tr>
                                ), this) }
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal centered show={ this.state.addModal.visible }
                                onHide={ () => this.setAddModalVisibleState(false) }>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Add new ingredient
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label htmlFor="new-name">Name</Form.Label>
                            <Form.Control type="text" id="new-name"
                                            value={ this.state.addModal.name }
                                            onChange={ (e) => this.setAddModalStringFieldState('name', e.target.value) } />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={ () => this.doAddIngredient() }>
                                <FontAwesomeIcon icon={ faPlus } /> Add new ingredient
                            </Button>
                        </Form.Group>

                        { this.state.addModal.message ? (
                            <Alert variant="danger" value={ this.state.addModal.message } />
                        ): '' }
                    </Modal.Body>
                </Modal>

                <Modal centered show={ this.state.editModal.visible }
                                onHide={ () => this.setEditModalVisibleState(false) }>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Edit ingredient
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label htmlFor="edit-name">Name</Form.Label>
                            <Form.Control type="text" id="edit-name"
                                            value={ this.state.editModal.name }
                                            onChange={ (e) => this.setEditModalStringFieldState('name', e.target.value) } />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" onClick={ () => this.doEditIngredient() }>
                                <FontAwesomeIcon icon={ faSave } /> Edit ingredient
                            </Button>
                        </Form.Group>

                        { this.state.editModal.message ? (
                            <Alert variant="danger" value={ this.state.editModal.message } />
                        ): '' }
                    </Modal.Body>
                </Modal>
            </Container>
        );
    }

    private showAddModal() {
        this.setAddModalStringFieldState('message', '');
        this.setAddModalStringFieldState('name', '');
        this.setAddModalVisibleState(true);
    }

    private doAddIngredient() {
        api('api/ingredients/', 'post', {
            name: this.state.addModal.name,
            categoryId: this.props.match.params.cId,
        })
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                this.setLogginState(false);
                return;
            }

            if (res.status === 'error') {
                this.setAddModalStringFieldState('message', res.data.toString());
                return;
            }
            
            this.setAddModalVisibleState(false);
            this.getIngredients();
        });
    }

    private showEditModal(ingredient: IngredientType) {
        this.setEditModalStringFieldState('name', String(ingredient.name));
        this.setEditModalStringFieldState('ingredientId', ingredient.ingredientId.toString());
        this.setEditModalStringFieldState('message', '');
        this.setEditModalVisibleState(true);
    }

    private doEditIngredient() {
        api('/api/ingredients/' + String(this.state.editModal.ingredientId) + '/', 'patch', {
            name: this.state.editModal.name,
        })
        .then((res: ApiResponse) => {
            if (res.status === 'login') {
                this.setLogginState(false);
                return;
            }

            if (res.status === 'error') {
                this.setEditModalStringFieldState('message', JSON.stringify(res.data));
                return;
            }
            this.setEditModalVisibleState(false);
            this.getIngredients();
        });
    }
}

export default AdministratorDashboardIngredient;
