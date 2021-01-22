import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

const Register = ({ registerHandler }) => {
    const [form, setForm] = useState({});

    const fieldChangeHandler = (event) => {
        setForm(
            Object.assign({}, form, {
                [event.target.name]: event.target.value
            })
        )
    }

    return (
        <Container className="h-100">
            <Row className="h-75 justify-content-center align-items-center">
                <Col xs={8} className="shadow" id="loginForm">
                    <h2 className="text-center">Register</h2>
                    <hr />
                    <Form onSubmit={(event) => {event.preventDefault(); registerHandler(form)}}>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Firstname:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstname"
                                        onChange={fieldChangeHandler}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Lastname:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastname"
                                        onChange={fieldChangeHandler}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>


                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Nickname:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nickname"
                                        onChange={fieldChangeHandler}
                                    />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group>
                                    <Form.Label>Birth date:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthdate"
                                        onChange={fieldChangeHandler}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                onChange={fieldChangeHandler}
                            />
                        </Form.Group>

                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        onChange={fieldChangeHandler}
                                    />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group>
                                    <Form.Label>Confirm password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        onChange={fieldChangeHandler}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button variant="outline-dark" type="submit" block>
                            Register
                        </Button>
                        <p className='text-center my-0'>or</p>
                        <NavLink exact to='/login' className='d-block text-center'>Login</NavLink>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Register;
