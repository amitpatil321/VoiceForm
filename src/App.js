import { hot } from "react-hot-loader/root";
import React, { Component } from "react";
import { Row, Col, Switch, Spin, Icon, Alert } from "antd";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

import { fields } from "./form.json";
import MakeForm from "./MakeForm/MakeFormView";
import Help from "./Help/Help";
import FormDetailsModal from "./FormDetailsModal/FormDetailsModal";

import "./App.css";
import "antd/dist/antd.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recorder = new SpeechRecognition();

recorder.continous = true;
recorder.interimResults = true;
recorder.lang = "en-US";

class App extends Component {
  state = {
    recordedString: null,
    activeInput: null,
    isRecording: false,
    loading: false,
    forceStopped: false,
    formData: {},
    inputHistory: [],
    refs: [],
    showModal: false,
    debugMode: false,
    error: null
  };

  componentDidMount() {
    const inputs = {};
    const inputHistory = {};

    // Initialize inputs array with blank values
    fields.forEach(each => {
      inputs[each.name] = "";
      inputHistory[each.name] = "";
    });

    const refs = fields.map(each => React.createRef());
    this.setState({ formData: inputs, inputHistory, refs });
  }

  _proccessCommand = recordedString => {
    const { activeInput, formData, inputHistory, refs } = this.state;
    // check if command matched with any other custom command

    switch (recordedString) {
      // toggle debug mode on or off
      case "toggle debug":
        this._onDebugModeChange();
        break;
      // Appends space at the end of input
      case "space":
        if (activeInput) {
          formData[activeInput] = `${formData[activeInput]} `;
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
      case "clear form": {
        const clearFields = {};
        fields.forEach(each => {
          clearFields[each.name] = "";
        });
        this.setState({ formData: clearFields });
        break;
      }
      // Deletes last string added to active input
      case "undo":
        if (activeInput) {
          let currText = formData[activeInput];
          if (currText) {
            currText = currText.replace(
              `${
                inputHistory[activeInput][inputHistory[activeInput].length - 1]
              } `,
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
        const input = fields.find(each =>
          each.triggers.includes(recordedString)
        );
        if (input) {
          // if any active input is there then fill it with value
          // set input active
          this._findRefInput(refs, input.name).current.focus();
          this.setState({ activeInput: input.name });
        } else if (activeInput) {
          const existingValue = formData[activeInput];
          if (activeInput === "email") {
            // eslint-disable-next-line no-param-reassign
            recordedString = recordedString.toLowerCase().replace(/\s/g, "");
          }

          formData[activeInput] = `${(existingValue || "") + recordedString} `;
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
        const string = event.results[0][0].transcript;
        if (string.length) {
          this.setState({ recordedString: string, loading: true });
          this._proccessCommand(string);
        }
      } else this.setState({ recordedString: null, loading: true });
    };
    // Start listening again on end
    recorder.onend = () => {
      const { forceStopped } = this.state;
      if (!forceStopped) recorder.start();
      this.setState({ isRecording: false, loading: false });
    };

    // Handle user declined audio permissions error
    recorder.onerror = err => {
      if (err.error === "not-allowed")
        this.setState({
          error: "Please allow Microphone access"
        });
    };
  };

  // stop recording
  _stopRecording = () => {
    this.setState(
      {
        activeInput: null,
        isRecording: false,
        forceStopped: true,
        loading: true
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
    const {
      isRecording,
      refs,
      loading,
      formData,
      showModal,
      debugMode,
      recordedString,
      error
    } = this.state;
    return (
      <Row>
        <Col span={24}>
          <Row>
            <Col span={8} />
            <Col span={8} className="content">
              <div className="align-right">
                Debug Mode{" "}
                <Switch
                  checked={!!debugMode}
                  checkedChildren="on"
                  unCheckedChildren="off"
                  onChange={this._onDebugModeChange}
                />
              </div>
              <h2>Registration Form</h2>
              {error && (
                <>
                  <Alert type="error" message={error} showIcon />
                  <br />
                </>
              )}

              <Row>
                <Col span={24}>
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
                    <Col span={8} />
                    <Col span={14} className="align-right">
                      {loading && (
                        <Spin
                          indicator={
                            <Icon
                              type="loading"
                              style={{ fontSize: 18 }}
                              spin
                            />
                          }
                        />
                      )}
                      {debugMode && recordedString && (
                        <span className="debug">{recordedString}</span>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
              <MakeForm
                fields={fields}
                formData={formData}
                refs={refs}
                _handleChange={this._handleChange}
                _setActiveInput={this._setActiveInput}
                _handleSubmit={this._handleSubmit}
              />
            </Col>
            <Col span={8}>
              <Help />
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
