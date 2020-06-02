var width = 960, height = 500;

var projection = d3.geoLaskowski()
                .scale(600)
                .center([-32,-14]);

var path = d3.geoPath()
                .projection(projection)

var svg = d3.select("#m")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr('fill','white');

const chart = svg.append('g');

const tooltip = svg.append('g')
    .attr('id', 'tooltip')
    .attr('transform', `translate(100, -100)`)
    .style('opacity', 0);

tooltip.append('rect')
       .attr('x', -7.5)
       .attr('y', -17.5)
       .attr('rx', 5)
       .style('fill', 'white')
       .style('stroke', 'black')
       .style('opacity', 1);

tooltip.append('text').attr('id', 'title')
       .style('fill','black')
       .style('font-weight','bold')
       .style('font-size','15pt')

tooltip.append('text')
       .style('fill','black')
       .style('font-family','Montserrat')
       .attr('id', 'subtitle')
       .attr('dy', 20);

       tooltip.append('text')
.attr('id', 'percentage')
.attr('dy', 36);

let lastHoveredState = 'Rio de Janeiro',
      lastPosition = [0, 0],
      currentScale = 1,
      maxScale = 4;

const mouseover = new MouseEvent('mouseover');

const geojson_link = 'https://raw.githubusercontent.com/dyego-eu/brasil_map/master/BRA.json'            

const data_link = 'https://raw.githubusercontent.com/dyego-eu/brasil_map/master/brazil_covid19.csv'

const csv_promise = d3.csv(data_link)
                        .then((data_array)=>{
                            data_array.forEach(element =>{
                            let state = element.state;
                            if(datasets[state]==undefined){
                                datasets[state] = {cases:{x:[element.date], 
                                                    y:[element.cases],
                                                    name: state,
                                                    type:'scatter'
                                                    },
                                                    deaths:{x:[element.date], 
                                                    y:[element.deaths],
                                                    name: state,
                                                    type:'scatter'},}
                            }else{
                                datasets[state]['cases']['x'].push(element.date);
                                datasets[state]['deaths']['x'].push(element.date);
                                datasets[state]['cases']['y'].push(element.cases);
                                datasets[state]['deaths']['y'].push(element.deaths);
                            }
                            })
                            const date_start = datasets['Rio de Janeiro']['cases']['x'][0];
                            const date_end = datasets['Rio de Janeiro']['cases']['x'][datasets['Rio de Janeiro']['cases']['x'].length-1];
                            layout.xaxis.range = [date_start, date_end];
                            layout.xaxis.type = 'date';
                            layout.xaxis.fixedrange= true;
                            plotly_redraw()
                        });


var data = [];
var layout = {
                title:{text:'Numero de Casos Confirmados',
                        font:{
                        family:'Montserrat',
                        size:'30'}
                        },
                plot_bgcolor:'rgb(243, 243, 243)',
                paper_bgcolor:'rgb(243, 243, 243)',
                
                yaxis: {
                        autotick: true,
                        fixedrange: true,
                        tick0: 0,
                        rangemode: 'tozero',
                    },
                xaxis: {
                autorange: false,
                },
                }


let clicked = []
let datasets = {}
let cases_toggle = true;



d3.json(geojson_link)
    .then((states)=>{
    chart.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .on('click', function(d){
            if(d3.select(this).classed('clicked')){
            d3.select(this).classed('clicked',false);
            clicked = clicked.filter((a)=>a!=d.properties.name);
            } else{
            d3.select(this).classed('clicked',true)
            clicked.push(d.properties.name)
            }  
            plotly_redraw()        
        })
        .on('mouseover', function(d) {
            
              lastHoveredState = d.properties.name;
              lastPosition = d3.mouse(this);

              const subtitleText = ('biroliro');
              const percentage = ('boroloro');
              
              tooltip.style('opacity', .8);
              
              // this selects the tooltip spots and updates the properties
              tooltip.select('#title').text(d.properties.name);
              tooltip.select('#subtitle')
                     .interrupt()
                     .text('#'+(cases_toggle?'Casos atual':'Mortes atual')+': '+
                           datasets[d.properties.name]
                                   [(cases_toggle?'cases':'deaths')]
                                   ['y']
                                   [datasets[d.properties.name]
                                            [(cases_toggle?'cases':'deaths')]
                                            ['y'].length-1]);

              d3.select(this)
                .style('opacity', .5);
              
              tooltip.select('rect').attr('width', 0).attr('height', 0);
            
              const bbox = tooltip.node().getBBox();
            
              tooltip.attr('width',0).attr('height',0)
              tooltip.select('rect')
                .attr('width', bbox.width - bbox.x + 15)
                .attr('height', bbox.height - bbox.y - 10);
            })
            .on('mousemove', function(d) {
              lastPosition = d3.mouse(this);
              tooltip.attr('transform', 
              `translate(${lastPosition[0] + 20 * (1 / currentScale)}, 
                         ${lastPosition[1] + 20 * (1 / currentScale)}) scale(${1 / currentScale})`);
            })
            .on('mouseout', function(d) {
              tooltip.style('opacity', 0);
              d3.select(this)
                .style('opacity', 1);
            });

});

d3.select('#myCheckbox_1')
    .on('change', update_check_1)
update_check_1()

function update_check_1(){
    if(d3.select("#myCheckbox_1").property("checked")){
    layout.yaxis={type:'log'}
    } else {
    layout.yaxis={type:'linear'}
    }	
    plotly_redraw()
        }

d3.select('#myCheckbox_2')
    .on('change', update_check_2)
update_check_2()

function update_check_2(){
    if(d3.select("#myCheckbox_2").property("checked")){
    cases_toggle=false;
    layout.title.text = 'Numero de Mortos Confirmados';
    } else {
    cases_toggle=true;
    layout.title.text = 'Numero de Casos Confirmados';
    }
    plotly_redraw()
}

function plotly_redraw(){
    data = []
    if(cases_toggle) {
    clicked.forEach((state)=>{
    data.push(datasets[state]['cases'])
    })
    } else{
    clicked.forEach((state)=>{
    data.push(datasets[state]['deaths'])
    })
    }                 
    Plotly.newPlot('other',data, layout);
}