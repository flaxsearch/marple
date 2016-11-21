import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav, NavItem, Col, Tabs, Tab } from 'react-bootstrap';

var indexData = { "index" : "/path/to/index" };
var fieldsData = [
    "field1" , "field2", "field3"
];

// FIXME for the bundled version this should be ""
const MARPLE_ROOT = "http://localhost:8080";

const MarpleNav = props => {
  return (
    <NavBar>
      <NavBar.Header>
        <NavBar.Brand>
          <a href="#">Marple</a>
        </NavBar.Brand>
      </NavBar.Header>
      <NavBar.Text pullRight>
        Exploring lucene index: {props.indexData.indexpath}
      </NavBar.Text>
    </NavBar>
  );
};

function segmentFilter(segment) {
  if (segment == 0)
    return "";
  return "?segment=" + (segment - 1);
}

function handleError(error) {
  alert("ERROR: " + error);   // FIXME
  console.log(error.stack);
});

function loadFieldsData(segment, renderFunc) {
  fetch(MARPLE_ROOT + "/api/fields" + segmentFilter(segment))
  .then(response => { renderFunc(response.json()) })
  .catch(error => { handleError(error) });
}

function loadTermsData(segment, field, renderFunc) {
  fetch(MARPLE_ROOT + "/api/terms/" + field + segmentFilter(segment))
  .then(response => { renderFunc(response.json()) })
  .catch(error => { handleError(error) });
}

const Fields = props => {
  var fieldtabs = props.fields.map(function(f, i) {
    return (<NavItem eventKey={f.name}>{f.name}</NavItem>);
  });
  return (
    <Nav bsStyle="pills" stacked onSelect={props.onSelect}
       activeKey={props.selected}>{fieldtabs}</Nav>
  );
};

const Segments = props => {
  var segmenttab = this.props.segments.map(function(f, i) {
    var name = "Segment " + f.ord;
    return (<NavItem eventKey={i + 1}>{name}</NavItem>);
  });
  segmenttab.unshift(<NavItem eventKey={0}>All segments</NavItem>);
  return (
    <Nav bsStyle="pills" stacked onSelect={this.props.onSelect}
         activeKey={this.props.selected}>{segmenttab}</Nav>
  );
};

class MarpleContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      indexData: { indexpath: "loading", generation: -1, segments: []},
      fieldsData: [],
      selectedField: undefined,
      selectedSegment: undefined
    };

    this.selectSegment = this.selectSegment.bind();
    this.selectField = this.selectField.bind();
  }

  componentDidMount() {
    fetch(MARPLE_ROOT + "/api/index")
    .then(response => {
      this.setState({ indexData: response.json() });
    })
    .catch(error => { handleError(error) });
  }

  selectSegment(segNumber) {
    loadFieldsData(segNumber, fieldsData => {
      this.setState({
        fieldsData,
        selectedSegment: segNumber,
        selectedField: undefined
      });
    });
  }

  selectField(fieldName) {
    loadTermsData(this.state.selectedSegment, fieldName, termsData => {
      this.setState({
        termsData,
        selectedField: fieldName
      });
    });
  }

  render() {
    return (
      <div>
        <MarpleNav indexData={this.state.indexData}/>
        <Col md={2}>
          <Segments segments={this.state.indexData.segments}
            onSelect={this.selectSegment}
            selected={this.state.selectedSegment}/>
        </Col>
        <Col md={2}>
          <Fields fields={this.state.fieldsData}
            onSelect={this.selectField}
            selected={this.state.selectedField}/>
        </Col>
        <Col md={6}>
          <FieldData field={this.state.selectedField}
           termsData={this.state.termsData}/>
        </Col>
      </div>
    );
  }
}

var TermsData = React.createClass({
    render: function() {

const TermsData = props => {
  var termsList = this.props.terms.map(function(term) {
    return (<NavItem>{term}</NavItem>)
  });
  return (
    <Nav>{termsList}</Nav>
  );
};

const FieldData = props => {
  if (this.props.field == undefined) {
      return (<div/>)
  }
  return (
    <div>
      <Nav bsStyle="tabs" justified activeKey="terms">
        <NavItem eventKey="terms">Terms</NavItem>
        <NavItem eventKey="docvalues">DocValues</NavItem>
        <NavItem eventKey="points">Points</NavItem>
      </Nav>
      <TermsData terms={this.props.termsData}/>
    </div>
  );
};

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));
