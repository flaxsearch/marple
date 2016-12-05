import React from 'react';

import { Navbar, Nav, NavItem, FormGroup, FormControl, Radio } from 'react-bootstrap';

import { loadTermsData } from '../data';


function handleError(error, msg) {
  alert("ERROR: " + error + ' (' + msg + ')');   // FIXME
}

export const Encoding = props => {
    const buttons = [ "utf8", "base64", "int", "long", "float", "double" ].map(function(encoding) {
        return (
            <Radio inline value={encoding} checked={props.encoding == encoding}
                   key={encoding}
                   onChange={ e => props.selectEncoding(e.target.value) }>
            {encoding}
            </Radio>
        );
    });
    return (<FormGroup>{buttons}</FormGroup>);
};

export const TermsData = props => {
  if (props.terms == undefined) {
    return <div/>;
  }

  var termsList = props.terms.terms.map(function(term) {
    return (<NavItem key={term}>{term}</NavItem>)
  });

  const style = {"paddingTop": "7px"};
  return (
    <div>
        <table className="table table-bordered" style={style}>
            <tbody>
            <tr>
                <td>Total terms:</td><td>{props.terms.termCount}</td>
                <td>Docs with terms:</td><td>{props.terms.docCount}</td>
            </tr>
            <tr>
                <td>Min term:</td><td>{props.terms.minTerm}</td>
                <td>Max term:</td><td>{props.terms.maxTerm}</td>
            </tr>
            </tbody>
        </table>
      <form style={style} onSubmit={ e => e.preventDefault() }>
          <FormControl type="text" placeholder="Filter" value={props.termsFilter}
            onChange={ e => props.setTermsFilter(e.target.value) } />
          <Encoding encoding={props.encoding} selectEncoding={props.selectEncoding}/>
      </form>

      <Nav>{termsList}</Nav>
    </div>
  );
};


class FieldView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'terms',
      termsData: undefined,
      termsFilter: '',
      encoding: 'utf8'
    }

    this.onSelect = this.onSelect.bind(this);
    this.setTermsFilter = this.setTermsFilter.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
  }

  componentDidMount() {
    if (this.props.field) {
      loadTermsData(this.props.segment, this.props.field,
        this.state.termsFilter, this.state.encoding, termsData => {
          this.setState({ termsData });
        }, errorMsg => handleError(errorMsg)
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field) {
      loadTermsData(newProps.segment, newProps.field,
        this.state.termsFilter, this.state.encoding, termsData => {
          this.setState({ termsData });
        }, errorMsg => handleError(errorMsg)
      );
    }
  }

  setTermsFilter(termsFilter) {
    loadTermsData(this.props.segment, this.props.field,
      termsFilter, this.state.encoding, termsData => {
        this.setState({ termsData, termsFilter });
      }, errorMsg => handleError(errorMsg)
    );
  }

  setEncoding(encoding) {
    loadTermsData(this.state.segment, this.state.field,
      this.state.termsFilter, encoding, termsData => {
        this.setState({ termsData, encoding });
      }, errorMsg => handleError(errorMsg)
    );
  }

  onSelect(panel) {
    console.log("FIXME panel=" + panel);
  }

  render() {
    if (this.props.field == undefined) {
      return <div/>;
    }
    else {
      const panel = this.state.activePanel == "terms" ?
        <TermsData terms={this.state.termsData}
                   termsFilter={this.state.termsFilter}
                   encoding={this.state.encoding}
                   setTermsFilter={this.setTermsFilter}
                   setEncoding={this.setEncoding}
        />
        : <div>{ `no panel for ${this.state.activePanel}`}</div>;

      return <div>
        <Nav bsStyle="tabs" justified activeKey="terms" onSelect={this.onSelect}>
          <NavItem eventKey="terms">Terms</NavItem>
          <NavItem eventKey="docvalues">DocValues</NavItem>
          <NavItem eventKey="points">Points</NavItem>
        </Nav>
        { panel }
      </div>;
    }
  }
};

export default FieldView;
