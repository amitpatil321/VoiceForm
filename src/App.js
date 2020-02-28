import { hot } from "react-hot-loader/root";
import React, { Component } from "react";
import { Button, Row, Col, Form, Input, Modal } from "antd";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

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
    formData: []
  };

  componentDidMount() {
    let inputs = {};
    fields.forEach(each => {
      inputs[each.name] = "";
    });
    this.setState({ formData: inputs });
  }

  _proccessCommand = recordedString => {
    console.log("Recorded String :" + recordedString);
    let { activeInput, formData } = this.state;
    // check if command matched with any other custom command
    switch (recordedString) {
      // Appends space at the end of input
      case "space":
        if (activeInput) {
          const currValue = this.refs[activeInput].props.value + " ";
          formData[activeInput] = currValue;
          this.setState({ ...formData });
        }
        break;
      case "clear":
      case "clear input":
      case "clear field":
      case "start again":
        if (activeInput) {
          formData[activeInput] = "";
          this.setState({ ...formData });
        }
        break;
      case "reset":
      case "reset form":
      case "clear form":
        let clearFields = {};
        fields.map(each => {
          clearFields[each.name] = "";
        });
        this.setState({ formData: clearFields });
        break;
      case "go":
      case "submit":
      case "submit form":
        console.log("Submitting form!");
        this._handleSubmit();
        break;
      case "stop recording":
      case "stop listening":
        this._stopRecording();
        break;
      default: {
        // Map command with input triggers if any
        let input = fields.find(each => each.triggers.includes(recordedString));
        if (input) {
          // if any active input is there then fill it with value
          // set input active
          this.refs[input.name].focus();
          this.setState({ activeInput: input.name });
        } else {
          if (activeInput) {
            const existingValue = this.refs[activeInput].props.value;
            formData[activeInput] =
              (existingValue ? existingValue : "") + recordedString;

            this.setState({ ...formData, activeInput: activeInput });
          }
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
    const { formData } = this.state;
    console.log(formData);
  };

  _handleChange = e => {
    const { formData } = this.state;
    this.setState({
      formData: { ...formData, [e.target.name]: e.target.value }
    });
  };

  render() {
    let { isRecording, formData } = this.state;
    return (
      <Row>
        <Col span={24}>
          <Row>
            <Col span={8}></Col>
            <Col span={8} className="form">
              <h2>Registration Form</h2>
              <Row>
                <Col span={2}>
                  {!isRecording ? (
                    <FaMicrophone
                      className="recordingIcon on"
                      onClick={() => this._startRecording()}
                    />
                  ) : (
                    <FaMicrophoneSlash
                      className="recordingIcon off"
                      onClick={() => this._stopRecording()}
                    />
                  )}
                </Col>
                <Col span={22}>
                  <div
                    id="recordingAnimation"
                    className={`${isRecording ? "show" : "hide"}`}
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </Col>
              </Row>
              {/* <br /> */}
              <Form onSubmit={this._handleSubmit} ref={this._refLoginForm}>
                {fields.map((each, index) => {
                  return (
                    <Form.Item key={index}>
                      <Input
                        placeholder={each.placeholder}
                        name={each.name}
                        ref={each.name}
                        onChange={this._handleChange}
                        onFocus={() =>
                          this.setState({ activeInput: each.name })
                        }
                        onBlur={() => this.setState({ activeInput: null })}
                        value={formData[each.name]}
                      />
                    </Form.Item>
                  );
                })}
                <Form.Item className="center">
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            <Col span={8}></Col>
          </Row>
        </Col>
        <Modal
          title="Basic Modal"
          visible={false}
          // onOk={this.handleOk}
          // onCancel={this.handleCancel}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </Row>
    );
  }
}

export default hot(App);
