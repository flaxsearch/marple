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
      encoding: 'utf8'
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.setTermsFilter = this.setTermsFilter.bind(this);
    this.handleTermsError = this.handleTermsError.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
  }

  componentDidMount() {
    if (this.props.field) {
      const encoding = getFieldEncoding(this.props.indexData.indexpath,
                                        this.props.field, 'terms');
      loadTermsData(this.props.segment, this.props.field,
        this.state.termsFilter, encoding, termsData => {
          this.setState({ termsData, encoding });
        }, this.handleTermsError
      );
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.field) {
      const encoding = getFieldEncoding(this.props.indexData.indexpath,
                                        newProps.field, 'terms');
      loadTermsData(newProps.segment, newProps.field,
        this.state.termsFilter, encoding, termsData => {
          this.setState({ termsData, encoding });
        }, this.handleTermsError
      );
    }
  }

  setTermsFilter(termsFilter) {
    loadTermsData(this.props.segment, this.props.field,
      termsFilter, this.state.encoding, termsData => {
        this.setState({ termsData, termsFilter });
      }, this.handleTermsError
    );
  }

  setEncoding(enc) {
    loadTermsData(this.props.segment, this.props.field,
      this.state.termsFilter, enc, (termsData, encoding) => {
        if (encoding == enc) {
          setFieldEncoding(this.props.indexData.indexpath,
                           this.props.field, 'terms', encoding);
        }
        else {
          this.props.showAlert(`${enc} is not a valid encoding for this field`);
        }
        this.setState({ termsData, encoding });
      }, this.handleTermsError
    );
  }

  handleTermsError(errmsg) {
    if (errmsg.includes('No such field')) {
      this.setState({ termsData: { terms: undefined }});
    }
    else {
      this.props.showAlert(errmsg, true);
    }
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
        <FormControl type="text" placeholder="Filter" value={s.termsFilter}
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
