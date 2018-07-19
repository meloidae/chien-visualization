// Checks d/m/y
function isValidDate(s) {
  var bits = s.split('/');
  var d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && (d.getMonth() + 1) == bits[1];
}

var info = $(".subway-map").subwayMap({ debug: true });
var stations = info.stations;
var lines = info.lines;
var paths = info.paths;

// Generate options for time select
var start_year = 2018;
var jst_offset_minutes = 9 * 60;
var half_hour_in_ms = 30 * 60 * 1000;


// Compute today's date info
var now = Date.now();
var time = new Date(now);
var utc_offset = time.getTimezoneOffset();
var ms_to_jst = (utc_offset + jst_offset_minutes) * 60 * 1000;
var time_jst_to = new Date(now + ms_to_jst);
var time_jst_from = new Date(now + ms_to_jst - half_hour_in_ms);
var limit = time_jst_to.getFullYear() - start_year + 1;

console.log("Timezone Offset: " + utc_offset);
console.log("Adjust Offset: " + ms_to_jst);
console.log("From " + time_jst_from.toString());
console.log("To " + time_jst_to.toString());


// Set up select options for time intervals
var select_to = $("select#year_to");
var select_from = $("select#year_from");
for (var i = 0; i < limit; i++) {
    var year = start_year + i;
    select_to.append($("<option>", {
        value: year,
        text: "" + year,
        selected: year == time_jst_to.getFullYear() 
    }));
    select_from.append($("<option>", {
        value: year,
        text: "" + year,
        selected: year == time_jst_from.getFullYear() 
    }));
} // for

var select_to = $("select#month_to");
var select_from = $("select#month_from");
for (var i = 0; i < 12; i++) {
    var month = i + 1; 
    select_to.append($("<option>", {
        value: i,
        text: "" + month,
        selected: i == time_jst_to.getMonth() 
    }));
    select_from.append($("<option>", {
        value: i,
        text: "" + month,
        selected: i == time_jst_from.getMonth() 
    }));
} // for

var select_to = $("select#date_to");
var select_from = $("select#date_from");
for (var i = 0; i < 31; i++) {
    var date = i + 1; 
    select_to.append($("<option>", {
        value: date,
        text: "" + date,
        selected: date == time_jst_to.getDate() 
    }));
    select_from.append($("<option>", {
        value: date,
        text: "" + date,
        selected: date == time_jst_from.getDate() 
    }));
} // for

var select_to = $("select#hours_to");
var select_from = $("select#hours_from");
for (var i = 0; i < 24; i++) {
    var hours = i;
    select_to.append($("<option>", {
        value: hours,
        text: "" + hours,
        selected: hours == time_jst_to.getHours() 
    }));
    select_from.append($("<option>", {
        value: hours,
        text: "" + hours,
        selected: hours == time_jst_from.getHours() 
    }));
} // for

var select_to = $("select#minutes_to");
var select_from = $("select#minutes_from");
for (var i = 0; i < 12; i++) {
    var minutes = i * 5;
    var minutes_to = parseInt(time_jst_to.getMinutes() / 5) * 5;
    var minutes_from = parseInt(time_jst_from.getMinutes() / 5) * 5;
    select_to.append($("<option>", {
        value: minutes,
        text: "" + minutes,
        selected: minutes == minutes_to 
    }));
    select_from.append($("<option>", {
        value: minutes,
        text: "" + minutes,
        selected: minutes == minutes_from 
    }));
} // for

