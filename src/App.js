import { hot } from "react-hot-loader/root";
import React, { Component, createRef } from "react";
import { Button, Row, Col, Form, Input, Icon } from "antd";

import { fields } from "./form.json";
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
  state = {
    activeInput: null,
    isRecording: false,
    forceStopped: false,
    form: []
  };

  componentDidMount() {
    let inputs = fields.map(each => {
      return { [each.name]: "" };
    });
    this.setState({ form: inputs }, () => console.log(this.state.form));
  }

  // /* Find custom command */
  // _matchComamnd = command => {
  //   const { words } = this.state;
  //   Object.keys(words).forEach(each => {
  //     if (words[each].includes(command)) {
  //       return true;
  //     }
  //   });
  //   return false;
  // };

  _proccessCommand = recordedString => {
    const { activeInput, form } = this.state;
    // Map command with triggers if any
    let input = fields.find(each => each.triggers.includes(recordedString));
    if (input) {
      // if any active input is there then fill it with value
      if (activeInput) {
        const existingValue = this.refs[input.name].props.value;
        form[activeInput] = form[activeInput] + existingValue;
        this.setState({ ...form, activeInput: activeInput });
      } else {
        console.log(input.name, recordedString);
        // set input active
        this.refs[input.name].focus();
      }
    } else {
      // check if command matched with any other custom command
      switch (recordedString) {
        case "space":
          console.log("space");
          break;
        case "clear":
          console.log("clear");
          break;
        default:
      }
    }

    // console.log(this["reffirst_name"], command);

    // fields.map(each => {
    //   console.log(each);
    //   // console.log(this[each.name].current);
    // });
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

  _handleChange = e => {
    const { form } = this.state;
    this.setState({ form: { ...form, [e.target.name]: e.target.value } });
  };

  render() {
    let { isRecording, form } = this.state;
    return (
      <Row>
        <Col span={2}></Col>
        <Col span={8}>
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
          <Form onSubmit={this._handleSubmit} ref={this._refLoginForm}>
            {fields.map((each, index) => {
              return (
                <Form.Item key={index}>
                  <Input
                    placeholder={each.placeholder}
                    // ref={element => {
                    //   this["ref" + each.name] = element;
                    // }}
                    name={each.name}
                    ref={each.name}
                    onChange={this._handleChange}
                    value={form[each.name]}
                  />
                </Form.Item>
              );
            })}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    );
  }
}

export default hot(App);
