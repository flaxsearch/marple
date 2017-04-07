import React, { PropTypes } from 'react';
import { loadPointsData } from '../data';

const LABELSTYLE = {
    width:'140px',
    color: 'gray'
};

const TREESTYLE = {
    marginTop: '10px',
    marginLeft: '15px'
};

const TOGGLESTYLE = {
    fontSize: '11px',
    paddingRight: '5px',
    color: 'grey'
};


// one node of the points tree (collapsed or expanded)
const TreeNode = props => {
    let content = null;
    // if this node is collapsed, don't get the content
    if (props.collapsed.has(props.id) == false) {

        if (props.values && props.values.length > 0) {
            // it's a leaf node
            content = props.values.map(v =>
                <div key={v.doc}>doc: {v.doc} value: {v.bytes}</div>
            );
        }
        else if (props.children && props.children.length > 0) {
            content = props.children.map(n =>
                <TreeNode id={n.id} key={n.id} min={n.min} max={n.max}
                          values={n.values} children={n.children}
                          toggleTreeNode={props.toggleTreeNode}
                          collapsed={props.collapsed} />
            );
        }
    }

    const toggle = content ?
      'glyphicon-triangle-bottom' : 'glyphicon-triangle-right';

    return <div>
        <div>
            <a href="#" onClick={e => {
                props.toggleTreeNode(props.id, content == null)
            }}><span className={'glyphicon ' + toggle}
                    style={TOGGLESTYLE}></span>
                ({props.id}) [{props.min} - {props.max}]</a>
        </div>
        <div style={{ marginLeft: "20px" }}>
            {content}
        </div>
    </div>;
};

TreeNode.propTypes = {
    id: PropTypes.number.isRequired,
    min: PropTypes.string.isRequired,
    max: PropTypes.string.isRequired,
    values: PropTypes.array,
    children: PropTypes.array,
    collapsed: PropTypes.object.isRequired,
    toggleTreeNode: PropTypes.func.isRequired
};

function findNodeWithId(node, id) {
    if (node.id == id) {
        return node;
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            const cnode = findNodeWithId(node.children[i], id);
            if (cnode !== undefined) {
                return cnode;
            }
        }
    }
    return undefined;
}

// the points component
class Points extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null, collapsed: new Set() };

        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.fetchRootData = this.fetchRootData.bind(this);
        this.toggleTreeNode = this.toggleTreeNode.bind(this);
        this.setChildren = this.setChildren.bind(this);
        this.setValues = this.setValues.bind(this);
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
            loadPointsData(segment, field, 0,
                data => {
                    this.setState({ data });
                },
                error => {
                    this.onError(error);
                }
            );
        }
    }

    toggleTreeNode(nodeId, isCollapsed) {
        if (isCollapsed) {
            if (this.state.collapsed.has(nodeId)) {
                const collapsed = new Set(this.state.collapsed);
                collapsed.delete(nodeId);
                this.setState({ collapsed });
            }
            else {
                loadPointsData(this.props.segment, this.props.field, nodeId,
                    data => {
                        if (data.root.children) {
                            this.setChildren(nodeId, data.root.children);
                        }
                        else {
                            this.setValues(nodeId, data.root.values);
                        }
                    },
                    error => {
                        this.onError(error);
                    }
                );
            }
        }
        else {
            const collapsed = new Set(this.state.collapsed);
            collapsed.add(nodeId);
            this.setState({ collapsed });
        }
    }

    setChildren(nodeId, children) {
        // clone the state
        const newData = JSON.parse(JSON.stringify(this.state.data));
        const node = findNodeWithId(newData.root, nodeId);
        if (node) {
            node.children = children;
            this.setState({ data: newData });
        }
        else {
            console.log('ERROR could not find node with ID ' + nodeId)
        }
    }

    setValues(nodeId, values) {
        // clone the state
        const newData = JSON.parse(JSON.stringify(this.state.data));
        const node = findNodeWithId(newData.root, nodeId);
        if (node) {
            node.values = values;
            this.setState({ data: newData });
        }
        else {
            console.log('ERROR could not find node with ID ' + nodeId)
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

        if (s.data === null) {
            return <div></div>;
        }

        return <div>
            <table style={{width:'100%', border:'0px', margin:'7px 0px 7px 14px'}}>
                <tbody>
                <tr>
                    <td style={LABELSTYLE}>Dimensions:</td>
                    <td style={{width:'auto'}}>{s.data.numDims}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Bytes per dimension:</td>
                    <td style={{width:'auto'}}>{s.data.bytesPerDim}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Min:</td>
                    <td style={{width:'auto'}}>{s.data.root.min}</td>
                </tr>
                <tr>
                    <td style={LABELSTYLE}>Max:</td>
                    <td style={{width:'auto'}}>{s.data.root.max}</td>
                </tr>
                </tbody>
            </table>
            <div style={TREESTYLE}>
                <TreeNode id={s.data.root.id}
                          min={s.data.root.min} max={s.data.root.max}
                          values={s.data.root.values} children={s.data.root.children}
                          collapsed={s.collapsed} toggleTreeNode={this.toggleTreeNode} />
            </div>
        </div>;
    }
}

Points.propTypes = {
    segment: PropTypes.oneOfType([
        PropTypes.string, PropTypes.number
    ]),
    field: PropTypes.string.isRequired,
    showAlert: PropTypes.func.isRequired
};

export default Points;
