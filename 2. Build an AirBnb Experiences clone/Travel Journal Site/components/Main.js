import React from 'react'
import Card from './Card'
import data from '../data'


export default function Main(){
    
    const content = data.map((data, indx) => {
        return <Card data={data} key={indx+1}/>
    })
    return(
        <main>
            {content}
        </main>
    )
}