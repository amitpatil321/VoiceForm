import React from "react";
import { Form, Input, Button } from "antd";
import PropTypes from "prop-types";

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

MakeForm.propTypes = {
  fields: PropTypes.instanceOf(PropTypes.array),
  formData: PropTypes.instanceOf(PropTypes.array),
  refs: PropTypes.instanceOf(PropTypes.array),
  _handleChange: PropTypes.func,
  _setActiveInput: PropTypes.func,
  _handleSubmit: PropTypes.func
};

MakeForm.defaultProps = {
  fields: [],
  formData: [],
  refs: [],
  _handleChange: () => {},
  _setActiveInput: () => {},
  _handleSubmit: () => {}
};

export default MakeForm;
