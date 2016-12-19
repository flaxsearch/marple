import React, { PropTypes } from 'react';
import { Col, Form, FormControl } from 'react-bootstrap';

import { loadDocument } from '../data';

class DocumentView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { selected: '' };
        this.selectDocument = this.selectDocument.bind(this);
    }

    selectDocument(docid) {
        if (docid) {
            loadDocument(this.props.segment, docid, d => {
                this.setState({
                    document: d,
                    selected: docid
                })
            }, e => {
                this.props.showAlert(e);
            })
        }
        else {
            this.setState({ selected: '' })
        }
    }

    renderDoc() {
        if (this.state.selected == '')
            return <div>[ No document selected ]</div>

        const fields = Object.keys(this.state.document.fields).map(k => {
            return <tr key={k}><td>{k}</td><td>{JSON.stringify(this.state.document.fields[k])}</td></tr>
        });

        return <table>
            <tbody>
            <tr>
                <th>Field</th>
                <th>Value</th>
            </tr>
            {fields}
            </tbody>
        </table>
    }

    render() {
        const document = this.renderDoc();
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
