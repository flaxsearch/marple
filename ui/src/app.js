import React from 'react';
import ReactDOM from 'react-dom';
import { Nav, NavItem, Col, Tabs, Tab } from 'react-bootstrap';

import FieldView from './components/fieldview';
import { MarpleNav, Fields, Segments } from './components/misc';
import { segmentFilter, loadIndexData, loadFieldsData } from './data';
import { handleError } from './util';


class MarpleContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indexData: { indexpath: "loading", generation: -1, segments: []},
      fieldsData: []
    };

    this.selectSegment = this.selectSegment.bind(this);
    this.selectField = this.selectField.bind(this);
    // this.setTermsFilter = this.setTermsFilter.bind(this);
    // this.setEncoding = this.setEncoding.bind(this);
  }

  componentDidMount() {
    loadIndexData(data => {
      this.setState({ indexData: data });
    }, errorMsg => handleError(errorMsg))
  }

  selectSegment(segNumber) {
    loadFieldsData(segNumber, fieldsData => {
      this.setState({
        fieldsData,
        selectedSegment: segNumber,
        selectedField: undefined
      });
    }, errorMsg => handleError(errorMsg));
  }

  selectField(fieldName) {
    this.setState({
      selectedField: fieldName
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
          <FieldView segment={this.state.selectedSegment}
                     field={this.state.selectedField} />
        </Col>
      </div>
    );
  }
}

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));
