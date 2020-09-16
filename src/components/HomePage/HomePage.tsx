import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CategoryType from '../../types/CategoryType';
import { Link } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';
import ApiCategoryDto from '../../dtos/ApiCategoryDto';
import RoledMainMenu from '../RoledMainMenu/RoledMainMenu';

interface HomePageState {
  isUserLoggedIn: boolean;
  categories: CategoryType[];
}


class HomePage extends React.Component {
  state: HomePageState;

  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      isUserLoggedIn: true,
      categories: [],
    } 
  }

  componentWillMount() {
    this.getCategories();
  }

  componentWillUpdate() {
    this.getCategories();
  }

  private getCategories() {
    api('category/?filter=parentCategoryId||$isnull', 'get', {})
    .then((res: ApiResponse) => {
        this.putCategoriesInState(res.data);
    });
  }

  private putCategoriesInState(data: ApiCategoryDto[]) {
    const categories: CategoryType[] = data.map(category => {
      return {  
        categoryId: category.categoryId,
        name: category.name,
        items: [],
      };
    });

    const newState = Object.assign(this.state, {
      categories: categories
    });

    this.setState(newState);
  }


  render() {
     return (
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>
              <FontAwesomeIcon icon= {faListAlt} /> Top level categories
            </Card.Title>
              <Row>
               { this.state.categories.map(this.singleCategory) }
              </Row>
          </Card.Body>
        </Card>
      </Container>   
  );
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
}

export default HomePage;
