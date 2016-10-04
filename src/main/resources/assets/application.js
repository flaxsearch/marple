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
                    Exploring lucene index: {indexData.index}
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

var MarpleContent = React.createClass({
    render: function() {
        return (<div><MarpleNav/><Fields fields={fieldsData}/></div>)
    }
});

ReactDOM.render(<MarpleContent/>, document.getElementById("content"));