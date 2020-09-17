export default interface ApiRecipeDto {
    recipeId: number;
    name: string;
    administratorId: number;
    instructions: string;
    recipeIngredients: {
        recipeIngredientId: number;
        ingredientId: number;
        amount: string;
    }[];
    ingredients: {
        ingredientId: number;
        name: string;
    }[];
    recipeImages: {
        imgId: number;
        imagePath: string;
    }[];

    categoryId?: number;
    category?: {
        name: string;
    }

}