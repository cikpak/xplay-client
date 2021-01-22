import React, { Component } from 'react';
import { connect } from 'react-redux'
import Register from './Register.jsx'
import axios from 'axios'
import env from '../../env'

class RegisterController extends Component {
    constructor(props) {
        super(props)

        this.registerHandler = this.registerHandler.bind(this)
    }

    registerHandler = async (fields) => {
        const response = await axios({
            url: env.REGISTER_URL,
            method: 'POST',
            data: fields,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('response :>> ', response);
    }

    render() {
        return <Register registerHandler={this.registerHandler} />
    }
}


export default RegisterController
