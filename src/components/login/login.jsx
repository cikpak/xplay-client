import React from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import logo from "../../assets/images/logo-green-black.png";
import xLogo from '../../assets/images/xLogo.png'
import textLogo from '../../assets/images/xplay.png'
import { useToasts } from "react-toast-notifications";
import { useForm } from "../../hooks/form.hook";
import { useHistory } from "react-router-dom";
import { NavLink } from 'react-router-dom'
import { Formik } from 'formik'
import axios from 'axios'
import "../../assets/css/login.css";
import './styles.scss'
import env from '../../env'

const Login = ({ auth }) => {
  const history = useHistory();
  const { addToast } = useToasts();

  const loginSubmitHandler = (values) => {
    axios({
      url: env.LOGIN_URL_URL,
      method: 'POST',
      data: values,
    })
      .then(async (response) => {
        const { token, refreshToken, expiresIn, user } = response.data;
        const { clientConfig, ...userData } = user;

        await auth.login({
          token,
          refreshToken,
          expiresIn,
          userData,
          userConfig: clientConfig
        });

        history.push("/main");
      })
      .catch(err => {
        const response = err.response

        if (response) {
          const { data } = response

          switch (response.status) {
            case 401: {
              addToast(data.message.msg, { appearance: 'error', autoDismiss: true })
            }
              break;
            case 500: {
              addToast(data.message.msg, { appearance: 'error', autoDismiss: true })
            }
              break;
            case 409: {
              if (data.errors) {
                data.errors.map(error => addToast(error, { appearance: 'error', autoDismiss: true }))
              } else {
                addToast('Invalid credentials!', { appearance: 'error', autoDismiss: true })
              }
            }
              break;
            default: {
              addToast('Login error!', { appearance: 'error', autoDismiss: true })
            }
              break;
          }
        } else {
          if (err.message === 'Network Error') {
            addToast('Server is unavailable!', { appearance: 'error', autoDismiss: true })
          }
        }
      })
  }

  return (
    <Container className="vh-100" style={{ backgroundColor: '#EAECEA' }}>
      <Row className="h-100 justify-content-center align-items-center img-container">
        <Row className="h-100 justify-content-center align-items-center">
          <Col xs={12} className="shadow" id="loginForm">
            <img
              src={textLogo}
              alt="XPlay logo"
              className="m-auto d-block mb-5"
              id="loginLogo"
            />
            <h4 className="text-center">Please login</h4>
            <hr />
            <Formik
              initialValues={{ nickname: '', password: '' }}
              onSubmit={loginSubmitHandler}
            >
              {({ values, handleChange, handleSubmit }) => {
                return (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group>
                      <Form.Label>Nickname</Form.Label>
                      <Form.Control
                        type="text"
                        name="nickname"
                        onChange={handleChange}
                        value={values.nickname}
                        required
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        onChange={handleChange}
                        value={values.password}
                        required
                      />
                    </Form.Group>
                    <Button variant="success" type="submit" block>
                      Login
                </Button>
                  </Form>
                )
              }}
            </Formik>
            <div className="d-flex m-auto justify-content-center">
              <p className='text-center mt-2'>Don't have an accout?</p>
              <NavLink exact to='/register' className='ml-2 mt-2'>Register</NavLink>
            </div>
          </Col>
        </Row>
        <img src={xLogo} alt="XPlay logo" id='backgroundLogo' />
      </Row>
    </Container>
  );
};

export default Login;
