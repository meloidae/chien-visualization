// Checks d/m/y
function isValidDate(s) {
  var bits = s.split('/');
  var d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && (d.getMonth() + 1) == bits[1];
}

var info = $(".subway-map").subwayMap({ debug: true });
var stations = info[0].stations;
var lines = info[0].lines;
var paths = info[0].paths;
var tweet_ids_dict;

// URL for ajax request
var ajax_url = "/ajax/get_train_info/"

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
        value: month,
        text: "" + month,
        selected: i == time_jst_to.getMonth() 
    }));
    select_from.append($("<option>", {
        value: month,
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


//console.log(lines);


$("button#time_button").click(function() {
    var year_to = parseInt($("select#year_to").val());
    var month_to = parseInt($("select#month_to").val());
    var date_to = parseInt($("select#date_to").val());
    var hours_to = parseInt($("select#hours_to").val());
    var minutes_to = parseInt($("select#minutes_to").val());

    var year_from = parseInt($("select#year_from").val());
    var month_from = parseInt($("select#month_from").val());
    var date_from = parseInt($("select#date_from").val());
    var hours_from = parseInt($("select#hours_from").val());

    data = {
        'year_to': year_to,
        'month_to': month_to,
        'date_to': date_to,
        'hours_to': hours_to,
        'minutes_to': minutes_to,
        'year_from': year_from,
        'month_from': month_from,
        'date_from': date_from,
        'hours_from': hours_from,
        'minutes_from': minutes_from
    };
    $.ajax({
        url: ajax_url,
        type: 'GET',
        data: data,
        dataType: 'json',
        success: function(response) {
            var animated = {};
            tweets = response.tweets;
            troubles = response.troubles;
            console.log("Troubles: " + troubles.length);
            console.log("Tweets: " + tweets.length);
            for (var key in lines) {
                if (lines.hasOwnProperty(key)) {
                    lines[key].stop();
                } // if
            } // for
            for (var i = 0; i < troubles.length; i++) {
                trouble_lines = troubles[i].lines;
                for (var j = 0; j < trouble_lines.length; j++) {
                    if (!(trouble_lines[j] in animated)) {
                        lines[trouble_lines[j]].animate();
                        animated[trouble_lines[j]] = true;
                    } // if
                } // for
            } // for
            tweet_ids_dict = {};
            for (var i = 0; i < tweets.length; i++) {
                var id_str = tweets[i].id_str;
                var t_stations = tweets[i].stations;
                var t_lines = tweets[i].lines;
                for (var j = 0; j < t_stations.length; j++) {
                    if (!(t_stations[i] in tweet_ids_dict)) {
                        tweet_ids_dict[t_stations[j]] = [id_str];
                    } else {
                        tweet_ids_dict[t_stations[j]].push(id_str);
                    } // else
                } // for
                for (var j = 0; j < t_lines.length; j++) {
                    if (!(t_lines[i] in tweet_ids_dict)) {
                        tweet_ids_dict[t_lines[j]] = [id_str];
                    } else {
                        tweet_ids_dict[t_lines[j]].push(id_str);
                    } // else
                } // for
            } // for
        }
    });
});
