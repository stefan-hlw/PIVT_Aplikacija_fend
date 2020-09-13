import React from 'react';
import { Container, Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
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
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {
    state: CategoryPageState;

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);

        this.state= {
            message: '',
         };
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
                        { this.showRecipes() }
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
            api('api/recipe/search/', 'post', { 
                categoryId: Number(this.props.match.params.cId),
                keywords: "",
                ingredients: [ ],
                
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
    }
}

