import React from 'react'

import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import succes from '../../assets/images/success.png'
import { NavLink } from 'react-router-dom'

const RegisterSuccess = () => {
    return (
        <Container className='vh-100'>
            <Row className="h-100 justify-content-center align-items-center">
                <Col xs={8} className="shadow" id='registerSuccess'>
                    <img src={succes} alt="success sign" className='d-block mx-auto' />
                    <h3 className='text-center mt-3'>Thank you!</h3>
                    <p className='d-block text-center'>Now you can go to <NavLink exact to='/login'>Login</NavLink></p>
                </Col>
            </Row>
        </Container>
    )
}


export default RegisterSuccess