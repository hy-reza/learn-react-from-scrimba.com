import React from 'react'

export default function Card(props) {
    console.log(props)
    return (
        <section className='card'>
            <div className='card-image'>
                <img src={props.data.imageUrl} />
            </div>
            <div className="card-description">
                <div className='card-layer1'><h3><img src="../images/location-icon.png" className='location-icon' alt='location-icon' />  {props.data.location} <span><a className='card-maps' href={props.data.googleMapsUrl}>View on Google Maps</a></span></h3></div>
                <div className='card-layer2'><h1 className='card-title'>{props.data.title}</h1></div>
                <div className='card-layer3'><h3 className='card-title'>{props.data.startDate} - {props.data.endDate}</h3></div>
                <div className='card-layer4'><h3 className='card-title'>{props.data.description}</h3></div>
            </div>

        </section>
    )
}