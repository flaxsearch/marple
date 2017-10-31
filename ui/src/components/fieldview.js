import React, { PropTypes } from 'react';
import { Nav, NavItem, Col, FormControl } from 'react-bootstrap';

import Terms from './terms';
import DocValues from './docvalues';
import Points from './points';

import { loadFieldsData } from '../data';

const FILTERSTYLE = {
    marginTop: "8px",
    marginBottom: "5px"
};


class Fields extends React.Component {
    constructor(props) {
        super(props);
        this.state = { filter: '' };

        this.onChange = this.onChange.bind(this);
    }

    onChange(evt) {
        this.setState({ filter: evt.target.value });
    }

    render() {
        const p = this.props;
        const s = this.state;

        const fieldtabs = p.fields
        .filter(f => f.name.startsWith(s.filter))
        .map((f, i) => <NavItem eventKey={f.name} key={f.name}
            className="marple-field-item">{f.name}</NavItem>);

        return <div>
            <div style={FILTERSTYLE}>
                <FormControl type="text"
                    value={s.filter}
                    placeholder={'Filter by name'}
                    onChange={this.onChange}
                    style={{width: "100%"}}
                    className="marple-field-filter-input"/>
            </div>
            <Nav bsStyle="pills" stacked onSelect={p.onSelect}
                activeKey={p.selected}>
                {fieldtabs}
            </Nav>
        </div>;
    }
}

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
        const fieldData = this.state.fields.filter(x => x.name == field)[0];
        if (fieldData) {
            if (fieldData.hasTerms) {
                this.setState({ activePanel: 'terms', selectedField: field });
            }
            else if (fieldData.docValuesType != 'NONE') {
                this.setState({ activePanel: 'docvalues', selectedField: field });
            }
            else if (fieldData.pointDimensionCount > 0) {
                this.setState({ activePanel: 'points', selectedField: field });
            }
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
                <Fields onSelect={this.onSelectField}
                        selected={s.selectedField} fields={s.fields}/>
            </Col>
            <Col md={6}>
                {panel}
            </Col>
        </div>;
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
            : s.activePanel == "points" ?
                <Points segment={p.segment} field={s.selectedField}
                        showAlert={p.showAlert} />
            : <div></div>;

            return <div>
                <Nav bsStyle="tabs" justified
                 activeKey={s.activePanel} onSelect={this.onSelectPanel}>
                    <NavItem eventKey="terms">Terms</NavItem>
                    <NavItem eventKey="docvalues">Doc values</NavItem>
                    <NavItem eventKey="points">Points</NavItem>
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
