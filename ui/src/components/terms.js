import React from 'react';
import { Nav, NavItem, FormGroup, FormControl, Radio } from 'react-bootstrap';
import { loadTermsData } from '../data';
import { handleError } from '../util';


class Terms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      termsData: undefined,
      termsFilter: ''
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.setTermsFilter = this.setTermsFilter.bind(this);
    this.handleTermsError = this.handleTermsError.bind(this);
  }

  componentDidMount() {
    if (this.props.field) {
      loadTermsData(this.props.segment, this.props.field,
        this.state.termsFilter, this.props.encoding, termsData => {
          this.setState({ termsData });
        }, this.handleTermsError
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field) {
      loadTermsData(newProps.segment, newProps.field,
        this.state.termsFilter, newProps.encoding, termsData => {
          this.setState({ termsData });
        }, this.handleTermsError
      );
    }
  }

  setTermsFilter(termsFilter) {
    loadTermsData(this.props.segment, this.props.field,
      termsFilter, this.props.encoding, termsData => {
        this.setState({ termsData, termsFilter });
      }, this.handleTermsError
    );
  }

  handleTermsError(errmsg) {
    if (errmsg.includes('No such field')) {
      this.setState({ termsData: {
        termCount: '-',
        docCount: '-',
        minTerm: '-',
        maxTerm: '-',
        terms: ['[no terms]']
      }})
    }
    else {
      handleError(errmsg)
    }
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
      </form>

      <Nav>{termsList}</Nav>
    </div>;
  }
}

export default Terms;
