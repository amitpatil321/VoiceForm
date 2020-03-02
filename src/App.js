import { hot } from "react-hot-loader/root";
import React, { Component } from "react";
import { Button, Row, Col, Form, Input, Modal, Divider } from "antd";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

import { fields } from "./form.json";
import "./App.css";
import "antd/dist/antd.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recorder = new SpeechRecognition();

recorder.continous = true;
recorder.interimResults = true;
recorder.lang = "en-US";

/* TODO :
1) Add action to clear form - DONE
2) Clear perticular field only - DONE
3) Append new string with existing input text - DONE
4) Add undo feature - DONE
5) keybord delete button isnt working
 */

class App extends Component {
  state = {
    activeInput: null,
    isRecording: false,
    forceStopped: false,
    formData: [],
    inputHistory: [],
    showModal: false
  };

  componentDidMount() {
    let inputs = {};
    let inputHistory = {};
    fields.forEach(each => {
      inputs[each.name] = "";
      inputHistory[each.name] = "";
    });
    this.setState({ formData: inputs, inputHistory }, () =>
      console.log(this.state)
    );
  }

  _proccessCommand = recordedString => {
    console.log("Recorded String :" + recordedString);
    let { activeInput, formData, inputHistory } = this.state;
    // check if command matched with any other custom command
    switch (recordedString) {
      // Appends space at the end of input
      case "space":
        if (activeInput) {
          const currValue = this.refs[activeInput].props.value + " ";
          formData[activeInput] = currValue;
          this.setState(prevState => ({
            ...formData,
            activeInput: activeInput,
            inputHistory: {
              ...prevState.inputHistory,
              [activeInput]: [...prevState.inputHistory[activeInput], " "]
            }
          }));
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
        fields.forEach(each => {
          clearFields[each.name] = "";
        });
        this.setState({ formData: clearFields });
        break;
      case "undo":
        // Remove last string that was added to active input
        if (activeInput) {
          let currText = formData[activeInput];
          if (this.refs[activeInput].props.value) {
            currText = currText.replace(
              inputHistory[activeInput][inputHistory[activeInput].length - 1],
              ""
            );
            formData[activeInput] = currText;
            // set updated input
            this.setState({ ...formData });
            // remove that word from history as well.
            inputHistory[activeInput].pop();
          }
        }
        break;
      case "go":
      case "submit":
      case "submit form":
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
              (existingValue ? existingValue : "") + recordedString + " ";
            // console.log(this.state);
            this.setState(prevState => ({
              ...formData,
              activeInput: activeInput,
              inputHistory: {
                ...prevState.inputHistory,
                [activeInput]: [
                  ...prevState.inputHistory[activeInput],
                  recordedString
                ]
              }
            }));
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
    this.setState({ showModal: true });
  };

  _handleChange = e => {
    const { formData } = this.state;
    this.setState({
      formData: { ...formData, [e.target.name]: e.target.value }
    });
  };

  render() {
    let { isRecording, formData, showModal } = this.state;
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
              <Form ref={this._refLoginForm}>
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
                        autoComplete="off"
                      />
                    </Form.Item>
                  );
                })}
                <Form.Item className="center">
                  <Button type="primary" onClick={this._handleSubmit}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            <Col span={8}>Debug mode2</Col>
          </Row>
        </Col>
        <Modal
          title="User Details"
          visible={showModal}
          onOk={() => this.setState({ showModal: false })}
          onCancel={() => this.setState({ showModal: false })}
        >
          <table>
            <tbody>
              {formData &&
                showModal &&
                fields.map(each => {
                  return (
                    <tr key={each.name}>
                      <td width="50%">{each.placeholder}</td>
                      <td>
                        : {formData[each.name] ? formData[each.name] : "-"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Modal>
      </Row>
    );
  }
}

export default hot(App);
