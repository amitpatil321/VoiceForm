import React from "react";
import { Form, Input, Button } from "antd";

const MakeForm = ({
  fields,
  formData,
  refs,
  _handleChange,
  _setActiveInput,
  _handleSubmit
}) => {
  return (
    <Form>
      {fields.map((each, index) => {
        return (
          <Form.Item key={index}>
            <Input
              placeholder={each.placeholder}
              name={each.name}
              ref={refs[index]}
              onChange={_handleChange}
              onFocus={() => _setActiveInput(each.name)}
              onBlur={() => _setActiveInput(null)}
              value={formData[each.name]}
              autoComplete="off"
            />
          </Form.Item>
        );
      })}
      <Form.Item className="center">
        <Button type="primary" onClick={_handleSubmit}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MakeForm;
