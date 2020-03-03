import { hot } from "react-hot-loader/root";
import React, { Component } from "react";
import { Row, Col, Form, Modal, Switch, Divider } from "antd";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

import { fields } from "./form.json";
import MakeForm from "./MakeForm/MakeFormView";
import "./App.css";
import "antd/dist/antd.css";
import FormDetailsModal from "./FormDetailsModal/FormDetailsModal.js";

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
    recordedString: null,
    activeInput: null,
    isRecording: false,
    forceStopped: false,
    formData: [],
    inputHistory: [],
    showModal: false,
    debugMode: true
  };

  componentDidMount() {
    let inputs = {};
    let inputHistory = {};

    // Initialize inputs array with blank values
    fields.forEach(each => {
      inputs[each.name] = "";
      inputHistory[each.name] = "";
    });

    this.refs = fields.map(each => (each.ref = React.createRef()));

    this.setState({ formData: inputs, inputHistory });
  }

  _proccessCommand = recordedString => {
    let { activeInput, formData, inputHistory } = this.state;
    // check if command matched with any other custom command
    switch (recordedString) {
      // Appends space at the end of input
      case "space":
        if (activeInput) {
          formData[activeInput] = formData[activeInput] + " ";
          this.setState(prevState => ({
            ...formData,
            inputHistory: {
              ...prevState.inputHistory,
              [activeInput]: [...prevState.inputHistory[activeInput], " "]
            }
          }));
        }
        break;
      // Clears currently active input element
      case "clear":
      case "clear input":
      case "clear field":
      case "start again":
        if (activeInput) {
          formData[activeInput] = "";
          this.setState({ ...formData });
        }
        break;
      // Resets form by clearing all the input fields
      case "reset":
      case "reset form":
      case "clear form":
        let clearFields = {};
        fields.forEach(each => {
          clearFields[each.name] = "";
        });
        this.setState({ formData: clearFields });
        break;
      // Deletes last string added to active input
      case "undo":
        if (activeInput) {
          let currText = formData[activeInput];
          if (currText) {
            currText = currText.replace(
              inputHistory[activeInput][inputHistory[activeInput].length - 1] +
                " ",
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
      // Submits form
      case "go":
      case "submit":
      case "submit form":
        this._handleSubmit();
        break;
      // Stops recording/listening to user commands
      case "stop recording":
      case "stop listening":
        this._stopRecording();
        break;
      // process text which doesnt match with any other custom commands
      default: {
        // Map command with input triggers if any
        let input = fields.find(each => each.triggers.includes(recordedString));
        if (input) {
          // if any active input is there then fill it with value
          // set input active
          this._findRefInput(this.refs, input.name).current.focus();
          this.setState({ activeInput: input.name });
        } else {
          if (activeInput) {
            const existingValue = formData[activeInput];
            formData[activeInput] =
              (existingValue ? existingValue : "") + recordedString + " ";
            this.setState(prevState => ({
              ...formData,
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

  // Find referened input
  _findRefInput = (refArray, inputName) =>
    refArray.find(each => each.current.props.name === inputName);

  // Start audio recording
  _startRecording = () => {
    recorder.start();
    recorder.onstart = () =>
      this.setState({ isRecording: true, forceStopped: false });
    recorder.onresult = event => {
      if (event.results[0].isFinal) {
        let string = event.results[0][0].transcript;
        if (string.length) {
          this.setState({ recordedString: string });
          this._proccessCommand(string);
        }
      } else this.setState({ recordedString: null });
    };
    // Start listening again on end
    recorder.onend = () => {
      let { forceStopped } = this.state;
      if (!forceStopped) recorder.start();
      this.setState({ isRecording: false });
    };
  };

  // stop recording
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
  _handleSubmit = e => this.setState({ showModal: true });

  // Handle input change
  _handleChange = e => {
    const { formData } = this.state;
    this.setState({
      formData: { ...formData, [e.target.name]: e.target.value }
    });
  };

  // Debug mode change
  _onDebugModeChange = () => {
    const { debugMode } = this.state;
    this.setState({ debugMode: !debugMode });
  };

  // set currently ative input
  _setActiveInput = activeInput => this.setState({ activeInput });

  // toggle modal
  _hideModal = () => this.setState({ showModal: false });

  render() {
    let {
      isRecording,
      formData,
      showModal,
      debugMode,
      recordedString
    } = this.state;
    return (
      <Row>
        <Col span={24}>
          <Row>
            <Col span={8}></Col>
            <Col span={8} className="form">
              <div className="align-right">
                Debug Mode{" "}
                <Switch
                  checkedChildren="on"
                  unCheckedChildren="off"
                  onChange={this._onDebugModeChange}
                />
              </div>
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
              <MakeForm
                fields={fields}
                formData={formData}
                refs={this.refs}
                _handleChange={this._handleChange}
                _setActiveInput={this._setActiveInput}
                _handleSubmit={this._handleSubmit}
              />
            </Col>
            <Col span={8}>
              {debugMode && (
                <div className="debug">
                  <h3>String Received</h3>
                  <Divider />
                  <b>
                    {recordedString ? (
                      recordedString
                    ) : (
                      <div
                        id="recordingAnimation"
                        className={`${isRecording ? "show" : "hide"}`}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                  </b>
                </div>
              )}
            </Col>
          </Row>
        </Col>
        <FormDetailsModal
          showModal={showModal}
          formData={formData}
          fields={fields}
          _hideModal={this._hideModal}
        />
      </Row>
    );
  }
}

export default hot(App);
