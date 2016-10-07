var indexData = { "index" : "/path/to/index" };

var fieldsData = [
    "field1" , "field2", "field3"
];

var NavBar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Col = ReactBootstrap.Col;

var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;

var MarpleNav = React.createClass({
    render: function() {
        return (
            <NavBar>
                <NavBar.Header>
                    <NavBar.Brand>
                        <a href="#">Marple</a>
                    </NavBar.Brand>
                </NavBar.Header>
                <NavBar.Text pullRight>
                    Exploring lucene index: {this.props.indexData.indexpath}
                </NavBar.Text>
            </NavBar>
        )
    }
});

var Fields = React.createClass({
    render: function() {
        var fieldtabs = this.props.fields.map(function(f, i) {
            return (<Tab eventKey={i} title={f}>{f}</Tab>);
        });
        return (<Tabs position="left">{fieldtabs}</Tabs>);
    }
});

var Segments = React.createClass({
    render: function() {
        var segmenttab = this.props.segments.map(function(f, i) {
            var name = "Segment " + f.ord;
            return (<NavItem eventKey={i + 1}>{name}</NavItem>);
        });
        segmenttab.unshift(<NavItem eventKey={0}>All segments</NavItem>);
        return (<Nav bsStyle="pills" stacked onSelect={this.props.onSelect}>{segmenttab}</Nav>)
    }
});

var MarpleContent = React.createClass({
    getInitialState: function() {
        return {
            indexData: { indexpath: "loading", generation: -1, segments: []},
            view: (<Col md={10}>Select a segment</Col>)
        }
    },
    componentDidMount: function() {
        $.ajax({
            url: "http://localhost:8080/api/index",
            dataType: 'json',
            success: function(data) {
                var newState = this.state;
                newState.indexData = data;
                this.setState(newState);
            }.bind(this)
        });
    },
    selectSegment: function(segNumber) {
        this.state.view = (
            <Fields segment={segNumber}/>
        );
        this.setState(this.state);
    },
    render: function() {
        return (
            <div>
                <MarpleNav indexData={this.state.indexData}/>
                <Col md={2}>
                    <Segments segments={this.state.indexData.segments} onSelect={this.selectSegment}/>
                </Col>
                {this.state.view}
            </div>
        )
    }
});

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));