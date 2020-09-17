export default class RecipeType {
    recipeId?: number;
    name?: string;
    instructions?: string;
    imageUrl?: string;

    recipeImages?: {
        imgId: number;
        imagePath: string;
    }[];
    recipeIngredients?: {
        recipeIngredientId: number;
        ingredientId: number;
        amount: string;
    }[];
    ingredients?: {
        ingredientId: number;
        name: string;
    }[];
    categoryId?: number;
    category?: {
        name: string;
    };
}