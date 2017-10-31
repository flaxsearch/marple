import React, { PropTypes } from 'react';

const STYLE = {
    cursor: "wait",
    zIndex: 9999,
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    opacity: 0,
    filter: "alpha(opacity = 0)"
};

const Waiting = props =>
    <div style={STYLE}></div>;

export default Waiting;
