import React from 'react'

export default function Info() {
    return (
        <header>
            <div className='card-image'>
                <img src='./images/Reza.png' className='image' />
            </div>
            <div className='card-identity'>
                <h1>Handy Reza Alfanda</h1>
                <h2>Frontend Developer</h2>
                <h3>Indonesia</h3>
            </div>
            <div className='card-button'>
                <a href='https://www.linkedin.com/notifications/'><button className='btn-email'><img src='./images/email.png' className='btn-icon' /> Email </button> </a>
                <a href='https://www.linkedin.com/notifications/'><button className='btn-linkedln'><img src='./images/linkedln.png' className='btn-icon' /> Linkedln</button></a>
            </div>
        </header>
    )
}