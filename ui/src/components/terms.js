import React, { PropTypes } from 'react';
import { Nav, NavItem, FormGroup, FormControl, Radio, Form } from 'react-bootstrap';
import { loadTermsData, getFieldEncoding, setFieldEncoding } from '../data';
import { EncodingDropdown } from './misc';


class Terms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      termsData: undefined,
      termsFilter: '',
      encoding: ''
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.setTermsFilter = this.setTermsFilter.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
  }

  loadAndDisplayData(segment, field, termsFilter, newEncoding) {
    newEncoding = newEncoding || getFieldEncoding(
      this.props.indexData.indexpath, field, 'terms');

    loadTermsData(segment, field, termsFilter, newEncoding,
      (termsData, encoding) => {
        if (encoding != this.state.encoding) {
          setFieldEncoding(this.props.indexData.indexpath,
            this.props.field, 'terms', encoding);
        }

        this.setState({ termsFilter, termsData, encoding });

        if (encoding != newEncoding) {
          this.props.showAlert(`${newEncoding} is not a valid encoding for this field`);
        }
      },
      errmsg => {
        if (errmsg.includes('No such field')) {
          this.setState({ termsData: { terms: undefined }});
        }
        else {
          this.props.showAlert(errmsg, true);
        }
      }
    );
  }

  componentDidMount() {
    if (this.props.field) {
      this.loadAndDisplayData(this.props.segment, this.props.field, '');
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field && newProps.field != this.props.field) {
      this.loadAndDisplayData(newProps.segment, newProps.field, this.state.termsFilter);
    }
  }

  setTermsFilter(termsFilter) {
    this.loadAndDisplayData(this.props.segment, this.props.field, termsFilter, this.state.encoding);
  }

  setEncoding(encoding) {
    this.loadAndDisplayData(this.props.segment, this.props.field, this.state.termsFilter, encoding);
  }

  render() {
    const s = this.state;
    if (s.termsData == undefined) {
      return <div/>;
    }

    if (s.termsData.terms == undefined) {
      return <div style={{margin:'14px'}}>
        [no terms for field { this.props.field }]
      </div>;
    }
    const termsList = s.termsData.terms.map((term, idx) =>
      <NavItem key={idx}>{term}</NavItem>);

    const termCount = s.termsData.termCount == -1 ? "not stored" : s.termsData.termCount;

    return <div>
      <table style={{width:'100%', border:'0px', margin:'7px 0px 7px 14px'}}>
        <tbody>
          <tr>
            <td style={{width:'140px'}}><i>Total terms:</i></td>
            <td style={{width:'auto'}}>{termCount}</td>
          </tr>
          <tr>
            <td style={{width:'140px'}}><i>Docs with terms:</i></td>
            <td style={{width:'auto'}}>{s.termsData.docCount}</td>
          </tr>
          <tr>
            <td style={{width:'140px'}}><i>Min term:</i></td>
            <td style={{width:'auto'}}>{s.termsData.minTerm}</td>
          </tr>
          <tr>
            <td style={{width:'140px'}}><i>Max term:</i></td>
            <td style={{width:'auto'}}>{s.termsData.maxTerm}</td>
          </tr>
        </tbody>
      </table>
      <Form inline onSubmit={ e => e.preventDefault() }>
        <FormControl type="text" value={s.termsFilter}
         placeholder={'Regexp filter'}
         onChange={ e => this.setTermsFilter(e.target.value) }
         style={{width:'500px'}} />
        {" "}
        <EncodingDropdown encoding={s.encoding} numeric={true}
                          onSelect={x => this.setEncoding(x)} />
      </Form>

      <Nav>{termsList}</Nav>
    </div>;
  }
}

Terms.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  field: PropTypes.string.isRequired,
  indexData: PropTypes.object.isRequired,
  showAlert: PropTypes.func.isRequired
};

export default Terms;
