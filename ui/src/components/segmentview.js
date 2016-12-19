import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import FieldView from './fieldview';
import DocumentView from './docview';

class SegmentView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeView: "fields"
        };
        this.selectView = this.selectView.bind(this);
    }

    selectView(activeView) {
        this.setState({ activeView });
    }

    render() {

        if (this.props.segment == undefined)
            return <div>[No segment selected]</div>

        const viewSelector = (
            <div>
                <Nav bsStyle="tabs" activeKey={this.state.activeView} onSelect={this.selectView}>
                    <NavItem eventKey="fields">Fields</NavItem>
                    <NavItem eventKey="docs">Docs</NavItem>
                </Nav>
            </div>
        );


        if (this.state.activeView == "fields") {
            return (<FieldView viewSelector={viewSelector} segment={this.props.segment}
                               indexData={this.props.indexData} showAlert={this.props.showAlert}/>);
        }
        else {
            return <DocumentView viewSelector={viewSelector} showAlert={this.props.showAlert} segment={this.props.segment}/>;
        }

    }
}



SegmentView.propTypes = {
    segment: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number
    ]),
    indexData: PropTypes.object.isRequired,
    showAlert: PropTypes.func.isRequired
};

export default SegmentView;