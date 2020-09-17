import React from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { faListAlt, faPlus, faEdit, faSave, faListUl, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Redirect } from 'react-router-dom';
import api, { ApiResponse, apiFile } from '../../api/api';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';
import RecipeType from '../../types/RecipeType';
import ApiRecipeDto from '../../dtos/ApiRecipeDto';
import CategoryType from '../../types/CategoryType';
import ApiCategoryDto from '../../dtos/ApiCategoryDto';

interface AdministratorDashboardRecipeState {
    isAdministratorLoggedIn: boolean;
    recipes: RecipeType[];
    categories: CategoryType[];

    addModal: {
        visible: boolean;
        message: string;

        
        name: string;
        categoryId: number;
        administratorId: number;
        instructions: string;
        ingredients: {
            use: number;
            ingredientId: number;
            name: string;
            amount: string
        }[];
    };

    editModal: {
        visible: boolean;
        message: string;

        recipeId?: number;
        name: string;
        categoryId: number;
        instructions: string;
        administratorId: number;
        ingredients: {
            use: number;
            ingredientId: number;
            name: string;
            amount: string
        }[];
    };
}

interface IngredientBaseType {
    ingredientId: number;
    name: string;
}

export default class AdministratorDashboardRecipe extends React.Component {
    state: AdministratorDashboardRecipeState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            isAdministratorLoggedIn: true,
            recipes: [],
            categories: [],

            addModal: {
                visible: false,
                message: '',

                name: '',
                categoryId: 1,
                instructions: '',
                administratorId: 1,
                ingredients: [],
            },

            editModal: {
                visible: false,
                message: '',

                name: '',
                categoryId: 1,
                instructions: '',
                administratorId: 1,
                ingredients: [],
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

    private setAddModalNumberFieldState(fieldName: string, newValue: string) {
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                [ fieldName ]: (newValue === 'null') ? null : Number(newValue),
            }),
        ));
    }

    private setAddModalIngredientUse(ingredientId: number, use: boolean) {
        const addIngredients: {ingredientId:number; use:number; }[] = [...this.state.addModal.ingredients];
        for(const ingredient of addIngredients) {
            if(ingredient.ingredientId === ingredientId) {
                ingredient.use = use ? 1 : 0;
                break;
            }
        }
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                ingredients: addIngredients
            })
            ));
    }

    private setAddModalIngredientAmount(ingredientId: number, amount: string) {
        const addIngredients: {ingredientId:number; amount:string; }[] = [...this.state.addModal.ingredients];
        for(const ingredient of addIngredients) {
            if(ingredient.ingredientId === ingredientId) {
                ingredient.amount = amount;
                break;
            }
        }
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                ingredients: addIngredients
            })
            ));
    }

    private setEditModalIngredientUse(ingredientId: number, use: boolean) {
        const editIngredients: {ingredientId:number; use:number; }[] = [...this.state.editModal.ingredients];
        for(const ingredient of editIngredients) {
            if(ingredient.ingredientId === ingredientId) {
                ingredient.use = use ? 1 : 0;
                break;
            }
        }
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editModal, {
                ingredients: editIngredients
            })
            ));
    }

    private setEditModalIngredientAmount(ingredientId: number, amount: string) {
        const editIngredients: {ingredientId:number; amount:string; }[] = [...this.state.editModal.ingredients];
        for(const ingredient of editIngredients) {
            if(ingredient.ingredientId === ingredientId) {
                ingredient.amount = amount;
                break;
            }
        }
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editModal, {
                ingredients: editIngredients
            })
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
        this.getCategories();
        this.getRecipes();
    }

    private async getIngredientsByCategoryId(categoryId: number): Promise<IngredientBaseType[]> {
        return new Promise(resolve =>{
        api('/api/ingredients/?filter=categoryId||$eq||' + categoryId + '/', 'get', {})
        .then((res: ApiResponse) => {
            if(res.status === "error" || res.status === "login") {
                this.setLogginState(false);
                return resolve([]);
            }
            const ingredients: IngredientBaseType[] = res.data.map((item: any) => ({
                ingredientId: item.ingredientId,
                name: item.name,
            }));
            resolve(ingredients);
         })
    })
    }

    private getCategories() {
        api('/category', 'get', {})
        .then((res: ApiResponse) => {
            if (res.status === 'error' || res.status === 'login') {
                this.setLogginState(false);
                return;
            }

            const data: ApiCategoryDto[] = res.data;

            const categories: CategoryType[] = data.map(category => ({
                categoryId: category.categoryId,
                name: category.name,
                imagePath: category.imagePath,
                parentCategoryId: category.parentCategoryId,
            }));

            this.setStateCategories(categories);
        });
    }

    private setStateCategories(categories: CategoryType[]) {
        this.setState(Object.assign(this.state, {
            categories: categories,
        }));
    }

    private getRecipes() {
        api('/api/recipe/?join=recipeIngredients&join=ingredients&join=recipeImages&join=category', 'get', {})
        .then((res: ApiResponse) => {
            if (res.status === 'error' || res.status === 'login') {
                this.setLogginState(false);
                return;
            }

            this.setStaterecipes(res.data);
        });
    }
    private putRecipesInState(data?: ApiRecipeDto[]) {
        const recipes: RecipeType[] | undefined = data?.map(recipe => {
            return {
                recipeId: recipe.recipeId,
                name: recipe.name,
                instructions: recipe.instructions,
                imageUrl: recipe.recipeImages[0].imagePath,
                recipeIngredients: recipe.recipeIngredients,
                ingredients: recipe.ingredients,
                recipeImages: recipe.recipeImages,
                category: recipe.category,
                categoryId: recipe.categoryId,
            };
        });

        this.setState(Object.assign(this.state, {
            recipes: recipes,
        }))

    }

    private async addModalCategoryChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setAddModalNumberFieldState('categoryId', event.target.value);
        const ingredients = await this.getIngredientsByCategoryId(Number(event.target.value))
        const stateIngredients = ingredients.map(ingredient => ({
            ingredientId: ingredient.ingredientId,
            name: ingredient.name,
            amount: '',
            use: 0,
        }));
        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                ingredients: stateIngredients
            })
            ));
    }    


    private setLogginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isAdministratorLoggedIn: isLoggedIn,
        });

        this.setState(newState);
    }

    private setStaterecipes(recipes: RecipeType[]) {
        this.setState(Object.assign(this.state, {
            recipes: recipes,
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
                            <FontAwesomeIcon icon={ faListAlt } /> recipes
                        </Card.Title>
                        <Table hover bordered size="sm">
                            <thead>
                                <tr>
                                    <th colSpan={ 3 }></th>
                                    <th className="text-center">
                                        <Button variant="primary" size="sm"
                                                onClick={ () => this.showAddModal() }>
                                            <FontAwesomeIcon icon={ faPlus } /> Add
                                        </Button>
                                    </th>
                                </tr>
                                <tr>
                                    <th className="text-right">ID</th>
                                    <th className="text-center">Recipe Name</th>
                                    <th className="text-center">Category</th>
                                    <th className="text-center">Modify</th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.recipes.map(recipe => (
                                    <tr>
                                        <td className="text-right">{ recipe.recipeId }</td>
                                        <td className="text-center">{ recipe.name }</td>
                                        <td className="text-center">{ recipe.category?.name }</td>
                                        <td className="text-center">
                                            <Link to={ "/administrator/dashboard/ingredient/" + recipe.recipeId } 
                                                className="btn btn-sm btn-info mr-3" >
                                                    <FontAwesomeIcon icon= { faListUl } /> Ingredients
                                            </Link>
                                            <Link to={ "/administrator/dashboard/photo/" + recipe.recipeId } 
                                                className="btn btn-sm btn-info mr-3" >
                                                    <FontAwesomeIcon icon= { faImage } /> Images
                                            </Link>
                                        <Button variant="info" size="sm"
                                                onClick={ () => this.showEditModal(recipe) }>
                                            <FontAwesomeIcon icon={ faEdit } /> Edit
                                        </Button>
                                        </td>
                                    </tr>
                                ), this) }
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                <Modal size="lg" centered show={ this.state.addModal.visible }
                                onHide={ () => this.setAddModalVisibleState(false) }
                                onEntered={ () => { 
                                    if (document.getElementById('add-photo')) {
                                        const filePicker: any = document.getElementById('add-photo');
                                        filePicker.value = '';
                                    }} }
                                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Add new Recipe
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
                            <Form.Label htmlFor="add-instructions">Instructions</Form.Label>
                            <Form.Control id="add-instructions" as="textarea"
                                            value={ this.state.addModal.instructions }
                                            onChange={ (e) => this.setAddModalStringFieldState('instructions', e.target.value) } 
                                            rows={ 10 } />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="add-categoryId">Category</Form.Label>
                            <Form.Control id="add-categoryId" as="select"
                                            value={ this.state.addModal.categoryId?.toString() }
                                            onChange={ (e) => this.addModalCategoryChanged(e as any) }>
                                <option value="null">No parent</option>
                                { this.state.categories.map(category => (
                                    <option value={ category.categoryId?.toString() }>
                                        { category.name }
                                    </option>
                                )) }
                            </Form.Control>
                        </Form.Group>
                        <div>
                            { this.state.addModal.ingredients.map(this.printAddModalIngredientInput , this)}
                        </div>

                        <Form.Group>
                            <Form.Label htmlFor="add-photo">Recipe Photo</Form.Label>
                            <Form.File id="add-photo" />
                        </Form.Group>

                        <Form.Group>
                            <Button variant="primary" onClick={ () => this.doAdd() }>
                                <FontAwesomeIcon icon={ faPlus } /> Add Recipe
                            </Button>
                        </Form.Group>

                        { this.state.addModal.message ? (
                            <Alert variant="danger" value={ this.state.addModal.message } />
                        ): '' }
                    </Modal.Body>
                </Modal>

                <Modal size="lg" centered show={ this.state.editModal.visible }
                                onHide={ () => this.setEditModalVisibleState(false) }
                                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Edit Recipe
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
                            <Form.Label htmlFor="edit-instructions">Instructions</Form.Label>
                            <Form.Control id="edit-instructions" as="textarea"
                                            value={ this.state.editModal.instructions }
                                            onChange={ (e) => this.setEditModalStringFieldState('instructions', e.target.value) } 
                                            rows={ 10 } />
                        </Form.Group>
                        <div>
                            {  this.state.editModal.ingredients.map(this.printEditModalIngredientInput , this) }
                        </div>

                        <Form.Group>
                            <Button variant="primary" onClick={ () => this.doEdit() }>
                                <FontAwesomeIcon icon={ faSave } /> Edit Recipe
                            </Button>
                        </Form.Group>

                        { this.state.editModal.message ? (
                            <Alert variant="danger" value={ this.state.editModal.message } />
                        ): '' }
                    </Modal.Body>
                </Modal>
 {/*
                <Modal centered show={ this.state.editModal.visible }
                                onHide={ () => this.setEditModalVisibleState(false) }>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Edit Recipe
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
                            <Button variant="primary" onClick={ () => this.doEdit() }>
                                <FontAwesomeIcon icon={ faSave } /> Edit Recipe
                            </Button>
                        </Form.Group>

                        { this.state.editModal.message ? (
                            <Alert variant="danger" value={ this.state.editModal.message } />
                        ): '' }
                    </Modal.Body>
                </Modal> */}
                    </Container> 
        );
    }

    private printEditModalIngredientInput(ingredient:any) {
        return (
            <Form.Group>
                <Row>
                    <Col xs="4" sm="2">
                        <input type="checkbox" value="1" checked={ ingredient.use === 1}
                        onChange={ (e) => this.setEditModalIngredientUse(ingredient.ingredientId, e.target.checked) }/> 
                    </Col>
                    <Col xs="8" sm="5">
                        {ingredient.name }
                    </Col>
                    <Col xs="12" sm="5">
                        <Form.Control type="text" value={ ingredient.amount }
                        onChange={ (e) => this.setEditModalIngredientAmount(ingredient.ingredientId, e.target.value) } />
                    </Col>
                </Row>
                
            </Form.Group>
        )
    }

    private printAddModalIngredientInput(ingredient:any) {
        return (
            <Form.Group>
                <Row>
                    <Col xs="4" sm="2">
                        <input type="checkbox" value="1" checked={ ingredient.use === 1}
                        onChange={ (e) => this.setAddModalIngredientUse(ingredient.ingredientId, e.target.checked) }/> 
                    </Col>
                    <Col xs="8" sm="5">
                        {ingredient.name }
                    </Col>
                    <Col xs="12" sm="5">
                        <Form.Control type="text" value={ ingredient.amount }
                        onChange={ (e) => this.setAddModalIngredientAmount(ingredient.ingredientId, e.target.value) } />
                    </Col>
                </Row>
                
            </Form.Group>
        )
    }

    private showAddModal() {
        this.setAddModalStringFieldState('message', '');
        this.setAddModalStringFieldState('name', '');
        this.setAddModalStringFieldState('instructions', '');
        this.setAddModalStringFieldState('categoryId', '1');
        

        this.setState(Object.assign(this.state,
            Object.assign(this.state.addModal, {
                ingredients: [],
            })
            ));

        this.setAddModalVisibleState(true);
    }

    private doAdd() {
        const filePicker: any = document.getElementById('add-photo');
        if (filePicker?.files.length === 0) {
            this.setAddModalStringFieldState('message', 'File not chosen!');
            return;
        }
        api('api/recipe/createFull', 'post', {
            categoryId: this.state.addModal.categoryId,
            name: this.state.addModal.name,
            administratorId: 1,
            instructions: this.state.addModal.instructions,
            ingredients: this.state.addModal.ingredients
                .filter(ingredient=> ingredient.use === 1)
                .map(ingredient => ({
                    ingredientId: ingredient.ingredientId,
                    amount: ingredient.amount,
                }))
          })
        .then(async(res: ApiResponse) => {
            if (res.status === 'login') {
                this.setLogginState(false);
                return;
            }

            if (res.status === 'error') {
                this.setAddModalStringFieldState('message', res.data.toString());
                return;
            }

            const recipeId: number = res.data.recipeId;
  
            const file = filePicker.files[0];
            const res1 = await this.uploadRecipePhoto(recipeId, file);

                if(res1.status !== 'ok') {
                this.setAddModalStringFieldState('message', 'File could not be uploaded');
                return;
            }

            this.setAddModalVisibleState(false);
            this.getRecipes();
            
        });
    }

    private async uploadRecipePhoto(recipeId: number, file:File) {
        return await apiFile('/api/recipe/' + recipeId + '/uploadPhoto/', 'photo', file);
    }


    private async showEditModal(recipe: RecipeType) {
        this.setEditModalStringFieldState('message', '');
        this.setEditModalStringFieldState('name', String(recipe.name));
        this.setEditModalStringFieldState('instructions', String(recipe.instructions));
        this.setEditModalNumberFieldState('recipeId', recipe.recipeId ? recipe.recipeId?.toString() : 'null');

        if(!recipe.categoryId) {
            return;
        }
        
        const categoryId: number = recipe.categoryId;
        const allIngredients: any[] = await this.getIngredientsByCategoryId(categoryId);

        for(const apiIngredient of allIngredients) {
            apiIngredient.use = 0;
            apiIngredient.amount = '';
            if(!recipe.recipeIngredients) {
                continue;
            }
            for(const recipeIngredient of recipe.recipeIngredients) {
                if(recipeIngredient.ingredientId === apiIngredient.ingredientId) {
                    apiIngredient.use = 1;
                    apiIngredient.amount = recipeIngredient.amount;
                } 
            }
        }
        this.setState(Object.assign(this.state,
            Object.assign(this.state.editModal, {
                ingredients: allIngredients
            })
            ));

        this.setEditModalVisibleState(true);
    }

    private doEdit() {
        api('api/recipe/' + this.state.editModal.recipeId, 'patch', {
            categoryId: this.state.editModal.categoryId,
            name: this.state.editModal.name,
            administratorId: 1,
            instructions: this.state.editModal.instructions,
            ingredients: this.state.editModal.ingredients
                .filter(ingredient=> ingredient.use === 1)
                .map(ingredient => ({
                    ingredientId: ingredient.ingredientId,
                    amount: ingredient.amount,
                }))
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

            this.getRecipes();
            this.setEditModalVisibleState(false);
        });
    }
}
