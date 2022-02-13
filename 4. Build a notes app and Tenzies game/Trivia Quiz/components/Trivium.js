import React from "react"
//import Answer from "./Answer"

export default function Trivium(p){
    console.log(p)
    
    const {question, saveAnswer, results} = p
    const type = question.type;
    
        
    function DisplayAnswers(){

        let {id, answers, given} = question
        
        const answerElements = answers.map((a, key) =>{
            let answerClassName = 'answer' 
            answerClassName += given == a.id ? ' answer--given' : '';     
            return (<button key={key} className={answerClassName} onClick={()=>saveAnswer(id, a.id)} >{a.a}</button>)
        })        
        return answerElements
    }  
   
    function DisplayResults(){
         let {id, answers, given} = question
        
        const answerElements = answers.map((a, key) =>{
            let answerClassName = 'answer'
            answerClassName += given == a.id ? ' answer--given' : ' answer--not-given'; 
            answerClassName += a.c == true ? ' answer--correct' : ' answer--incorrect';
                        
            return (<button key={key} className={answerClassName} disabled={true} >{a.a}</button>)
        })        
        return answerElements
    }
   
    return (
        <div className="question-container">
            <h3>{question.question}</h3>
            <div className="answerwrapper">
                {!results ? <DisplayAnswers/> : <DisplayResults />}
            </div>
        </div>
    )
}