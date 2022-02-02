import React from 'react'
import Info from './components/Info'
import About from './components/About'
import Footer from './components/footer'

export default function App() {
    return (
        <div className='card'>
            <Info/>
            <About/>
            <Footer/>
        </div>
    )
}