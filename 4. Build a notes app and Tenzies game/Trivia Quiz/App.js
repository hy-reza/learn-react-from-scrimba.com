import React from "react"
import Trivium from "./components/Trivium"
import { nanoid } from 'nanoid'
import WelcomePane from "./components/WelcomePane"
import SessionPane from "./components/SessionPane"
import he from "he"

export default function App(){
    
          
      /*
    1. welcome screen with start button. also maybe allow number of questions and difficulty?
    2. round of questions. must select answers. check answers button. 
        function that loops through trivia array and returns a trivium.
    3. results page. false and correct answers marked. play again button. maybe do confetti if full marks.   
    */
    
    const [apiToken, setApiToken] = React.useState(null);
    const [trivia, setTrivia] = React.useState([]);
    const [session, setSession] = React.useState([]);
    const [apiParameters, setApiParameters] = React.useState({amount: 10, category: 9, difficulty: 'easy', token: ''});
    
    let currentSession = session.length > 0 ? session[session.length-1] : null;


   //console.log(currentSession)
   //on init we set the api token for this user.
   //we store it in local so when user returns they won't be getting the same questions each time.
   React.useEffect(()=>{  
      // console.log('apiToken effect triggered')
       
       if(apiToken) return;  
       
       let localToken = window.localStorage.getItem('triviaApiToken');
       if (localToken){
            setApiToken(localToken)
            return; 
       } 
       
       function cleanUpAfterUnMount(){
           window.localStorage.removeItem('triviaApiToken')
           window.localStorage.removeItem('triviaCategories')    
       }
       
       fetchNewToken();
       return cleanUpAfterUnMount;
     },[apiToken])  
    
    //fires on new session
    React.useEffect(()=>{
       // console.log('session effect triggered')
        const usingLocal = false;
  
        //check if we have trivia stored. if so, retrieve that. 
        if ( usingLocal ){
            let localTrivia = getLocalTrivia();
            
            if(localTrivia && isTriviaObjectCurrent(localTrivia) && ! localTrivia.submitted) {
                setTrivia(localTrivia)
                return;
            }
            
            deleteLocalTrivia();
        }
        
        //skip the rest if no apiToken (first render)
        if (!apiToken) return
        //console.log(apiToken)
        
       fetchTrivia(apiToken)
                 
    }, [session])
    
    
  
    function newSession(){
        setSession(sessionState => {
            
            const newSessionState = [...sessionState]
            
            //I'm setting the trivia id before it's being created. This feels wrong.
            newSessionState.push({id: nanoid(), triviaId: nanoid(), correct: 0, archived: false})
            
            return newSessionState;
        })
    }
    
    function archiveCurrentSession(message=''){
        setSession(sessionState => {
            const newSessionState = [...sessionState]
            const last = newSessionState.pop()
            last.archived = true;
            last.message = message;
            newSessionState.push(last);
            return newSessionState;
        })
    }
       
    function saveAnswer(questionId, answerId){          
        
        try{     
            setTrivia(prevState=> {
            //duplicate prevstate to newstate
            const newState = {...prevState}
            //modify questions prop
            newState.questions = prevState.questions.map(q=>{
                if(q.id != questionId)
                    return {...q};
               
                //set answer back to null if it has already been given.
                //ie treat it as a toggle.    
                if(q.given && answerId == q.given){
                      return {...q, given: null}
                }
                const newq = {...q, given: answerId};
                return newq;
            })
            newState.correct = countCorrectAnswers(newState);
            return newState;
        }) 
            
        }catch(e){console.log(e)}
    }
    
    function submitAnswers(){
        const correctAnswers = countCorrectAnswers();
        setTrivia(prevTriviaState => ({...prevTriviaState, correct: correctAnswers, submitted: true}))
    }
        
   function countCorrectAnswers(passedTriviaObject){
        
        const triviaObject = passedTriviaObject || trivia
       
        const answeredQuestions = triviaObject.questions.filter(q=>q.given != null)
       
        const answeredCorrectly = answeredQuestions.filter(
            
            q => {
                //the correct answer has the c prop set to true
                const [correctanswer] = q.answers.filter(answer=> answer.c == true)
                //return whether the given answer is the same as the correct answer
                return correctanswer.id == q.given           
            }
        )  
        
        return answeredCorrectly.length;
   }
   
   function saveCorrectAnswerCount(){
        setTrivia(prevTriviaState => ({...prevTriviaState, correct: countCorrectAnswers()}))
   }    
      
   async function fetchNewToken(){
       let tokenP = fetch('https://opentdb.com/api_token.php?command=request')
       tokenP
        .then(r => r.json())
        .then(obj=> {    
            window.localStorage.setItem('triviaApiToken', obj.token)
            return obj.token;
        })
        .then(token => {
            /* update the token state */
            setApiToken(token); 
            return token;
        } )
        .catch(error => {
            console.log(error)
        })
    }
    
    async function fetchCategoryItemCounts(categoryId){
        const apiUrl = 'https://opentdb.com/api_count.php?category=' + apiUrl;
        let response = await fetch(apiUrl)
        let itemCounts = await response.json();
        return itemCounts;
    }
    
    function constructApiUrl(custom){
        const {amount, category, difficulty, token} = custom || apiParameters;
        return `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&token=${apiToken}`
    }
    
    async function fetchTrivia(token){
       // console.log('fetching new trivia')
             
        async function fetchResponse(url){
              let response = await fetch(url)
              if(! response.ok ) throw new Error('cannot connect to open trivia database')
               let obj = await response.json();
               return obj;
        }
        
       
        let responseObject = await fetchResponse(constructApiUrl())
              
        let attempts = 0;
        const customApiParameters = {...apiParameters}
        while(attempts <= 3 && 0 !== responseObject.response_code ){          
            attempts++;
            const rc = responseObject.response_code;
            switch(rc){
              case 1: //not enough questions
                    archiveCurrentSession("There aren\'t enough questions to meet the criteria you selected. Please try a few different ones.");
              break;  
              case 2: //bad parameter
                    throw new Error('malformed parameters; find the bug!')
              break;
              case 3:
                 fetchNewToken();
              break;
              case 4:
                 if(attempts == 1) {
                    customApiParameters.category = null;
                    responseObject = await fetch(constructApiUrl(customApiParameters)) 
                      break;        
                 }
                if(attempts == 2) {
                    customApiParameters.difficulty = null;
                    responseObject = await fetch(constructApiUrl(customApiParameters)) 
                    break; 
                } 
                if(attempts == 3) {
                    await fetchNewToken(); //this should trigger a rendercycle.
                    break; 
                }                                               
            }           
           
        }
   
        const questions = responseObject.results

        const questionsArray = questions.map(q=>castQuestionObject(q));
       
        const triviaObject = {
            id: currentSession.triviaId, 
            submitted: false, 
            questions: [...questionsArray]
        }   
        setLocalTrivia(triviaObject)
        setTrivia(triviaObject);
        
        return triviaObject;
    }
    
    function isTriviaObjectCurrent(triviaObject){
        if(! triviaObject )
            return false;
            
        return triviaObject.id === currentSession.triviaId;
    }
    
    function isTriviaObjectSubmitted(triviaObject){
        return triviaObject.submitted;
    }
        
    function castQuestionObject(q){
                         
        let answerObjects = []
        
        function shuffle(unshuffled){           
            let shuffled = unshuffled
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            
            return shuffled;   
        }
        
        answerObjects.push({
            id: nanoid(), 
            a: he.decode(q.correct_answer),
            c: true
        })
        
        q.incorrect_answers.forEach(wrongAnswer => answerObjects.push({
                id: nanoid(), 
                a: he.decode(wrongAnswer), 
                c: false
            })
        )                   
        
        if(q.type == "multiple"){
            answerObjects=shuffle(answerObjects)
            }
        if(q.type == "boolean"){
            answerObjects.sort((a, b)=> b.a>a.a ? 1 : -1 )
        }
                    
        //create question object in the form we want.
        return {
            id: nanoid(),
            category: q.category,
            type: q.type,
            difficulty: q.difficulty, 
            question: he.decode(q.question),
            answers: answerObjects,
            given: null
            } 
    } 
    
    /** helper functions dealing with saving and setting trivia to local storage. */
    
    function getLocalTrivia(){
        let localTrivia = window.localStorage.getItem('localTrivia')
        if( localTrivia ){
            localTrivia = JSON.parse(localTrivia);
        }  
        return localTrivia;  
    }
    
    function deleteLocalTrivia(){
        window.localStorage.removeItem('localTrivia')
    }
    
    function setLocalTrivia(triviaObject){
        window.localStorage.setItem('localTrivia', JSON.stringify(triviaObject))
    }
    /*  <pre>{JSON.stringify(session)}</pre> */
        
    return (
        <>
        {currentSession && currentSession.archived == false ?  
            <SessionPane trivia={trivia} session={currentSession} saveAnswer={saveAnswer} newSession={archiveCurrentSession} sessionId={currentSession.id} submitAnswers={submitAnswers}/> 
            : <WelcomePane lastSession={currentSession} newSession={newSession} setApiParameters={setApiParameters} apiParameters={apiParameters}/>  
        }  
       
        </>
    )
}


