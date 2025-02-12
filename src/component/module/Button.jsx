import React from "react";

const btnStyle = {
  color: "white",
  background: "#73685d",
  padding: ".375rem .75rem",
  border: "1px solid teal",
  borderRadius: ".25rem",
  fontSize: "1rem",
  lineHeight: 1.5,
  marginLeft: "5px",
  marginRight: "1px",
};

const Button = ({text, onClick, style}) => {
  return <button style={{...btnStyle, ...style}} onClick={onClick}>{text}</button>;
}

export default Button;