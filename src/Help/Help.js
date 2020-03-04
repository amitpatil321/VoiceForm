import React from "react";
import { Table } from "antd";
import { FaMicrophone } from "react-icons/fa";

const Help = () => {
  const rows = [
    { key: ["toggle debug"], desc: "Turns on/off debug mode" },
    {
      key: ["clear", "clear input", "clear field", "start again"],
      desc: "Clears currently active input"
    },
    {
      key: ["reset", "reset form", "clear form"],
      desc: "Resets the form by clearing all the inputs"
    },
    {
      key: ["go", "submit", "submit form"],
      desc: "Submits the form"
    },
    {
      key: ["stop recording", "stop listening"],
      desc: "Stops audio recording"
    },
    { key: ["space"], desc: "Adds space at the end of active input" },
    {
      key: ["undo"],
      desc: "Removed recently added string from currently active input"
    }
  ];
  const dataSource = [];
  rows.forEach((each, index) => {
    dataSource.push({
      key: index,
      command: each.key.map(e => <li key={Math.random()}>- {e}</li>),
      Description: each.desc
    });
  });

  const columns = [
    {
      title: "command",
      dataIndex: "command",
      key: "command",
      width: "35%"
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description"
    }
  ];

  return (
    <div className="help" style={{ width: "90%" }}>
      <h2>How it works ?</h2>- To start audio input click on{" "}
      <FaMicrophone className="recordingIcon on" style={{ fontSize: "12px" }} />{" "}
      icon.
      <br />- Inputs can be triggered/activated with the help of commands
      mentioned in triggers property in{" "}
      <i>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/amitpatil321/VoiceForm/blob/master/src/form.json"
        >
          form.json
        </a>
      </i>{" "}
      file
      <br />- Apart from input triggers there are few custom commands which are
      as below
      <br />
      <h3>Custom commands</h3>
      <Table
        dataSource={dataSource}
        columns={columns}
        size="small"
        pagination={false}
      />
    </div>
  );
};

export default Help;
