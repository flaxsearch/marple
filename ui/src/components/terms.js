import React from 'react';
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
      this.setState({ termsData: {
        termCount: '-',
        docCount: '-',
        minTerm: '-',
        maxTerm: '-',
        terms: ['[no terms]']
      }})
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

    const termsList = s.termsData.terms.map(function(term) {
      return (<NavItem key={term}>{term}</NavItem>)
    });

    const style = {"paddingTop": "7px" };
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
      <Form inline style={style} onSubmit={ e => e.preventDefault() }>
        <FormControl type="text" placeholder="Filter" value={s.termsFilter}
         onChange={ e => this.setTermsFilter(e.target.value) }
         style={{"width": "500px"}} />
        {" "}
        <EncodingDropdown encoding={s.encoding} numeric={true}
                          onSelect={x => this.setEncoding(x)} />
      </Form>

      <Nav>{termsList}</Nav>
    </div>;
  }
}

// <Nav>
//   <NavDropdown title={`Encoding: ${p.encoding}`}
//     onSelect={x => p.setEncoding(x)} id='encoding-dropdown'>
//     <MenuItem eventKey={'utf8'}>utf8</MenuItem>
//     <MenuItem eventKey={'base64'}>base64</MenuItem>
//     <MenuItem divider />
//     <MenuItem eventKey={'int'}>int</MenuItem>
//     <MenuItem eventKey={'long'}>long</MenuItem>
//     <MenuItem eventKey={'float'}>float</MenuItem>
//     <MenuItem eventKey={'double'}>double</MenuItem>
//   </NavDropdown>
// </Nav>

export default Terms;
