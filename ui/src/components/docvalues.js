import React, { PropTypes } from 'react';
import { Form, FormControl, Label, FormGroup, Radio, Table } from 'react-bootstrap';
import { loadDocValues, getFieldEncoding, setFieldEncoding } from '../data';
import { parseDoclist } from '../util';
import { EncodingDropdown } from './misc';


class DocValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: '',
      docValues: undefined,
      encoding: '',
      viewBy: 'docs'
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
    this.setDocs = this.setDocs.bind(this);
    this.setViewBy = this.setViewBy.bind(this);
  }

  loadAndDisplayData(segment, field, docs, newEncoding) {
    newEncoding = newEncoding || getFieldEncoding(
      this.props.indexData.indexpath, field, 'docvalues');

    loadDocValues(segment, field, docs, newEncoding,
      (docValues, encoding) => {
        if (encoding != this.state.encoding) {
          setFieldEncoding(this.props.indexData.indexpath,
            this.props.field, 'docvalues', encoding);
        }

        this.setState({ docs, docValues, encoding });

        if (encoding != newEncoding) {
          this.props.showAlert(`${newEncoding} is not a valid encoding for this field`);
        }
      },
      errmsg => {
        if (errmsg.includes('No doc values for')) {
          this.setState({ docValues: { type: 'NONE', values: null }});
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
      this.loadAndDisplayData(newProps.segment, newProps.field, this.state.docs);
    }
  }

  setEncoding(encoding) {
    this.loadAndDisplayData(this.props.segment, this.props.field,
                            this.state.docs, encoding);
  }

  setDocs(docs) {
    docs = docs.replace(/[^\d ,\-]/, '');  // restrict input
    this.loadAndDisplayData(this.props.segment, this.props.field,
                            docs, this.state.encoding);
  }

  setViewBy(evt) {
    const viewBy = evt.target.value;
    console.log('FIXME viewBy=' + viewBy);
  }

  render() {
    const s = this.state;
    const p = this.props;

    if (s.docValues == undefined) {
      return <div/>;
    }

    if (p.docValuesType == 'NONE') {
      return <div style={{margin:'14px'}}>
        [no doc values for field {p.field}]
      </div>;
    }

    let keys;
    if (s.docs) {
        keys = parseDoclist(s.docs, p.indexData.numDocs);
    }
    else {
      keys = Object.keys(s.docValues.values);
      keys.sort((a, b) => {
        const ia = parseInt(a);
        const ib = parseInt(b);
        return ia < ib ? -1 : ia > ib ? 1 : 0;
      });
    }

    const encodingDropdown = doesEncodingApply(p.docValuesType) ?
      <EncodingDropdown encoding={s.encoding} numeric={true}
                        onSelect={x => this.setEncoding(x)} /> : '';

    const disableViewBy = ! typeHasValueView(p.docValuesType);
    const dvlist = makeDvList(keys, s.docValues.type, s.docValues.values);

    const placeholder = "Doc IDs (e.g. 1, 5, 10-100)";
    return <div>
      <div style={{ marginTop: '10px' }}>
        <FormGroup>
          <Label style={{ marginRight: '15px' }}>{ p.docValuesType}</Label>
          { encodingDropdown }
          <Radio inline style={{ marginLeft: '20px' }}
                 checked={ disableViewBy || s.viewBy == 'docs' }
                 disabled={ disableViewBy }
                 value={'docs'}
                 onChange={this.setViewBy}>
            View by doc
          </Radio>
          {' '}
          <Radio inline
                 checked={ s.viewBy == 'values' && ! disableViewBy }
                 disabled={ disableViewBy }
                 value={'values'}
                 onChange={this.setViewBy}>
            View by value
          </Radio>
        </FormGroup>
      </div>

      <Form inline onSubmit={ e => e.preventDefault() }>
        <FormControl type="text" placeholder={placeholder} value={s.docs}
          onChange={ e => this.setDocs(e.target.value) }
          style={{width: "100%"}} />
      </Form>
      <Table style={{marginTop:'10px'}}>
        <thead>
          <tr>
            <th style={{width:'80px'}}>Doc ID</th>
            <th style={{width:'50px'}}>Ord</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {dvlist}
        </tbody>
      </Table>
    </div>;
  }
}

function doesEncodingApply(type) {
  return ! type.includes('NUMERIC');
}

function typeHasValueView(type) {
  return type == 'SORTED' || type == 'SORTED_SET';
}

function makeDvList(keys, type, values) {
  let dvlist = [];
  if (type == 'BINARY' || type == 'NUMERIC') {
    keys.forEach(docid => {
      dvlist.push(<tr key={docid}>
        <td>{docid}</td>
        <td>-</td>
        <td>{values[docid]}</td>
      </tr>);
    });
  }
  else if (type == 'SORTED') {
    keys.forEach(docid => {
      dvlist.push(<tr key={docid}>
        <td>{docid}</td>
        <td>{values[docid].ord}</td>
        <td>{values[docid].value}</td>
      </tr>);
    });
  }
  else if (type == 'SORTED_NUMERIC') {
    keys.forEach(docid => {
      values[docid].forEach((value, idx) => {
        dvlist.push(<tr key={`${docid}.${idx}`}>
          <td>{idx == 0 ? docid : ''}</td>
          <td>-</td>
          <td>{value}</td>
        </tr>);
      });
    });
  }
  else if (type == 'SORTED_SET') {
    keys.forEach(docid => {
      values[docid].forEach((value, idx) => {
        dvlist.push(<tr key={`${docid}.${idx}`}>
          <td>{idx == 0 ? docid : ''}</td>
          <td>{value.ord}</td>
          <td>{value.value}</td>
        </tr>);
      });
    });
  }

  return dvlist;
}

DocValues.propTypes = {
  segment: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number
  ]),
  field: PropTypes.string.isRequired,
  docValuesType: PropTypes.string.isRequired,
  indexData: PropTypes.object.isRequired,
  showAlert: PropTypes.func.isRequired
};


export default DocValues;
