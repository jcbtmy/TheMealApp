import React from 'react';
import Loading from './Loading';

function Button(props){

    return(
        <button type="button" 
                className={props.style} 
                onClick={e => props.clickFunction(props.id)}>
            {props.text}
            {props.image && <img src={props.image}></img>}
        </button>
    );
}

function CategoriesChoices(props){
    
    const options =  props.categories.map( item => <Button 
                                                        key={item.idCategory}
                                                        id={item.strCategory}
                                                        text={item.strCategory}
                                                        clickFunction={props.clickFunction}
                                                        style="btn btn-secondary"
                                                    />  );

    return(
            <div className="btn-group-vertical">
                {options}
            </div>
    );
}


function MealChoices(props){

    const mealoptions = props.meals.map( meal => <Button  key={meal.strMeal} 
                                                          text={meal.strMeal}
                                                          id={meal.idMeal}
                                                          image={meal.strMealThumb}
                                                          clickFunction={props.clickFunction}
                                                          style="btn btn-light"
                                                    />);  
    return(
            <div className="btn-group-vertical">
                {mealoptions}
            </div>
    );
}

async function fetchData(url){
    const res = await fetch(url);
    return (res.status === 200 ) ? res.json() : false;
}

function MealRecipe(props){


    const recipeName = props.recipe.strMeal;
    const recipe_thumb = props.recipe.strMealThumb;
    const recipe_ingredients = [];

    for(let i = 1; i < 21; i++){
        let indexIngredient = "strIngredient" + i;
        let indexMeasure = "strMeasure" + i;
        
        if( !props.recipe[indexIngredient] || props.recipe[indexIngredient] === "" )
            break;

        recipe_ingredients.push(
            <strong key={indexIngredient}>
                    {props.recipe[indexIngredient]} : {props.recipe[indexMeasure]}<br></br>
            </strong>
        );

    }

    return(
        <div className="meal-recipe">
            <h2>{recipeName}</h2>
            <img className="meal-img" src={recipe_thumb}></img>
            
            <div><h3>Ingredients</h3><p>{recipe_ingredients}</p></div>
            <div><h3>Directions</h3><p>{props.recipe.strInstructions}</p></div>
            
        </div>
    );
}


export default class MealApp extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            categories: null,
            choiceMade: false,
            meals: null,
            recipe: null,

        }
        this.cors_url = "https://cors-anywhere.herokuapp.com/https://www.themealdb.com/api/json/v1/1/";
    }


    componentDidMount(){

       const categories =  this.cors_url.concat("categories.php");
       const json_headers = {'Content-Type': 'application/json'};

        fetch(categories, {headers: json_headers})
        .then((res) => res.json())
        .then((data) => {
                this.setState(
                    {
                        isLoaded: true,
                        categories: data.categories
                    }
                );
            }
        )
        .catch((error) => {
            this.setState({error, isLoaded: true});
        });

    }

    categoryClick = (strCategory) => {
    
       this.setState({meals: null, recipe: null, choiceMade: true});

       const url = this.cors_url.concat("filter.php?c=", strCategory);

       fetchData(url).then((data) =>{
           if(data){
               this.setState({meals: data.meals});
           }
       })
       .catch( (error) => {
            this.setState({error})
       });

    }

    mealClick = (mealId) =>{

        this.setState({meals: null});

        const url = this.cors_url.concat("lookup.php?i=", mealId);

        fetchData(url).then((data) =>{
            if(data){
                this.setState({recipe: data.meals});
            }
        })
        .catch( (error) =>{
            this.setState({error})
        });
        
    }

    render(){

        const {error, isLoaded, categories, choiceMade, meals, recipe } = this.state;
        
        return(

            <div className="meal-app">
            
            {!isLoaded && <Loading />}

            {error && error.message}

            {  
                isLoaded 
            && 
                categories 
            && 
                <CategoriesChoices 
                        clickFunction={this.categoryClick}
                        categories={categories}
                />

            }
            {
                choiceMade &&   <div className="meal-display">
                                    { !recipe && !meals && <Loading />}
                                    { meals && <MealChoices meals={meals} clickFunction={this.mealClick} />}
                                    { recipe && <MealRecipe recipe={recipe[0]} />}
                                </div>
            }


            </div>
        );

    }

}