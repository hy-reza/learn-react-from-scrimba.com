import React from "react"
import Trivium from "./Trivium"
import Blob1 from "../assets/Blob1.svg"

export default function SessionPane(p){
   
    const {trivia, session, submitAnswers, saveAnswer, newSession} = p;    
    
    const {questions, submitted} = trivia;
     
    //console.log(questions) 
         
    function poseQuestions(){
        try{
        return questions.map(
            (q, idx) => <Trivium key={idx} question={q} saveAnswer={saveAnswer} />                  
        )}
        catch(e){
            console.log(e)
        }
    } 
    
    function showResults(){
        return questions.map(
            (q, idx) => <Trivium key={idx} question={q} results={true}/>                  
        )
    }
    
    if(questions && !submitted){
        return(
            <main>
                {poseQuestions()}
                <button className="button--big" onClick={submitAnswers}>Check Answers</button>  
            </main>
        )
    }
    
    function percentageCorrect(){
        return Math.round(trivia.correct/trivia.questions.length * 100)
    }
    
    if(questions && submitted){
        return(
            <main>
                {showResults()}
                <h2>You have {trivia.correct} {1 == trivia.correct ? 'question' : 'questions'} correct out of {trivia.questions.length}. </h2>
                <p>That's {percentageCorrect()}%!</p>
                <button className="button--big" onClick={newSession}>Play Again!</button> 
            </main>
        )
    }
    if(!questions ){
       return  <main><h1>just a sec</h1></main>
    }
 
}
