import React, { PropTypes } from 'react';
import { Form, FormControl, Label, FormGroup, Radio, Table } from 'react-bootstrap';
import { loadDocValuesByDoc, loadDocValuesByValue,
         getFieldEncoding, setFieldEncoding } from '../data';
import { parseDoclist } from '../util';
import { EncodingDropdown } from './misc';

const DocValuesByDocs = props => {
  let keys;
  if (props.docs) {
      keys = parseDoclist(props.docs, props.numDocs);
  }
  else {
    keys = Object.keys(props.docValues.values);
    keys.sort((a, b) => {
      const ia = parseInt(a);
      const ib = parseInt(b);
      return ia < ib ? -1 : ia > ib ? 1 : 0;
    });
  }

  const type = props.docValues.type;
  const values = props.docValues.values;
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

  return <Table style={{marginTop:'10px'}}>
    <thead>
      <tr>
        <th style={{width:'70px'}}>Doc ID</th>
        <th style={{width:'50px'}}>Ord</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {dvlist}
    </tbody>
  </Table>
};

DocValuesByDocs.propTypes = {
  docs: PropTypes.string,
  docValues: PropTypes.object,
  numDocs: PropTypes.number,
  setDocs: PropTypes.func
};


const DocValuesByValue = props => {
  const dvlist = props.docValues.values.map(value =>
    <tr key={value.ord}><td>{value.ord}</td><td>{value.value}</td></tr>
  );
  return <Table style={{marginTop:'10px'}}>
    <thead>
      <tr>
        <th style={{width:'50px'}}>Ord</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {dvlist}
    </tbody>
  </Table>
};

DocValuesByValue.propTypes = {
  filter: PropTypes.string,
  docValues: PropTypes.object,
  setFilter: PropTypes.func
};



class DocValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: '',
      filter: '',
      docValues: undefined,
      encoding: '',
      viewBy: 'docs'
    }

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.setDocs = this.setDocs.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.setEncoding = this.setEncoding.bind(this);
    this.setViewBy = this.setViewBy.bind(this);
  }

  loadAndDisplayDataByDocs(segment, field, docs, newEncoding) {
    // unset docValues to prevent React trying to render with an incompatible component
    // while the data is fetching
    this.setState({ docValues: undefined });

    newEncoding = newEncoding || getFieldEncoding(
      this.props.indexData.indexpath, field, 'docvalues');

    loadDocValuesByDoc(segment, field, docs, newEncoding,
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

  loadAndDisplayDataByValues(segment, field, filter, newEncoding) {
    this.setState({ docValues: undefined });
    newEncoding = newEncoding || getFieldEncoding(
      this.props.indexData.indexpath, field, 'docvalues');

    loadDocValuesByValue(segment, field, filter, newEncoding,
      (docValues, encoding) => {
        if (encoding != this.state.encoding) {
          setFieldEncoding(this.props.indexData.indexpath,
            this.props.field, 'docvalues', encoding);
        }

        this.setState({ docValues, encoding, filter });
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

  // always open in viewBy:docs state
  componentDidMount() {
    if (this.props.field) {
      this.loadAndDisplayDataByDocs(this.props.segment, this.props.field, '');
    }
  }

  // always switch to viewBy:docs state
  componentWillReceiveProps(newProps) {
    if (newProps.field && newProps.field != this.props.field) {
      this.loadAndDisplayDataByDocs(newProps.segment, newProps.field, this.state.docs);
    }
  }

  setEncoding(encoding) {
    if (this.state.viewBy == 'values' &&
        typeHasValueView(this.props.docValuesType)) {
      this.loadAndDisplayDataByValues(this.props.segment, this.props.field,
                                      this.state.filter, encoding);
    }
    else {
      this.loadAndDisplayDataByDocs(this.props.segment, this.props.field,
                                    this.state.docs, encoding);
    }
  }

  setDocs(docs) {
    docs = docs.replace(/[^\d ,\-]/, '');  // restrict input
    this.loadAndDisplayDataByDocs(this.props.segment, this.props.field,
                                  docs, this.state.encoding);
  }

  setFilter(filter) {
    this.loadAndDisplayDataByValues(this.props.segment, this.props.field,
                                    filter, this.state.encoding);
  }

  setViewBy(evt) {
    const viewBy = evt.target.value;
    if (viewBy == 'values' && typeHasValueView(this.props.docValuesType)) {
      this.loadAndDisplayDataByValues(this.props.segment, this.props.field,
                                      this.state.filter, this.state.encoding);
    }
    else {
      this.loadAndDisplayDataByDocs(this.props.segment, this.props.field,
                                    this.state.docs, this.state.encoding);
    }
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

    const encodingDropdown = doesEncodingApply(p.docValuesType) ?
      <EncodingDropdown encoding={s.encoding} numeric={true}
                        onSelect={x => this.setEncoding(x)} /> : '';

    const disableViewBy = ! typeHasValueView(p.docValuesType);

    const dvtable = (s.viewBy == 'docs' || disableViewBy) ?
      <DocValuesByDocs docs={s.docs} docValues={s.docValues}
                       numDocs={p.indexData.numDocs} setDocs={this.setDocs} />
      :
      <DocValuesByValue filter={s.filter} docValues={s.docValues}
                        setFilter={this.setFilter}/> ;

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

      <FormControl type="text" value={s.docs}
        placeholder={'FIXME'}
        onChange={ e => this.setDocs(e.target.value) }
        style={{width: "100%"}} />

      {dvtable}
    </div>;
  }
}

function doesEncodingApply(type) {
  return ! type.includes('NUMERIC');
}

function typeHasValueView(type) {
  return type == 'SORTED' || type == 'SORTED_SET';
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
