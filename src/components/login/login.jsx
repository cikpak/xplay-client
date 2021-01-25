import React from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { useForm } from "../../hooks/form.hook";
import { useHistory } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import { NavLink } from 'react-router-dom'
import logo from "../../assets/images/logo-green-black.png";
import "../../assets/css/login.css";
import env from '../../env'

const Login = ({ auth }) => {
  const [
    fieldChangeHandler,
    formSubmitHandler,
    setFormManualy,
    addFieldToForm,
    loading,
    err,
  ] = useForm();
  const history = useHistory();
  const { addToast } = useToasts();

  const loginHandler = async (event) => {
    event.preventDefault();
    const form = event.target;

    try {
      const url = env.LOGIN_URL_URL;
      console.log('url', url)
      const response = await formSubmitHandler({ url });

      try {
        if (response.status === 200) {
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
        } else {
          addToast("Wrong nickname or password!", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (err) {
        console.error(err);
        addToast("Wrong nickname or password!", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="vh-100">
      <Row className="h-100 justify-content-center align-items-center">
        <Col xs={10}>
          <Row className="h-100 d-flex justify-content-center align-items-center">
            <Col xs={6} className="d-flex align-self-center">
              <img
                src={logo}
                alt="XPlay logo"
                className="m-auto d-block"
                id="loginLogo"
              />
            </Col>
            <Col xs={6}  className="shadow" id="loginForm">
              <h2 className="text-center">Please login</h2>
              <hr />
              <Form onSubmit={loginHandler}>
                <Form.Group>
                  <Form.Label>Nickname</Form.Label>
                  <Form.Control
                    type="text"
                    name="nickname"
                    onChange={fieldChangeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    onChange={fieldChangeHandler}
                    required
                  />
                </Form.Group>
                <Button variant="success" type="submit" block>
                  Login
                </Button>
              </Form>
              <div className="d-flex m-auto justify-content-center">
                <p className='text-center'>Don't have an accout?</p>
                <NavLink exact to='/register' className='ml-2'>Register</NavLink>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
