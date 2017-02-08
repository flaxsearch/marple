import React, { PropTypes } from 'react';
import { Col, Form, FormControl, Button } from 'react-bootstrap';

import { loadDocument } from '../data';

const INITIAL_MAX_FIELDS = 100;
const INITIAL_MAX_FIELD_LENGTH = 10000;

class DocumentView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { selected: '' };
        this.selectDocument = this.selectDocument.bind(this);
        this.loadAll = this.loadAll.bind(this);
    }

    selectDocument(docid) {
        if (docid) {
            loadDocument(this.props.segment, docid,
                INITIAL_MAX_FIELDS, INITIAL_MAX_FIELD_LENGTH,
                d => {
                    this.setState({ document: d, selected: docid })
                },
                e => { this.props.showAlert(e); }
            );
        }
        else {
            this.setState({ document: null, selected: '' })
        }
    }

    loadAll() {
        if (this.state.selected) {
            loadDocument(this.props.segment, this.state.selected,
                undefined, undefined,
                d => { this.setState({ document: d }) },
                e => { this.props.showAlert(e); }
            );
        }
    }

    renderField(field) {
        return field.length == 1 ? field[0] : JSON.stringify(field);
    }

    renderDoc() {
        if (this.state.selected == '')
            return <div>[ No document selected ]</div>

        const fields = Object.keys(this.state.document.fields).map(k =>
            <div className="marple-doc-field" key={k}>
                <span className="marple-doc-fieldname">{`${k}: `}</span>
                <span className="marple-doc-fieldval">
                    {this.renderField(this.state.document.fields[k])}
                </span>
            </div>
        );

        return <div>{fields}</div>;
    }

    render() {
        const document = this.renderDoc();
        const s = this.state;

        const loadMore = (s.document && !s.document.complete) ?
            <Button bsStyle="primary" onClick={this.loadAll}>
                {`Load all (${s.document.totalLengthInChars} characters)`}
            </Button>
            : null;

        return <div>
            <Col md={2}>
                {this.props.viewSelector}
                <Form inline onSubmit={e => e.preventDefault()}>
                    <FormControl style={{ marginTop:'9px' }}
                     type="text" placeholder="docid" value={this.state.selected}
                     onChange={e => this.selectDocument(e.target.value)}/>
                </Form>
            </Col>
            <Col md={6}>
                {document}
                {loadMore}
            </Col>
        </div>
    }

}

DocumentView.propTypes = {
    segment: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number
    ]),
    viewSelector: PropTypes.object.isRequired,
    showAlert: PropTypes.func.isRequired
};

export default DocumentView;
