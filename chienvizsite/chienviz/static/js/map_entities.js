var white = "#eeeeee";

function Station(name, coords, svg) {
    var self = this;
    this.name = name;
    this.coords = coords; 
    this.ids = [];
    if (!(svg == null)) {
        this.svg = svg;
        this.svg.on('mouseover', function() {
            console.log("mouseover: " + self.name);
            // this.fill('#ee0000');
            self.addClass('opaque');
        });
        this.svg.on('mouseout', function() {
            console.log("mouseout: " + self.name);
            // this.fill('#ee0000');
            self.removeClass('opaque');
        });
        this.svg.on('click', function() {
            self.show_tweets();
        });
    } // if
    
} // Station

Station.prototype.setSVG = function(svg) {
    var self = this;
    this.svg = svg;
    this.svg.off();
    this.svg.on('mouseover', function() {
        console.log("mouseover: " + self.name);
        self.addClass('opaque');
        // this.fill('#ee0000');
    });
    this.svg.on('mouseout', function() {
        console.log("mouseout: " + self.name);
        self.removeClass('opaque');
        // this.fill('#ee0000');
    });
    this.svg.on('click', function() {
        self.show_tweets();
    });
}; // Station.setSVG

Station.prototype.setTag = function(tag) {
    var self = this;
    this.tag = tag;
    tag.on('mouseover', function() {
        self.addClass('opaque');
    });
    tag.on('mouseout', function() {
        self.removeClass('opaque');
    });
    tag.on('click', function() {
        self.show_tweets();
    });
};

Station.prototype.addClass = function(class_name) {
    this.svg.addClass(class_name);
    this.tag.addClass(class_name);
};

Station.prototype.removeClass = function(class_name) {
    this.svg.removeClass(class_name);
    this.tag.removeClass(class_name);
};

function Path(name, line_name, svg) {
    this.name = name;
    this.line_name = line_name;
    var self = this;
    this.ids = [];
    if (!(svg == null)) {
        this.svg = svg;
        this.color = this.svg.attr('stroke');
//        console.log(this.color);
        this.svg.on('mouseover', function() {
            console.log("mouseover: (" + self.line_name + ") " + self.name);
            //this.animate().stroke("#eee").loop();
            this.addClass('opaque');
        });
        this.svg.on('mouseout', function() {
            console.log("mouseout: (" + self.line_name + ") " + self.name);
            //this.finish();
            //this.stroke(self.color);
            this.removeClass('opaque');
        });
    } // if
} // Path

Path.prototype.setSVG = function(svg) {
    this.svg = svg;
    var self = this;
    this.color = this.svg.attr('stroke');
    this.svg.off();
    this.svg.on('mouseover', function() {
        console.log("mouseover: (" + self.line_name + ") " + self.name);
        //this.animate().stroke("#eee").loop();
        this.addClass('opaque');
    });
    this.svg.on('mouseout', function() {
        console.log("mouseout: (" + self.line_name + ") " + self.name);
        //this.finish();
        //this.stroke(self.color);
        this.removeClass('opaque');
    });
}; // Station.setSVG

function Line(name, group, color) {
    this.name = name;
    this.group = group;
    this.color = color;
    this.animated = false;
//    this.ids = [];
}

Line.prototype.toggleAnimation = function() {
    if (this.animated) {
        this.stop();
    } else {
        this.animate();
    } // else
};

Line.prototype.animate = function() {
    if (this.animated === false) {
        console.log("Animate " + this.name);
        // for (var i = 0; i < this.svgs.length; i++) {
        //     this.svgs[i].animate().stroke(white).loop();
        // } // for
        this.group.addClass('blinking');
        this.animated = true;
    } // if
};

Line.prototype.stop = function() {
    if (this.animated) {
        console.log("Stop Animating " + this.name);
        // for (var i = 0; i < this.svgs.length; i++) {
        //     this.svgs[i].finish();
        //     this.storke(this.color);
        // } // for 
        this.group.removeClass('blinking');
        this.animated = false;
    } // if
};
