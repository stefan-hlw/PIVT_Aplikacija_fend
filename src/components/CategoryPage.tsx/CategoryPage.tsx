import React from 'react';
import { Container, Card, Col, Row, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import CategoryType from '../../types/CategoryType';
import api, { ApiResponse } from '../../api/api';
import RecipeType from '../../types/RecipeType';
import { Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';

interface CategoryPageProperties {
    match: {
        params: {
            cId: number;
        }
    }
}

interface CategoryDto {
    categoryId: number;
    name: string;
}

interface RecipeDto {
    recipeId: number;
    name: string;
    instructions: string;
    recipeImages?: {
        imagePath: string;
    }[]
}

interface CategoryPageState {
    category?: CategoryType;
    subcategories?: CategoryType[];
    recipes?: RecipeType[];
    message: string;
    filters: {
        keywords: string;
        order: "name asc" | "name desc";
        selectedIngredients: {
            ingredientId: number;
            amount: string;
        }[]
    };
    ingredients: {
        ingredientId: number;
        name: string;
        amounts: string[];
    }[];
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);

        this.state= {
            message: '',
            filters: {
                keywords: '',
                order: "name asc",
                selectedIngredients: [],
            },
            ingredients: [],
         };
    }

    private setIngredients(ingredients: any) {
        const newState = Object.assign(this.state, {
            ingredients: ingredients,
        });
        this.setState(newState);
    }

    private setMessage(message: string) {
        const newState = Object.assign(this.state, {
            message: message,
        });
        this.setState(newState);
    }

    private setCategoryData(category: CategoryType) {
        const newState = Object.assign(this.state, {
            category: category,
        });
        this.setState(newState);
    }
    private setSubcategories(subcategories: CategoryType[]) {
        const newState = Object.assign(this.state, {
            subcategories: subcategories,
        });
        this.setState(newState);
    }
    private setRecipes(recipes: RecipeType[]) {
        const newState = Object.assign(this.state, {
            recipes: recipes,
        });
        this.setState(newState);
    }

    render() {
        return(
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon= { faListAlt } /> { this.state.category?.name }
                        </Card.Title>
                        { this.printOptionalMessage() }
                        { this.showSubcategories() }
                        <Row>
                            <Col xs="12" md="4" lg="3">
                                { this.printFilters() }
                            </Col>
                            <Col xs="12" md="8" lg="9">
                                { this.showRecipes() }
                            </Col>
                        </Row>
                        <Card.Text>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }
    private showRecipes() {
        if(this.state.recipes?.length === 0) {
            return (
                <div>No articles found</div>
            );
        }
        return(
            <Row>
                { this.state.recipes?.map(this.singleRecipe) }
            </Row>
        );
    }

    private singleRecipe(recipe: RecipeType) {
        return (
          <Col lg="4" md= "6" sm="6" xs="12">
            <Card className="mb-3">
                <Card.Header>
                    <img alt={ recipe.name }
                         src={ ApiConfig.PHOTO_PATH+ 'small/' + recipe.imageUrl }
                         className="w-100"/>         
                </Card.Header>
              <Card.Body>
                <Card.Title as="p">
                  <strong>{ recipe.name }</strong>
                </Card.Title>
                <Card.Text>
                    { recipe.instructions }
                </Card.Text>
                <Link to={ `/recipe/${ recipe.recipeId }`}
                    className="btn btn-primary btn-block btn-sm">
                      Open recipe 
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )
      }
    
    private setNewFIlter(newFilter:any) {
        this.setState(Object.assign(this.state, {
            filter: newFilter,
        }));
    }
    
    private filterKeywordsChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFIlter(Object.assign(this.state.filters, {
            keywords: event.target.value,
        }));
    }

    private filterOrderChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setNewFIlter(Object.assign(this.state.filters, {
            order: event.target.value,
        }));
    }

    private applyFilters() {
        this.getCategoryData();
    }

    private ingredientFilterChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const ingredientId = Number(event.target.dataset.ingredientId);
        const amount = event.target.value;

        if(event.target.checked) {
            this.addIngredientFilterValue(ingredientId, amount);
        } else {
            this.removeFeatureFilterValue(ingredientId, amount);
        }
    }

    private addIngredientFilterValue(ingredientId: number, amount: string) {
        const newSelectedIngredients = [ ...this.state.filters.selectedIngredients ];
        newSelectedIngredients.push({
            ingredientId: ingredientId,
            amount: amount,
        });

        this.setSelectedIngredients(newSelectedIngredients);
    }

    private removeFeatureFilterValue(ingredientId: number, amount: string) {
        const newSelectedIngredients = this.state.filters.selectedIngredients.filter(record => {
            return !(record.ingredientId === ingredientId && record.amount === amount);
        });

        this.setSelectedIngredients(newSelectedIngredients);
    }
    
    private setSelectedIngredients(newSelectedIngredients: any){
        this.setState(Object.assign(this.state, {
            filters: Object.assign(this.state, {
                selectedIngredients: newSelectedIngredients,
            })
        }));

        console.log(this.state);
    }


    private printFilters() {
        return (
            <>
                <Form.Group>
                    <Form.Label htmlFor="keywords">Keywords:</Form.Label>
                    <Form.Control type="text" id="keywords" 
                    value={ this.state.filters.keywords } 
                    onChange= { (e) => this.filterKeywordsChanged(e as any) }
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control as="select" id="sortOrder" 
                                value={ this.state.filters.order }
                                onChange= { (e) => this.filterOrderChanged(e as any)}>
                        <option value="name asc">Sort by name - ascending</option>
                        <option value="name desc">Sort by name - descending</option>
                    </Form.Control>
                </Form.Group>
                { this.state.ingredients.map(this.printIngredientFilterComponent, this) }

                <Form.Group>
                    <Button variant="primary" block onClick={ () => this.applyFilters() }>
                        <FontAwesomeIcon icon={ faSearch }></FontAwesomeIcon>
                    </Button>
                </Form.Group>
            </>
        )
    }

    private printIngredientFilterComponent(ingredient: { ingredientId: number; name: string; amounts: string[]; }) {
        return (
            <Form.Group>
                <Form.Label><strong>{ ingredient.name } </strong></Form.Label>
                { ingredient.amounts.map(amount => this.printIngredientFilterCheckBox(ingredient, amount), this)}
            </Form.Group>
        );
    }
    private printIngredientFilterCheckBox(ingredient: any, amount: string) {
        return (
                <Form.Check type="checkbox" label={ amount } value={ amount } 
                            data-ingredient-id= { ingredient.ingredientId } 
                            onChange={ (event: any) => this.ingredientFilterChanged(event as any) }/>
        )
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

    private showSubcategories() {
        if (this.state.subcategories?.length === 0) {
            return;
        }

        return (
            <Row>
                { this.state.subcategories?.map(this.singleCategory) }
            </Row>
        )
    }


    private singleCategory(category: CategoryType) {
        return (
          <Col lg="3" md= "4" sm="6" xs="12">
            <Card className="mb-3">
              <Card.Body>
                <Card.Title as="p">
                  { category.name }
                </Card.Title>
                <Link to={ `/category/${ category.categoryId }`}
                    className="btn btn-primary btn-block btn-sm">
                      Open category
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )
      }

    componentDidMount() {
        this.getCategoryData();
    }



    componentDidUpdate(oldProperties: CategoryPageProperties) {
        if (oldProperties.match.params.cId === this.props.match.params.cId) {
            return;
        }
        this.getCategoryData();
    }

    private getCategoryData() {
            api('category/' + this.props.match.params.cId, 'get', {})
            .then( (res: ApiResponse) => {
                if (res.status === 'error') {
                    return this.setMessage('Refresh the page please!')
                }
                const categoryData: CategoryType = {
                    categoryId: res.data.categoryId,
                    name: res.data.name,
                };
                this.setCategoryData(categoryData);

                const subcategories: CategoryType[] =  
                res.data.categories.map((category: CategoryDto) => {
                    return {
                        categoryId: category.categoryId,
                        name: category.name
                    }
                });

                this.setSubcategories(subcategories);
            });
            /*
            const orderParts = this.state.filters.order.split(' ');
            const orderDirection = orderParts[1].toUpperCase();
            */
            const ingredientFilters: any[] = [];

            for (const item of this.state.filters.selectedIngredients){
                let found = false;
                let foundRef = null;

                for(const ingredientFilter of ingredientFilters) {
                    if (ingredientFilter.ingredientId === item.ingredientId) {
                        found = true;
                        foundRef = ingredientFilter;
                        break;
                    }
                }
                if(!found) {
                    ingredientFilters.push({
                        ingredientId: item.ingredientId,
                        amount: [item.amount],
                    });
                } else {
                    foundRef.amount.push(item.amount);
                }
            }

            api('api/recipe/search/', 'post', { 
                categoryId: Number(this.props.match.params.cId),
                keywords: this.state.filters.keywords,
                ingredients: ingredientFilters,
                orderDirection: "ASC"
            })
            .then((res:ApiResponse) => {
                if (res.status === 'error') {
                    return this.setMessage('Refresh the page please!');
                }
                if (res.data.statusCode === 0) {
                    this.setMessage('');
                    this.setRecipes([]);
                    return;
                }

                const recipes: RecipeType[] = 
                res.data.map((recipe: RecipeDto) => {
                    const object: RecipeType = { 
                        recipeId: recipe.recipeId,
                        name: recipe.name,
                        instructions: recipe.instructions,
                        imageUrl: '',
                };

                if (recipe.recipeImages !== undefined && recipe.recipeImages?.length >0) {
                    object.imageUrl = recipe.recipeImages[recipe.recipeImages?.length-1].imagePath
                }
                return object;
            });

            this.setRecipes(recipes);
        });
        this.getIngredients();
    }

    getIngredients() {
        api('api/ingredients/amount/' + this.props.match.params.cId, 'get', {})
        .then((res:ApiResponse) => {
            if (res.status === 'error') {
                return this.setMessage('Refresh the page please!');
            }

            this.setIngredients(res.data.ingredients);
    });
}
}

