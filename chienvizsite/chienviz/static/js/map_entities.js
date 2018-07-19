function Station(name, coords, svg) {
    var self = this;
    this.name = name;
    this.coords = coords; 
    if (!(svg == null)) {
        this.svg = svg;
        this.svg.on('mouseover', function() {
            console.log("mouseover: " + self.name);
            // this.fill('#ee0000');
        });
    } // if
    
} // Station

Station.prototype.setSVG = function(svg) {
    var self = this;
    this.svg = svg;
    this.svg.off();
    this.svg.on('mouseover', function() {
        console.log("mouseover: " + self.name);
        // this.fill('#ee0000');
    });
}; // Station.setSVG

function Path(name, line_name, svg) {
    this.name = name;
    this.line_name = line_name;
    var self = this;
    if (!(svg == null)) {
        this.svg = svg;
        this.color = this.svg.attr('stroke');
        console.log(this.color);
        this.svg.on('mouseover', function() {
            console.log("mouseover: (" + self.line_name + ") " + self.name);
            this.animate().stroke("#eee").loop();
        });
        this.svg.on('mouseout', function() {
            console.log("mouseout: (" + self.line_name + ") " + self.name);
            this.finish();
            this.stroke(self.color);
        });
    } // if
} // Path

Path.prototype.setSVG = function(svg) {
    this.svg = svg;
    var self = this;
    this.color = this.svg.attr('stroke');
    console.log(this.color);
    this.svg.off();
    this.svg.on('mouseover', function() {
        console.log("mouseover: (" + self.line_name + ") " + self.name);
        this.animate().stroke("#eee").loop();
    });
    this.svg.on('mouseout', function() {
        console.log("mouseout: (" + self.line_name + ") " + self.name);
        this.finish();
        this.stroke(self.color);
    });
}; // Station.setSVG

function Line(name, group) {
    this.name = name;
    this.group = group;
}
