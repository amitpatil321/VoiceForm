import {
  hot
} from 'react-hot-loader/root';
import React, { Component, createRef } from 'react'
import {Button, Row, Col, Form, Input} from 'antd';
import 'antd/dist/antd.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

class App extends Component {
  constructor(props) {
    super(props);
    this.refLoginForm = createRef();
    this.refUsername = createRef();
    this.refPassword = createRef();
    this.refSubmit = createRef();
  }
  state = {
    words: {
      username: ['username', 'login name', 'name'],
      password: ['password', 'pass'],
      submit: ['go', 'submit', 'submit form'],
    },
    form: {
      username: "",
      password: ""
    },
    activeInput: null,
    isRecording: false
  }
  componentDidMount() {

  }
  _startRecording = () => {
    recognition.start();
    recognition.onstart = () => this.setState({ isRecording: true})
    recognition.onresult = event => {
      let { words, activeInput, form } = this.state;

      if (event.results[0].isFinal) {
        let string = event.results[0][0].transcript;
        if (string.length) {
          console.log(string, activeInput);
          // check if focus is inside input button?
          if (!activeInput) {
            Object.keys(words).forEach(each => {
              if (words[each].includes(string)) {
                const capitalize = each.charAt(0).toUpperCase() + each.slice(1);
                // check if its a input or submit ?
                if (each === "submit") {
                  // remove focus from input
                  if (activeInput) {
                    const capitalizedInput = activeInput.charAt(0).toUpperCase() + activeInput.slice(1);
                    this[`ref${capitalizedInput}`].current.blur();
                  }
                  this.handleSubmit();
                }else {
                  this[`ref${capitalize}`].current.focus();
                  this.setState({ activeInput: each })
                }
              }
            });
          } else {
            form[activeInput] = string;
            this.setState({ ...form, activeInput: null });
          }
        }
      }

    };
    // Start listening again on end
    recognition.onend = () => {
      recognition.start()
      this.setState({ isRecording: false })
    }
  }

  // Handle submit button
  handleSubmit = (e) => {
    const { form } = this.state;
    console.log(form);
  }

  render() {
    let { isRecording, form } = this.state;
    return (
      <Row>
        <Col span={2}></Col>
        <Col span={22}>
          <Button type="primary" onClick={() => this._startRecording()}> {!isRecording ? "Start" : "Listening"} </Button>
          <Form layout="inline" onSubmit={this.handleSubmit} ref={this.refLoginForm}>
            <Form.Item>
              <Input placeholder="Username" ref={this.refUsername} value={form.username}/>
            </Form.Item>
            <Form.Item>
              <Input placeholder="Password" ref={this.refPassword} value={form.password}/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    )
  }
}

export default hot(App)