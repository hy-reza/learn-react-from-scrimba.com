import React from "react"

/*
create a form with elements for categories, difficulties and number of questions.
onchange update apiParameters state.

          get cats from https://opentdb.com/api_category.php
         lookup question count for cat https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE
         
        difficulties easy, medium, hard and none for any difficulty.
         
     */

export default function WelcomePane(p){
     const {apiParameters, setApiParameters, newSession} = p
    
     const [categories, setCategories] = React.useState([]);
    
    React.useEffect(()=>{
        retrieveCategories()
        return;   
    },[])
    
    async function retrieveCategories(){
        const localCategories = window.localStorage.getItem('triviaCategories');
        
        if(localCategories){
           saveCategoriesToState( JSON.parse(localCategories) )
           return;
        }
        
        const catPromise = await fetch('https://opentdb.com/api_category.php');
        const {trivia_categories} = await catPromise.json();
        window.localStorage.setItem('triviaCategories', JSON.stringify(trivia_categories))
        saveCategoriesToState(trivia_categories)
        return;
    }

    function saveCategoriesToState(catArray){
        setCategories([{id: null, name: '-- Surprise me --'}, ...catArray,]);
    }
   
    function difficultyToNum(){
        const difficulties = new Map([
            ['easy', 0],
            ['medium', 1],
            ['hard', 2],
            ['mix', 3]        
        ])
        return difficulties.get(apiParameters.difficulty)
    }
    
    function numToDifficulty(num){
        const difficulties = ['easy', 'medium', 'hard', '']
        return difficulties[num];
    }
   
   function setDifficulty(event){
       const {value} = event.target;
       setApiParameters(prevState => {
            return {
                ...prevState,
                difficulty: numToDifficulty(value)
            }
        })
   }
   
   function difficultyFeedback(){
       const difficulty = apiParameters.difficulty
       return difficulty == '' ? 'mix' : difficulty;
   }
   
    //{amount: 10, category: 9, difficulty: 'easy', token: ''}
       
   function handleChange(event) {
        const {name, value, type, checked} = event.target
        setApiParameters(prevState => {
            return {
                ...prevState,
                [name]: type === "checkbox" ? checked : value
            }
        })
    }
    
    function CategorySelect(){
       
           
        function Options (prop) {
            const {source} = prop
            return source.map((arrayElement, index)=>(
             <option key={index} value={arrayElement.id}>{arrayElement.name}</option>
            ))
        } 
        
       
        return (
          <label className="category-select__label" htmlFor="category-select__select">In which category?
            <select name="category" id="category-select__select" value={apiParameters.category} onChange={handleChange}>
               {categories.length && <Options source={categories} />}
            </select> 
            <div className="category-select__arrow">
            </div>
          </label>  
        )
    }
    
    return (
        <main className="welcome-pane">
            <h1>It's Trivia Time!</h1>
            <p>Put on your thinking hat, shove your wisdom teeth back in and slip into your smarty-pants, 'cause this is your shot at trivia history!</p>
            <div className="triviagame-settings">
              <label htmlFor="vol">How many questions?
                    <input type="range" id="amount-slider" defaultValue={apiParameters.amount} name="amount" min="5" max="20" onChange={handleChange}/>
                    <span id="amount--feedback">{apiParameters.amount}</span>
              </label>
               <label htmlFor="vol">How difficult?
                    <input type="range" id="difficulty-slider" name="difficulty" defaultValue={difficultyToNum()} min="0" max="3" onChange={setDifficulty}/>
                    <span id="amount--feedback">{difficultyFeedback()}</span>
                </label>
          
                <CategorySelect/>
      
             </div> 
            <button className="button--big" onClick={newSession}>
                Start Quiz
            </button>
            
                
        </main>
    )
}