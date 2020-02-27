import { hot } from "react-hot-loader/root";
import React, { Component, createRef } from "react";
import { Button, Row, Col, Form, Input, Icon } from "antd";
import "antd/dist/antd.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recorder = new SpeechRecognition();

recorder.continous = true;
recorder.interimResults = true;
recorder.lang = "en-US";

/* TODO :
1) Add action to clear form
2) Clear perticular field only
3) Append new string with existing input text
4) Add undo feature
5) keybord delete button isnt working
 */

class App extends Component {
  constructor(props) {
    super(props);
    this._refLoginForm = createRef();
    this._refUsername = createRef();
    this._refPassword = createRef();
    this._refSubmit = createRef();
  }
  state = {
    words: {
      username: ["username", "login name", "name"],
      password: ["password", "pass"],
      submit: ["go", "submit", "submit form"]
    },
    form: {
      username: "",
      password: ""
    },
    activeInput: null,
    isRecording: false,
    forceStopped: false
  };

  /* Find custom command */
  _matchComamnd = command => {
    const { words } = this.state;
    Object.keys(words).forEach(each => {
      if (words[each].includes(command)) {
        return true;
      }
    });
    return false;
  };

  _proccessCommand = command => {
    let { words, activeInput, form } = this.state;
    // store current state in history for undoing any action
    switch (command) {
      // Append space in input
      case "space":
        form[activeInput] = form[activeInput] + " ";
        this.setState({ ...form });
        break;
      // clear active input
      case "clear":
        form[activeInput] = "";
        this.setState({ ...form });
        break;
      default: {
        console.log("1", this._matchComamnd(command));
        // If some input is active and command isnt matching with any other custom command then
        if (activeInput && this._matchComamnd(command) === false) {
          console.log("2");
          const { form } = this.state;
          form[activeInput] = form[activeInput] + command;
          this.setState({ ...form });
        } else {
          Object.keys(words).forEach(each => {
            console.log(words, command);
            if (words[each].includes(command)) {
              const capitalize = each.charAt(0).toUpperCase() + each.slice(1);
              // check if its a input or submit ?
              if (each === "submit") {
                // remove focus from input
                if (activeInput) {
                  const capitalizedInput =
                    activeInput.charAt(0).toUpperCase() + activeInput.slice(1);
                  this[`_ref${capitalizedInput}`].current.blur();
                }
                this.handleSubmit();
              } else {
                this[`_ref${capitalize}`].current.focus();
                this.setState({ activeInput: each });
              }
            }
          });
        }
      }
    }
  };

  _startRecording = () => {
    recorder.start();
    recorder.onstart = () =>
      this.setState({ isRecording: true, forceStopped: false });
    recorder.onresult = event => {
      if (event.results[0].isFinal) {
        let string = event.results[0][0].transcript;
        if (string.length) {
          this._proccessCommand(string);
        }
      }
    };
    // Start listening again on end
    recorder.onend = () => {
      let { forceStopped } = this.state;
      if (!forceStopped) recorder.start();
      this.setState({ isRecording: false });
    };
  };

  _stopRecording = () => {
    this.setState(
      {
        activeInput: null,
        isRecording: false,
        forceStopped: true
      },
      () => recorder.stop()
    );
  };

  // Handle submit button
  _handleSubmit = e => {
    const { form } = this.state;
    console.log(form);
  };

  render() {
    let { isRecording, form } = this.state;
    return (
      <Row>
        <Col span={2}></Col>
        <Col span={22}>
          <br />
          <br />
          <br />
          {!isRecording ? (
            <Button
              type="default"
              icon="audio"
              size={"small"}
              onClick={() => this._startRecording()}
            >
              Start
            </Button>
          ) : (
            <Button
              type="danger"
              icon="stop"
              size={"small"}
              onClick={() => this._stopRecording()}
            >
              Stop
            </Button>
          )}
          <Form
            layout="inline"
            onSubmit={this._handleSubmit}
            ref={this._refLoginForm}
          >
            <Form.Item>
              <Input
                placeholder="Username"
                ref={this._refUsername}
                value={form.username}
              />
            </Form.Item>
            <Form.Item>
              <Input
                placeholder="Password"
                ref={this._refPassword}
                value={form.password}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    );
  }
}

export default hot(App);
