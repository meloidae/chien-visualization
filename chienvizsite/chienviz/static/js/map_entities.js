var white = "#eeeeee";

function Station(name, coords, svg) {
    var self = this;
    this.name = name;
    this.coords = coords; 
    this.notified = false;
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
        if (self.notified) {
            self.show_tweets();
        } // if
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
        if (self.notified) {
            self.show_tweets();
        } // if
    });
};

Station.prototype.addClass = function(class_name) {
    this.svg.addClass(class_name + "_stroke");
    this.tag.addClass(class_name);
};

Station.prototype.removeClass = function(class_name) {
    this.svg.removeClass(class_name + "_stroke");
    this.tag.removeClass(class_name);
};

Station.prototype.show_tweets = function() {
    tweet_ids = tweet_ids_dict[this.name];
    var dfd_arr = [];
    for (var i = 0; i < tweet_ids.length; i++) {
        var id_str = tweet_ids[i];
        if (!(id_str in tweet_htmls)) {
            var dfd = $.ajax({
                url: oembed_url,
                type: 'GET',
                data: {
                    'url': (status_base_url + id_str),
                    'max_width': 325
                },
                dataType: 'jsonp',
            });
            dfd_arr.push(dfd);
        } // if
    } // for
    $.when.apply($, dfd_arr).done(function() {
        for (var i = 0; i < arguments.length; i++) {
            var status = arguments[i][1];
            if (status == 'success') {
                var json = arguments[i][0];
                var html = json.html;
                var id_str = /[^/]*$/.exec(json.url)[0];
                tweet_htmls[id_str] = html;
            } // if
        } // for
        var tweet_stack = "";
        for (var i = 0; i < tweet_ids.length; i++) {
            tweet_stack += tweet_htmls[tweet_ids[i]]; 
        } // for
        $("#sidebar-content").innerHTML = tweet_stack;
    });
};

Station.prototype.notify = function() {
    this.notified = true;
    this.svg.addClass('highlight');
};

Station.prototype.silence = function() {
    this.notified = false;
    this.svg.removeClass('highlight');
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
    this.notified = false;
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

Line.prototype.notify = function() {
    this.notified = true;
};

Line.prototype.silence = function() {
    this.notified = false;
};


