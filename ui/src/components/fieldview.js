import React, { PropTypes } from 'react';
import { Nav, NavItem, Col } from 'react-bootstrap';

import Terms from './terms';
import DocValues from './docvalues';

import { loadFieldsData } from '../data';

export const Fields = props => {
    const fieldtabs = props.fields.map(function(f, i) {
        return (<NavItem eventKey={f.name} key={f.name}>{f.name}</NavItem>);
    });
    return (
        <Nav bsStyle="pills" stacked onSelect={props.onSelect}
             activeKey={props.selected}>
            {fieldtabs}
        </Nav>
    );
};

Fields.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.object),
    selected: PropTypes.string,
    onSelect: PropTypes.func.isRequired
};

class FieldView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
          activePanel: 'terms',
          selectedField: '',
        fields: []
    };

    this.onSelectPanel = this.onSelectPanel.bind(this);
    this.onSelectField = this.onSelectField.bind(this);
    this.getDocValuesType = this.getDocValuesType.bind(this);
  }

  componentDidMount() {
      loadFieldsData(this.props.segment, fields => {
          this.setState({fields})
      }, error => {
          this.props.showAlert(error);
      });
  }

  onSelectPanel(activePanel) {
    this.setState({ activePanel });
  }

  onSelectField(field) {
      const fieldData = this.state.fields.filter(
          x => x.name == field)[0];
      if (fieldData) {
          const activePanel = fieldData.hasTerms ? 'terms' : 'docvalues';
          this.setState({ activePanel, selectedField: field });
      }
  }

  getDocValuesType(field) {
      const fieldData = this.state.fields.filter(
          x => x.name == field)[0];
      return fieldData ? fieldData.docValuesType : 'NONE';
  }

  render() {
      const s = this.state;
      const p = this.props;

      const panel = this.renderPanel();

      return <div>
          <Col md={2}>
              {p.viewSelector}
              <Fields onSelect={this.onSelectField} selected={s.selectedField} fields={s.fields}/>
          </Col>
          <Col md={6}>
              {panel}
          </Col>
      </div>
  }

  renderPanel() {
    const s = this.state;
    const p = this.props;

    if (s.selectedField == "") {
      return <div>[No field selected]</div>;
    }
    else {
      const panel = s.activePanel == "terms" ?
          <Terms segment={p.segment} field={s.selectedField}
                 indexData={p.indexData} showAlert={p.showAlert} />
        : s.activePanel == "docvalues" ?
          <DocValues segment={p.segment} field={s.selectedField}
                     indexData={p.indexData} showAlert={p.showAlert}
                     docValuesType={this.getDocValuesType(s.selectedField)}/>
        : <div>{ `no panel for ${s.activePanel}`}</div>;

      return <div>
        <Nav bsStyle="tabs" justified activeKey={s.activePanel} onSelect={this.onSelectPanel}>
          <NavItem eventKey="terms">Terms</NavItem>
          <NavItem eventKey="docvalues">DocValues</NavItem>
        </Nav>
        { panel }
      </div>;
    }
  }
};

FieldView.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  indexData: PropTypes.object.isRequired,
  showAlert: PropTypes.func.isRequired,
  viewSelector: PropTypes.object.isRequired
};

export default FieldView;
