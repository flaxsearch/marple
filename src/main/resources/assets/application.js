var indexData = { "index" : "/path/to/index" };

var fieldsData = [
    "field1" , "field2", "field3"
];

var NavBar = ReactBootstrap.Navbar;
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
            return (<Tab eventKey={i + 1} title={name}>Segment {f.ord}</Tab>);
        });
        segmenttab.unshift(<Tab eventKey={0} title="All segments">All segments</Tab>);
        return (<Tabs position="left">{segmenttab}</Tabs>);
    }
});

var MarpleContent = React.createClass({
    getInitialState: function() {
        return { indexpath: "loading", generation: -1, segments: []}
    },
    componentDidMount: function() {
        $.ajax({
            url: "http://localhost:8080/api/index",
            dataType: 'json',
            success: function(data) {
                this.setState(data);
            }.bind(this)
        });
    },
    render: function() {
        return (<div>
                    <MarpleNav indexData={this.state}/>
                    <Segments segments={this.state.segments}/>
                </div>)
    }
});

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));