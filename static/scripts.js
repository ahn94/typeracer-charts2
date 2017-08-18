var chartWPM;
var chartAcc;

$(function () {
    console.log("working");

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        console.log("File API is supported!");
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    $('#sample').on('click', function () {
        $.ajax({
            url: "/static/race_data.csv",
            async: false,
            success: function (data) {
                parseCSV(data);
            }
        });
    });

    $('#submit').on("click", function (e) {
        e.preventDefault();
        var file = $('#files').get(0).files[0];
        parseCSV(file);
    });

});


function parseCSV(file) {

    if (!file) {
        alert('Please select a file!');
        return;
    }

    Papa.parse(file, {
        config: {
            delimiter: "auto",
            complete: toChart
        },
        error: function (err, file) {
            console.log("ERROR:", err, file);
            throw(err);
        },
        complete: function (results, file) {
            console.log("Parsing complete:", results, file);
            toChart(results, file);

        }
    });
}

function avgArr(array, start, end) {
    var sum = 0;
    var i = start;
    for (; i < end; i++) {
        sum = sum + array[i][0] / 1;
    }
    return sum / (end - start);
}

function toChart(json, file) {
    var wpm = [];
    var avg = [];
    var acc = [];

    var chunk = parseInt(json.data.length / 40, 10);

    for (var i = 1; i < json.data.length; i++) {
        wpm.push([parseInt(json.data[i][1], 10)]);
        acc.push([parseFloat(json.data[i][2]), parseInt(json.data[i][1], 10)]);
    }
    for (var n = 0; n < wpm.length; n++) {
        if ( n % chunk === 0) {
            if (n + chunk > wpm.length) {
                avg.push([n, avgArr(wpm, n, wpm.length - 1)]);
            } else {
                avg.push([n, avgArr(wpm, n, n + chunk)]);
            }
        }
    }


    $('#chart-wpm').removeClass('gone');
    chartWPM = Highcharts.chart('chart-wpm', {
        chart: {
            backgroundColor: null,
            type: 'scatter',
            zoomType: 'x'
        },
        boost: {
            useGPUTranslations: true
        },    
        title: {
            text: 'WPM',
            style: {
                'font-size': '25px'
            }
        },
        yAxis: {
            title: {
                text: 'WPM'
            }
        },
        xAxis: {
            title: {
                text: 'Race #'
            },
            minTickInterval: 1
        },
        tooltip: {
            enabled: true,
            pointFormat: "{series.name}: <b>{point.y}</b><br/>",
            animation: false,
            headerFormat: ""
        },
        plotOptions: {
            series: {
                turboThreshold: 150000,
                animation: false
            }
        },
        series: [{
            name: 'WPM',
            color: 'rgba(37, 40, 57, .1)',
            data: wpm,
            marker: {
                radius: 6
            }
        }, {
            name: 'AVG',
            color: 'rgba(242, 182, 50, .5)',
            marker: {
                radius: 0
            },
            type: 'spline',
            data: avg
        }]
    });

    $('#chart-acc').removeClass('gone');
    chartWPM = Highcharts.chart('chart-acc', {
        chart: {
            backgroundColor: null,
            type: 'scatter'
        },
        title: {
            text: 'Accuracy',
            style: {
                'font-size': '25px'
            }
        },
        boost: {
            useGPUTranslations: true
        },
        yAxis: {
            title: {
                text: 'WPM'
            }        
        },
        xAxis: {
            labels: {
                formatter: function() {
                    return (this.value * 100) + '%';
                }
            },
            title: {
                text: 'Accuracy'
            },
            minTickInterval: .005
        },
        tooltip: {
            enabled: true,
            pointFormat: "{series.name}: <b>{point.y}</b><br/>",
            animation: false,
            headerFormat: ""
        },
        plotOptions: {
            series: {
                turboThreshold: 150000,
                animation: false
            }
        },
        series: [{
            name: 'WPM',
            color: 'rgba(37, 40, 57, .1)',
            data: acc,
            marker: {
                radius: 6
            }
        }]
    });


}
