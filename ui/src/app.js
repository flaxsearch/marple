import React from 'react';
import ReactDOM from 'react-dom';
import { Nav, NavItem, Col, Tabs, Tab } from 'react-bootstrap';

import FieldView from './components/fieldview';
import MarpleNav from './components/marplenav';
import { Fields, Segments } from './components/misc';
import { segmentFilter, loadIndexData, loadFieldsData } from './data';
import { handleError } from './util';


class MarpleContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indexData: { indexpath: "loading", generation: -1, segments: []},
      fieldsData: [],
      encoding: 'utf8'
    };

    this.selectSegment = this.selectSegment.bind(this);
    this.selectField = this.selectField.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
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

  setEncoding(encoding) {
    this.setState({ encoding });
  }

  render() {
    const s = this.state;
    return (
      <div>
        <MarpleNav indexData={s.indexData}
                   encoding={s.encoding} setEncoding={this.setEncoding}/>
        <Col md={2}>
          <Segments segments={s.indexData.segments}
                    onSelect={this.selectSegment}
                    selected={s.selectedSegment}/>
        </Col>
        <Col md={2}>
          <Fields fields={s.fieldsData}
                  onSelect={this.selectField}
                  selected={s.selectedField}/>
        </Col>
        <Col md={6}>
          <FieldView segment={s.selectedSegment}
                     field={s.selectedField}
                     encoding={s.encoding}/>
        </Col>
      </div>
    );
  }
}

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));
