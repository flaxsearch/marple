import React, { PropTypes } from 'react';
import { loadPointsData } from '../data';

const LABELSTYLE = {
    width:'140px',
    color: 'gray'
};


// one node of the points tree (collapsed or expanded)
class TreeNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return "";
    }
}

// the points component
class Points extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.fetchRootData = this.fetchRootData.bind(this);
        this.onError = this.onError.bind(this);
    }

    onError(errmsg) {
        if (errmsg.includes('No points data for field')) {
            this.setState({ data: undefined });
        }
        else {
            this.props.showAlert(errmsg, true);
        }
    }

    componentDidMount() {
        this.fetchRootData(this.props.segment, this.props.field);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.field !== this.props.field ||
            newProps.segment !== this.props.segment)
        {
            this.fetchRootData(newProps.segment, newProps.field);
        }
    }

    fetchRootData(segment, field) {
        if (segment === "") {
            this.setState({ data: null });
        } else {
            loadPointsData(segment, field,
                data => {
                    this.setState({ data });
                },
                error => {
                    this.onError(error);
                }
            );
        }
    }

    render() {
        const s = this.state;
        const p = this.props;

        if (p.segment === "") {
            return <div style={{margin:'14px'}}>
                Select a segment to display points</div>;
        }

        if (s.data === undefined) {
            return <div style={{margin:'14px'}}>
                Field <em>{ p.field }</em> has no points data</div>;
        }

        return <div>
            <table style={{width:'100%', border:'0px', margin:'7px 0px 7px 14px'}}>
                <tbody>
                <tr>
                    <td style={LABELSTYLE}>Dimensions:</td>
                    <td style={{width:'auto'}}>{s.data && s.data.numDims}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Bytes per dimension:</td>
                    <td style={{width:'auto'}}>{s.data && s.data.bytesPerDim}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Min:</td>
                    <td style={{width:'auto'}}>{s.data && s.data.nodes.min}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Max:</td>
                    <td style={{width:'auto'}}>{s.data && s.data.nodes.max}</td>
                </tr>
                </tbody>
            </table>
        </div>;
    }
}

Points.propTypes = {
    segment: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number
    ]),
    field: PropTypes.string.isRequired,
    indexData: PropTypes.object.isRequired,
    showAlert: PropTypes.func.isRequired
};

export default Points;
