import React from "react";
import { Modal, Button } from "antd";
import PropTypes from "prop-types";

const FormDetailsModal = ({ showModal, formData, fields, _hideModal }) => {
  return (
    <Modal
      title="User Details"
      visible={showModal}
      onOk={_hideModal}
      onCancel={_hideModal}
      footer={[
        <Button key="back" onClick={_hideModal}>
          Close
        </Button>
      ]}
    >
      <table>
        <tbody>
          {formData &&
            showModal &&
            fields.map(each => {
              return (
                <tr key={each.name}>
                  <td width="50%">{each.placeholder}</td>
                  <td>{`: ${formData[each.name]}`}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </Modal>
  );
};

FormDetailsModal.propTypes = {
  showModal: PropTypes.bool,
  fields: PropTypes.arrayOf(PropTypes.object),
  formData: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    company: PropTypes.string,
    job_title: PropTypes.string
  }),
  _hideModal: PropTypes.func
};

FormDetailsModal.defaultProps = {
  showModal: false,
  formData: [],
  fields: [],
  _hideModal: () => {}
};

export default FormDetailsModal;
