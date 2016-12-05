import React from 'react';
import { Nav, NavItem, FormGroup, FormControl, Radio } from 'react-bootstrap';
import { loadTermsData } from '../data';
import { handleError } from '../util';


export const Encoding = props => {
    const buttons = [ "utf8", "base64", "int", "long", "float", "double" ].map(function(encoding) {
        return (
            <Radio inline value={encoding} checked={props.encoding == encoding}
                   key={encoding}
                   onChange={ e => props.setEncoding(e.target.value) }>
            {encoding}
            </Radio>
        );
    });
    return (<FormGroup>{buttons}</FormGroup>);
};

class Terms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      termsData: undefined,
      termsFilter: '',
      encoding: 'utf8'
    }

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
    loadTermsData(this.props.segment, this.props.field,
      this.state.termsFilter, encoding, termsData => {
        this.setState({ termsData, encoding });
      }, errorMsg => handleError(errorMsg)
    );
  }

  render() {
    const s = this.state;
    if (s.termsData == undefined) {
      return <div/>;
    }

    var termsList = s.termsData.terms.map(function(term) {
      return (<NavItem key={term}>{term}</NavItem>)
    });

    const style = {"paddingTop": "7px"};
    return <div>
        <table className="table table-bordered" style={style}>
            <tbody>
            <tr>
                <td>Total terms:</td><td>{s.termsData.termCount}</td>
                <td>Docs with terms:</td><td>{s.termsData.docCount}</td>
            </tr>
            <tr>
                <td>Min term:</td><td>{s.termsData.minTerm}</td>
                <td>Max term:</td><td>{s.termsData.maxTerm}</td>
            </tr>
            </tbody>
        </table>
      <form style={style} onSubmit={ e => e.preventDefault() }>
          <FormControl type="text" placeholder="Filter" value={s.termsFilter}
            onChange={ e => this.setTermsFilter(e.target.value) } />
          <Encoding encoding={s.encoding} setEncoding={this.setEncoding}/>
      </form>

      <Nav>{termsList}</Nav>
    </div>;
  }
}

export default Terms;
