/*

Copyright (c) 2010 Nik Kalyani nik@kalyani.com http://www.kalyani.com

Modified work Copyright (c) 2016 Jon Burrows subwaymap@jonburrows.co.uk https://jonburrows.co.uk

Modified by meloidae 2018 to replace canvas with svg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function ($) {

    var plugin = {

        defaults: {
            debug: false,
            grid: false
        },

        options: {
    },

    identity: function (type) {
        if (type === undefined) type = "name";

        switch (type.toLowerCase()) {
            case "version": return "1.0.0"; break;
            default: return "subwayMap Plugin"; break;
        }
    },
    _stations: new MultikeyDict()
    ,
    _paths: new MultikeyDict()
    ,
    _lines: {} 
    ,
    _svg_canvas: {
    },
    _debug: function (s) {
        if (this.options.debug)
            this._log(s);
    },
    _log: function () {
        if (window.console && window.console.log)
            window.console.log('[subwayMap] ' + Array.prototype.join.call(arguments, ' '));
    },
    // _supportsCanvas: function () {
    //     var canvas = $("<canvas></canvas>");
    //     if (canvas[0].getContext)
    //         return true;
    //     else
    //         return false;
    // },
    _computePointFromAngle: function (x, y, r, angle) {
        let point = {}
        point.x = x + r * Math.cos(angle);
        point.y = y + r * Math.sin(angle);
        return point;
    },
    // _getCanvasLayer: function (el, type) {
    //     // this.layer++;

    //     // var svg_canvas = SVG("subway-map").size(this.options.pixelWidth, this.options.pixelHeight);
    //     // var canvas = $("<canvas style='position:absolute;z-Index:" + ((overlay ? 2000 : 1000) + this.layer) + "' width='" + this.options.pixelWidth + "' height='" + this.options.pixelHeight + "'></canvas>");
    //     //el.append(canvas);
    //     //return (canvas[0].getContext("2d"));
    // },
    _getSVGCanvas: function(el) {
        if (!(el in this._svg_canvas)) {
            //var layer = 1000; 
            //let svg_canvas = $("<svg style='position:absolute;z-Index:" + layer + "'></svg>");
            var svg_canvas = $("<svg style='position:absolute'></svg>");
            el.append(svg_canvas);
            svg_canvas = SVG.adopt(svg_canvas[0]).size(this.options.pixelWidth, this.options.pixelHeight);
            this._svg_canvas[el] = svg_canvas;
        } // if
        return this._svg_canvas[el];
    },
    _render: function (el) {

        //this.layer = -1;
        var rows = el.attr("data-rows");
        if (rows === undefined)
            rows = 10;
        else
            rows = parseInt(rows);

        var columns = el.attr("data-columns");
        if (columns === undefined)
            columns = 10;
        else
            columns = parseInt(columns);

        var scale = el.attr("data-cellSize");
        if (scale === undefined)
            scale = 100;
        else
            scale = parseInt(scale);

        var lineWidth = el.attr("data-lineWidth");
        if (lineWidth === undefined)
            lineWidth = 10;
        else
            lineWidth = parseInt(lineWidth);

        var textClass = el.attr("data-textClass");
        if (textClass === undefined) textClass = "";

        var grid = el.attr("data-grid");
        if ((grid === undefined) || (grid.toLowerCase() == "false"))
            grid = false;
        else
            grid = true;

        var legendId = el.attr("data-legendId");
        if (legendId === undefined) legendId = "";

        var gridNumbers = el.attr("data-gridNumbers");
        if ((gridNumbers === undefined) || (gridNumbers.toLowerCase() == "false"))
            gridNumbers = false;
        else
            gridNumbers = true;

        var reverseMarkers = el.attr("data-reverseMarkers");
        if ((reverseMarkers === undefined) || (reverseMarkers.toLowerCase() == "false"))
            reverseMarkers = false;
        else
            reverseMarkers = true;

        el.width(columns * scale);
        el.height(rows * scale);

        this.options.pixelWidth = columns * scale;
        this.options.pixelHeight = rows * scale;

        //el.css("width", this.options.pixelWidth);
        //el.css("height", this.options.pixelHeight);
        var self = this;
        var lineLabels = [];
        //var supportsCanvas = $("<canvas></canvas>")[0].getContext;

        var uls = $(el).children("ul");

        // Register all stations before rendering
        uls.each(function (index) {
            var ul = $(this);
            var lineLabel = $(ul).attr("data-label");
            if (lineLabel === undefined) {
                lineLabel = "Line " + index;
            } // if
            $(ul).children("li").each(function () {
                var coords = $(this).attr("data-coords");
                if (coords === undefined) coords = "";

                var marker = $(this).attr("data-marker");
                if (marker === undefined) marker = "";

                var label = $(this).text();
                if (label === undefined) label = "";
                 
                if (marker !== "" || label !== "") {
                    // console.log("marker " + marker);
                    if (self._stations.hasKey(coords)) {
                        if (label !== "") {
                            self._stations.addKey(coords, label);
                            self._stations.get(coords).name = label;
                        } // if
                    } else {
                        if (label !== "") {
                            self._stations.set([coords, label], new Station(label, coords, null));
                        } else {
                            self._stations.set([coords], new Station(label, coords, null));
                        } // else
                    } // else
                } // if
            });
        }); 

        // for (var obj in self._stations.storage) {
        //     if (obj.name === "") {
        //         console.log("Found an unnamed station");
        //     } // if
        // } // for

        uls.each(function (index) {
            var ul = $(this);

            var color = $(ul).attr("data-color");
            if (color === undefined) color = "#000000";

            var lineTextClass = $(ul).attr("data-textClass");
            if (lineTextClass === undefined) lineTextClass = "";

            var shiftCoords = $(ul).attr("data-shiftCoords");
            if (shiftCoords === undefined) shiftCoords = "";

            var shiftX = 0.00;
            var shiftY = 0.00;
            if (shiftCoords.indexOf(",") > -1) {
                shiftX = parseInt(shiftCoords.split(",")[0]) * lineWidth/scale;
                shiftY = parseInt(shiftCoords.split(",")[1]) * lineWidth/scale;
            }

            var lineLabel = $(ul).attr("data-label");
            if (lineLabel === undefined)
                lineLabel = "Line " + index;

            lineLabels[lineLabels.length] = {label: lineLabel, color: color};

            var nodes = [];
            $(ul).children("li").each(function () {

                var coords = $(this).attr("data-coords");
                if (coords === undefined) coords = "";

                var dir = $(this).attr("data-dir");
                if (dir === undefined) dir = "";

                var labelPos = $(this).attr("data-labelPos");
                if (labelPos === undefined) labelPos = "s";

                var marker = $(this).attr("data-marker");
                if (marker == undefined) marker = "";

                var markerShiftCoords = $(this).attr("data-markerShiftCoords");
                if (markerShiftCoords === undefined) markerShiftCoords = "";

                var markerInfo = $(this).attr("data-markerInfo");
                if (markerInfo == undefined) markerInfo = "";
                
                var dotted = $(this).attr("data-dotted-line");
                if (dotted == undefined) dotted = "false";
                
                var anchor = $(this).children("a:first-child");
                var label = $(this).text();
                if (label === undefined) label = "";

                var link = "";
                var title = "";
                if (anchor != undefined) {
                    link = $(anchor).attr("href");
                    if (link === undefined) link = "";
                    title = $(anchor).attr("title");
                    if (title === undefined) title = "";
                }

                self._debug("Coords=" + coords + "; Dir=" + dir + "; Link=" + link + "; Label=" + label + "; labelPos=" + labelPos + "; Marker=" + marker + "; Dotted=" + dotted);

                var x = "";
                var y = "";
                if (coords.indexOf(",") > -1) {
                    x = Number(coords.split(",")[0]) + (marker.indexOf("interchange") > -1 ? 0 : shiftX);
                    y = Number(coords.split(",")[1]) + (marker.indexOf("interchange") > -1 ? 0 : shiftY);
                } // if

                var markerShiftX = 0.00;
                var markerShiftY = 0.00;
                if (markerShiftCoords.indexOf(",") > -1) {
                    markerShiftX = Number(markerShiftCoords.split(",")[0]) * lineWidth/scale;
                    markerShiftY = Number(markerShiftCoords.split(",")[1]) * lineWidth/scale;
                } // if



                nodes[nodes.length] = { x: x, y: y, direction: dir, marker: marker, markerInfo: markerInfo,
                    link: link, title: title, label: label, labelPos: labelPos, dotted: dotted,
                    coords: coords, markerShift: { x: markerShiftX, y: markerShiftY }
                };
            });
            if (nodes.length > 0) {
                self._drawLine(el, scale, rows, columns, color, (lineTextClass != "" ? lineTextClass : textClass), lineWidth, nodes, reverseMarkers, lineLabel);
            } // if
            $(ul).remove();
        });
        // Construct line groups (paths grouped together as train lines)        
        for (var key in this._paths.storage) {
            if (this._paths.storage.hasOwnProperty(key)) {
                var path_arr = this._paths.storage[key];
                for (var i = 0; i < path_arr.length; i++) {
                    var path = path_arr[i];
                    var line_name = path.line_name;
                    if (!(line_name in this._lines)) {
                        var ctx = this._getSVGCanvas(el);
                        var group = ctx.group();
                        //console.log(path);
                        group.add(path.svg);
                        this._lines[line_name] = new Line(line_name, group, path.svg.attr('color'));
                    } else {
                        this._lines[line_name].group.add(path.svg); 
                    } // else
                } // for
            } // if
        } // for

        for (var key in this._lines) {
            if (this._lines.hasOwnProperty(key)) {
                this._lines[key].group.back();
            } // if
        } // for

        // Draw Grid
        if (grid) {
            var grid = this._drawGrid(el, scale, gridNumbers);
            grid.back();
        } // if

        if ((lineLabels.length > 0) && (legendId != "")) {
            var legend = $("#" + legendId);

            for (var line=0; line<lineLabels.length; line++)
                legend.append("<div><span style='float:left;width:100px;height:" + lineWidth + "px;background-color:" + lineLabels[line].color + "'></span>" + lineLabels[line].label + "</div>");
        } // if
    },
    _drawLine: function (el, scale, rows, columns, color, textClass, width, nodes, reverseMarkers, lineLabel) {

        var ctx = this._getSVGCanvas(el);
        //ctx.beginPath();
        //ctx.moveTo(nodes[0].x * scale, nodes[0].y * scale);
        var line = ctx.path().M(nodes[0].x * scale, nodes[0].y * scale);
        var markers = [];
        var lineNodes = [];
        var node;
        var start_name = this._stations.get(nodes[0].coords).name;
        var end_name = "";
        for(node = 0; node < nodes.length; node++) {
            if (nodes[node].marker.indexOf("@") != 0)
                lineNodes[lineNodes.length] = nodes[node];
        } // for
        for (var lineNode = 0; lineNode < lineNodes.length - 1; lineNode++) {
            var nextNode = lineNodes[lineNode + 1];
            var currNode = lineNodes[lineNode];

            if (this._stations.hasKey(nextNode.coords)) {
                end_name = this._stations.get(nextNode.coords).name;
            } // if

            // Correction for edges so lines are not running off campus
            var xCorr = 0;
            var yCorr = 0;
            if (nextNode.x == 0) xCorr = width / 2;
            if (nextNode.x == columns) xCorr = -1 * width / 2;
            if (nextNode.y == 0) yCorr = width / 2;
            if (nextNode.y == rows) yCorr = -1 * width / 2;

            var xVal = 0;
            var yVal = 0;
            var direction = "";

            var xEnd = 0;
            var yEnd = 0;

            var xDiff = Math.round(Math.abs(currNode.x - nextNode.x));
            var yDiff = Math.round(Math.abs(currNode.y - nextNode.y));
            if ((xDiff == 0) || (yDiff == 0)) {
                // Horizontal or Vertical
                //ctx.lineTo((nextNode.x * scale) + xCorr, (nextNode.y * scale) + yCorr);
                xEnd = (nextNode.x * scale) + xCorr; 
                yEnd = (nextNode.y * scale) + yCorr;
                line = line
                    .L(xEnd, yEnd);
            } else if ((xDiff == 1) && (yDiff == 1)) {
                // 90 degree turn
                if (nextNode.direction != "")
                    direction = nextNode.direction.toLowerCase();
                switch (direction) {
                    case "s": xVal = 0; yVal = scale; break;
                    case "e": xVal = scale; yVal = 0; break;
                    case "w": xVal = -1 * scale; yVal = 0; break;
                    default: xVal = 0; yVal = -1 * scale; break;
                }
                
                //ctx.quadraticCurveTo((currNode.x * scale) + xVal, (currNode.y * scale) + yVal,
                //                                (nextNode.x * scale) + xCorr, (nextNode.y * scale) + yCorr);
                xEnd = (nextNode.x * scale) + xCorr;
                yEnd = (nextNode.y * scale) + yCorr;
                line = line
                    .Q({ x: (currNode.x * scale) + xVal, y: (currNode.y * scale) + yVal },
                        { x: xEnd, y: yEnd });
            } else if (xDiff == yDiff) {
                // Symmetric, angular with curves at both ends
                if (nextNode.x < currNode.x) {
                    if (nextNode.y < currNode.y)
                        direction = "nw";
                    else
                        direction = "sw";
                } else {
                    if (nextNode.y < currNode.y)
                        direction = "ne";
                    else
                        direction = "se";
                } // else
                var dirVal = 1;
                switch (direction) {
                    case "nw": xVal = -1 * (scale / 2); yVal = 1; dirVal = 1; break;
                    case "sw": xVal = -1 * (scale / 2); yVal = -1; dirVal = 1; break;
                    case "se": xVal = (scale / 2); yVal = -1; dirVal = -1; break;
                    case "ne": xVal = (scale / 2); yVal = 1; dirVal = -1; break;
                } // switch
                this._debug((currNode.x * scale) + xVal + ", " + (currNode.y * scale) + "; " + (nextNode.x + (dirVal * xDiff / 2)) * scale + ", " +
                (nextNode.y + (yVal * xDiff / 2)) * scale);
                line = line
                    .C(
                        { x: (currNode.x * scale) + xVal, y: (currNode.y * scale) },
                        { x: (currNode.x * scale) + xVal, y: (currNode.y * scale)},
                        { x: (nextNode.x + (dirVal * xDiff / 2)) * scale, y: (nextNode.y + (yVal * xDiff / 2)) * scale});
                xEnd = nextNode.x * scale;
                yEnd = nextNode.y * scale;
                line = line
                    .C(
                        { x: (nextNode.x * scale) + (dirVal * scale / 2), y: (nextNode.y) * scale },
                        { x: (nextNode.x * scale) + (dirVal * scale / 2), y: (nextNode.y) * scale },
                        { x: xEnd, y: yEnd });
                // ctx.bezierCurveTo(
                //        (currNode.x * scale) + xVal, (currNode.y * scale),
                //        (currNode.x * scale) + xVal, (currNode.y * scale),
                //        (nextNode.x + (dirVal * xDiff / 2)) * scale, (nextNode.y + (yVal * xDiff / 2)) * scale);
                // ctx.bezierCurveTo(
                //         (nextNode.x * scale) + (dirVal * scale / 2), (nextNode.y) * scale,
                //         (nextNode.x * scale) + (dirVal * scale / 2), (nextNode.y) * scale,
                //         nextNode.x * scale, nextNode.y * scale);
            } else {
                xEnd = nextNode.x * scale;
                yEnd = nextNode.y * scale;
                line = line
                    .L( xEnd, yEnd);
                // ctx.lineTo(nextNode.x * scale, nextNode.y * scale);
            } // else
            if (end_name !== "") {
                line = line.fill('none').stroke({color: color, width: width });
                line.addClass("path");
                line.back();
                if (!(this._paths.hasKey(start_name + "-" + end_name))) {
                    this._paths.set([start_name + "-" + end_name, end_name + "-" + start_name],
                        [ new Path(start_name + "-" + end_name, lineLabel, line) ]);
                } else {
                    this._paths.get(start_name + "-" + end_name).push(new Path(start_name + "-" + end_name, lineLabel, line));
                } // else
                start_name = end_name;
                end_name = "";
                line = ctx.path()
                   .M(xEnd, yEnd); 
            } // end_name
        } // for

        // if (nodes[0].dotted == "true") { ctx.setLineDash([5, 5]); }
        //ctx.strokeStyle = color;
        // ctx.lineWidth = width;
        // ctx.stroke();
        // line = line.fill('none').stroke({color: color, width: width });
        // line.addClass("path");
        // line.back();

        ctx = this._getSVGCanvas(el);
        for (node = 0; node < nodes.length; node++) {
            this._drawMarker(el, ctx, scale, color, textClass, width, nodes[node], reverseMarkers);
        }
        return line;
    },
    _drawMarker: function (el, ctx, scale, color, textClass, width, data, reverseMarkers) {

        if (data.label == "") return;
        if (data.marker == "") data.marker = "station";

        // Coords in terms of grid
        var coords = data.coords;
        // Coords for shifting marker
        var shiftX = data.markerShift.x;
        var shiftY = data.markerShift.y;
        // Scale coordinates for rendering
        var x = (data.x + shiftX) * scale
        var y = (data.y + shiftY) * scale;

        // Keep it simple -- black on white, or white on black
        var fgColor = "#000000";
        var bgColor = "#ffffff";
        if (reverseMarkers)
        {
            fgColor = "#ffffff";
            bgColor = "#000000";
        }

        // Render station and interchange icons
        // ctx.strokeStyle = fgColor;
        // ctx.fillStyle = bgColor;
        // ctx.beginPath();
        let arc = ctx;
        let line_width = 1;
        switch(data.marker.toLowerCase()) {
            case "interchange":
            case "@interchange":
                line_width = 4;
                ctx.lineWidth = width;
                if (data.markerInfo == "") {
                    // ctx.arc(x, y, width * 0.7, 0, Math.PI * 2, true);
                    let radius = width * 0.7 + line_width / 2;
                    arc = arc.path()
                        .M(x, y)
                        .m(-radius, 0)
                        .a(radius, radius, 0, 1, 1, (radius * 2), 0)
                        .a(radius, radius, 0, 1, 1, -(radius * 2), 0);
                } else {
                    var mDir = data.markerInfo.substr(0,1).toLowerCase();
                    var mSize = parseInt(data.markerInfo.substr(1,10));
                    if (((mDir == "v") || (mDir == "h")) && (mSize > 1)) {
                        if (mDir == "v") {
                            line_width = 4;
                            let radius = width * 0.7 + line_width / 2;
                            let point1 = this._computePointFromAngle(0, 0, radius, 300 * Math.PI / 180);
                            let point2 = this._computePointFromAngle(0, 0, radius, 60 * Math.PI / 180);
                            point1.x = Math.abs(point1.x);
                            point1.y = Math.abs(point1.y);
                            point2.x = Math.abs(point2.x);
                            point2.y = Math.abs(point2.y);
                            // ctx.arc(x, y, width * 0.7,290 * Math.PI/180, 250 * Math.PI/180, false);
                            // ctx.arc(x, y-(width*mSize), width * 0.7,110 * Math.PI/180, 70 * Math.PI/180, false);

                            arc = arc.path()
                                .M(x, y)
                                .m(-point1.x, point1.y)
                                .a(radius, radius, 0, 1, 1, (2 * point1.x), 0)
                                .l(0, width * mSize - point1.y - point2.y)
                                .a(radius, radius, 0, 1, 1, -(2 * point1.x), 0)
                                .Z();
                        } else {
                            line_width = 4;
                            let radius = width * 0.7 +  line_width / 2;
                            let point1 = this._computePointFromAngle(0, 0, radius, 30 * Math.PI / 180);
                            let point2 = this._computePointFromAngle(0, 0, radius, 150 * Math.PI / 180); 
                            // ctx.arc(x, y, width * 0.7,20 * Math.PI/180, 340 * Math.PI/180, false);
                            // ctx.arc(x+(width*mSize), y, width * 0.7,200 * Math.PI/180, 160 * Math.PI/180, false);
                            arc = arc.path()
                                .M(x, y)
                                .m(point1.x, -point1.y)
                                .a(radius, radius, 0, 1, 0, 0, (2 * point1.y))
                                .l(width * mSize - point1.x + point2.x, 0)
                                .a(radius, radius, 0, 1, 0, 0, -(2 * point1.y))
                                .Z();
                                //.l(-(width * mSize - point1.x + point2.x), 0);
                                
                            // arc = arc
                            //     .M(x + (width * mSize), y)
                            //     .m(
                        } // else
                    } else {
                        // ctx.arc(x, y, width * 0.7, 0, Math.PI * 2, true);
                        let radius = width * 0.7 + line_width / 2;
                        arc = arc.path()
                            .M(x, y)
                            .m(-radius, 0)
                            .a(radius, radius, 0, 1, 1, (radius * 2), 0)
                            .a(radius, radius, 0, 1, 1, -(radius * 2), 0);
                    } // else
                } // else
                break;
            case "station":
            case "@station":
                //ctx.lineWidth = width/2;
                // ctx.arc(x, y, width/2, 0, Math.PI * 2, true);
                line_width = 2;
                let radius = width / 2 + line_width / 2;
                arc = arc.path()
                    .M(x, y)
                    .m(-radius, 0)
                    .a(radius, radius, 0, 1, 1, (radius * 2), 0)
                    .a(radius, radius, 0, 1, 1, -(radius * 2), 0);
                break;
        } // switch
        //ctx.closePath();
        //ctx.stroke();
        //ctx.fill();
        arc = arc.stroke({ color: fgColor, width: line_width }).fill(bgColor);
        arc.addClass('marker');
        arc.front();

        // Render text labels and hyperlinks
        var pos = "";
        var offset = width + 4;
        var topOffset = 0;
        var centerOffset = "-50px";
        switch(data.labelPos.toLowerCase()) {
            case "n":
                pos = "text-align: center; margin: 0 0 " + offset + "px " + centerOffset;
                topOffset = offset * 2;
                break;
            case "w":
                pos = "text-align: right; margin:0 " + offset + "px 0 -" + (100 + offset) + "px";
                topOffset = offset;
                break;
            case "e":
                pos = "text-align: left; margin:0 0 0 " + offset + "px";
                topOffset = offset;
                break;
            case "s":
                pos = "text-align: center; margin:" + offset + "px 0 0 " + centerOffset;
                break;
            case "se":
                pos = "text-align: left; margin:" + offset + "px 0 0 " + offset + "px";
                break;
            case "ne":
                pos = "text-align: left; padding-left: " + offset + "px; margin: 0 0 " + offset + "px 0";
                topOffset = offset * 2;
                break;
            case "sw":
                pos = "text-align: right; margin:" + offset + "px 0 0 -" + (100 + offset) + "px";
                topOffset = offset;
                break;
            case "nw":
                pos = "text-align: right; margin: -" + offset + "px 0 0 -" + (100 + offset) + "px";
                topOffset = offset;
                break;
            case "sv":
                //pos = "text-align: center; margin:" + offset + "px 0 0 " + centerOffset; 
                //pos = "text-align: center; margin: 0 0 0 " + centerOffset; 
                //textClass += " vertical";
                break;
        }
        var style = (textClass != "" ? "class='" + textClass + "' " : "") 
            + "style='"
            // + (textClass == "" ? "font-size:8pt;font-family:Verdana,Arial,Helvetica,Sans Serif;text-decoration:none;" : "")
            + "width:100px;"
            //+ "width: 40px;"
            //+ (pos != "" ? pos : "") + ";position:absolute;top:" + (y + el.offset().top - (topOffset > 0 ? topOffset : 0)) + "px;left:" + (x + el.offset().left) + "px;z-index:3000;'";
            + (pos != "" ? pos : "") + ";position:absolute;top:" + (y) + "px;left:" + (x) + "px;z-index:1000;'";
        var marker_tag;
        if (data.link != "")
            marker_tag = $("<a " + style + " title='" + data.title.replace(/\\n/g,"<br />") + "' href='" + data.link + "' target='_new'>" + data.label.replace(/\\n/g,"<br />") + "</span>");
        else
            marker_tag = $("<span " + style + ">" + data.label.replace(/\\n/g,"<br />") + "</span>");
        marker_tag.appendTo(el);
        // if (!(this._stations.hasKey(data.label))) {
        //     this._stations.set([data.label, coords], new Station(data.label, coords, arc)); 
        // } // if
        //console.log(data.label);
        this._stations.get(data.label).setSVG(arc);
        this._stations.get(data.label).setTag(marker_tag);
        return arc;

    },
    _drawGrid: function (el, scale, gridNumbers) {

        var ctx = this._getSVGCanvas(el);
        // ctx.fillStyle = "#000";
        // ctx.beginPath();
        let grid_path = ctx.path();
        var counter = 0;
        for (var x = 0.5; x < this.options.pixelWidth; x += scale) {
            if (gridNumbers) {
                //ctx.moveTo(x, 0);
                //ctx.fillText(counter++, x-15, 10);
                var text = ctx.text("" + counter++).stroke("#000").move(x - 15, 10);
                text.front();
            }
            //ctx.moveTo(x, 0);
            //ctx.lineTo(x, this.options.pixelHeight);
            grid_path = grid_path
                .M(x, 0)
                .L(x, this.options.pixelHeight);
        } // for
        //ctx.moveTo(this.options.pixelWidth - 0.5, 0);
        //ctx.lineTo(this.options.pixelWidth - 0.5, this.options.pixelHeight);
        grid_path = grid_path
            .M(this.options.pixelWidth - 0.5, 0)
            .L(this.options.pixelWidth -0.5, this.options.pixelHeight);

        counter = 0;
        for (var y = 0.5; y < this.options.pixelHeight; y += scale) {
            if (gridNumbers) {
                //ctx.moveTo(0, y);
                //ctx.fillText(counter++, 0, y-15);
                var text = ctx.text("" + counter++).stroke("#000").move(0, y - 15);
                text.front();
            }
            // ctx.moveTo(0, y);
            // ctx.lineTo(this.options.pixelWidth, y);
            gird_path = grid_path
                .M(0, y)
                .L(this.options.pixelWidth, y);
        } // for
        // ctx.moveTo(0, this.options.pixelHeight - 0.5);
        // ctx.lineTo(this.options.pixelWidth, this.options.pixelHeight - 0.5);
        // ctx.strokeStyle = "#eee";
        // ctx.lineWidth = 1;
        // ctx.stroke();
        // ctx.fill();
        // ctx.closePath();
        grid_path = grid_path
            .M(0, this.options.pixelHeight - 0.5)
            .L(this.options.pixelWidth, this.options.pixelHeight - 0.5);
        grid_path = grid_path.fill("#000").stroke({ color: "#eee", width: 1 });
        grid_path.addClass("grid");
        return grid_path;
    },
};

var methods = {

    init: function (options) {

        plugin.options = $.extend({}, plugin.defaults, options);
        res = [];
        // iterate and reformat each matched element
        this.each(function (index) {

            plugin.options = $.meta
                                    ? $.extend(plugin.options, $(this).data())
                                    : plugin.options;

            plugin._debug("BEGIN: " + plugin.identity() + " for element " + index);

            plugin._render($(this));
            res.push({
                stations: plugin._stations,
                lines: plugin._lines,
                paths: plugin._paths
            });

            plugin._debug("END: " + plugin.identity() + " for element " + index);
        });
        return res;

    },
    drawLine: function (data) {
        plugin._drawLine(data.element, data.scale, data.rows, data.columns, data.color, data.width, data.nodes, data.label);
    }
};

$.fn.subwayMap = function (method) {

    // Method calling logic
    if (methods[method]) {
        var ret = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        return ret;
    } else if (typeof method === 'object' || !method) {
        var ret = methods.init.apply(this, arguments);
        return ret;
    } else {
        $.error('Method ' + method + ' does not exist on jQuery.tooltip');
    }

};

})(jQuery);
