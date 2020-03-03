import React from "react";
import { Modal, Button } from "antd";

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
                  <td>: {formData[each.name]}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </Modal>
  );
};

export default FormDetailsModal;
