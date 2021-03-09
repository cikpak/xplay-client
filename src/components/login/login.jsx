import React from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import logo from "../../assets/images/logo-green-black.png";
import xLogo from '../../assets/images/xLogo.png'
import textLogo from '../../assets/images/xplay.png'
import { useToasts } from "react-toast-notifications";
import { useForm } from "../../hooks/form.hook";
import { useHistory } from "react-router-dom";
import { NavLink } from 'react-router-dom'
import "../../assets/css/login.css";
import './styles.scss'
import env from '../../env'

const Login = ({ auth }) => {
  const [
    fieldChangeHandler,
    formSubmitHandler,
  ] = useForm();

  const history = useHistory();
  const { addToast } = useToasts();

  const loginHandler = async (event) => {
    event.preventDefault();

    try {
      const url = env.LOGIN_URL_URL;
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
              <p className='text-center mt-2'>Don't have an accout?</p>
              <NavLink exact to='/register' className='ml-2 mt-2'>Register</NavLink>
            </div>
          </Col>
        </Row>
        <img src={xLogo} alt="XPlay logo" id='backgroundLogo'/>
      </Row>
    </Container>
  );
};

export default Login;
