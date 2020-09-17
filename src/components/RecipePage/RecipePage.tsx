import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import api, { ApiResponse } from '../../api/api';
import { ApiConfig } from '../../config/api.config';
import ApiRecipeDto from '../../dtos/ApiRecipeDto';

interface RecipePageProperties {
    match: {
        params: {
            rId: number;
        }
    }
}

interface IngredientData {
    name: string;
    amount: string;
}


interface RecipePageState {
    isUserLoggedIn: boolean;
    message: string;
    recipe?: ApiRecipeDto;
    ingredients: IngredientData[];
}


export default class RecipePage extends React.Component<RecipePageProperties> {
    state: RecipePageState;
    constructor(props: Readonly<RecipePageProperties>) {
        super(props);

        this.state = {
            isUserLoggedIn: true,
            message: '',
            ingredients: [],
        };
}

private setMessage(message: string) {
    const newState = Object.assign(this.state, {
        message: message,
    });
    this.setState(newState);
}

private printOptionalMessage() {
    if (this.state.message === ''){
        return;
    }
    return (
        <Card.Text>
            { this.state.message }
        </Card.Text>
    );
}

private setLogginState(isLogged: boolean) {
    const newState = Object.assign(this.state, {
        isUserLoggedIn: isLogged,
    });
    this.setState(newState);
}


private setRecipeData(recipeData: ApiRecipeDto | undefined) {
    const newState = Object.assign(this.state, {
        recipe: recipeData,
    });
    this.setState(newState);
}

private setIngredientData(ingredientData: IngredientData[]) {
    const newState = Object.assign(this.state, {
        ingredients: ingredientData,
    });
    this.setState(newState);
}

componentDidMount() {
    this.getRecipeData();
}

componentDidUpdate(oldProperties: RecipePageProperties) {
    if (oldProperties.match.params.rId === this.props.match.params.rId) {
        return;
    }
    this.getRecipeData();
}

getRecipeData() {
    api('/api/recipe/' + this.props.match.params.rId, 'get', {})
    .then( (res: ApiResponse) => {
        if (res.status === 'error') {
            this.setRecipeData(undefined);
            this.setIngredientData([]);
            this.setMessage('The recipe doesn not exist');
            return;
        }

        const data: ApiRecipeDto = res.data;

        this.setMessage('');
        this.setRecipeData(data);

        const ingredients: IngredientData[] = [];

        for(const recipeIngredient of data.recipeIngredients) {
            const amount = recipeIngredient.amount;
            let name= '';

            
          for (const ingredient of data.ingredients) {
                if (ingredient.ingredientId===recipeIngredient.ingredientId) {
                    name = ingredient.name;
                    break;
                }
            } 
            ingredients.push({ name, amount});
        } 

        this.setIngredientData(ingredients);
    });
}

render() {
    return(
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <FontAwesomeIcon icon= { faListAlt } /> { this.state.recipe?.name }
                    </Card.Title>
                    { this.printOptionalMessage() }

                    <Row>
                    <Col xs="10" lg="6">
                                    <Row>
                                        <Col xs="10">
                                            <img alt={ 'Image - ' + this.state.recipe?.recipeImages[0].imgId }
                                                src={ ApiConfig.PHOTO_PATH + 'small/' + this.state.recipe?.recipeImages[0].imagePath}
                                                className="w-100" />
                                        </Col>
                                    </Row>

                        </Col>
                        <Col xs="12" lg="8">
                            <div className="text-right">
                                {this.state.recipe?.instructions}
                            </div>
                            <hr />
                            <b>Ingredients:</b><br />
                            <ul>
                                { this.state.ingredients.map(ingredient => (
                                    <li>
                                    { ingredient.name }: { ingredient.amount }
                                    </li>
                                ), this)}
                            </ul>   
                        </Col>
                       
                        <Col xs="12" lg="8">
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    )}
}