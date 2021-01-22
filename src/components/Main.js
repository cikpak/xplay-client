import React, { Component, Fragment } from "react";
import axios from "axios";

class Main extends Component {
  constructor(props) {
    super(props);
    console.log("props.state2", props.state);
  }

  handleWindowUnmount = async () => {
    const body = {
      networkId: "aa",
      xboxId: "aa",
      xboxIp: "aa",
      raspberryZerotierIp: "aa",
      raspberryLocalIp: "aa",
      zerotierIp: "aa",
    };

    const response = await axios({
      url: "http://localhost:8000/api/user/client",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.props.tokens.token}`
      },
      data: body,
    });

    console.log("response123", response);
  };

  componentDidMount(){
    window.addEventListener('beforeunload', this.handleWindowUnmount, false)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleWindowUnmount, false);
  }

  render() {
    return <Fragment>{this.props.children}</Fragment>;
  }
}

export default Main;
