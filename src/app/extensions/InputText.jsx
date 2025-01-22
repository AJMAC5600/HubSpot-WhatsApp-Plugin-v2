import React from "react";

const InputText = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    style={{
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
    }}
  />
);

export default InputText;
