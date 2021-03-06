console.log('final project');
var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t -m.b,
    hLable = h+100,
    wLable = w-70;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b +30)
    .append('g')
    .attr('transform','translate('+ m.l+','+ m.t+')');

// -------------------SET 3 LAYERS ----------------------     
var axisLayer = plot.append('g');
var mapLayer = plot.append('g');
var dataLayer = plot.append('g');

var dataSet;

var filterStatus = {
    roomTypes: {
        btns: d3.set(),
        selected: d3.set()
    },
    neighbourLocations: {
        btns: d3.set(),
        selected: d3.set()
    },
    cancelTypes: {
        btns: d3.set(),
        selected: d3.set()
    },
    amenitiesTypes: {
        btns: d3.set(),
        selected: d3.set()
    },
    familyPets: {
        btns: d3.set(),
        selected: d3.set()
    }
}

var scaleColorRoom = d3.scaleOrdinal()
    .range(['#fd6b5a','#06ce98','#2175bc']),
    scaleColorPolicy = d3.scaleOrdinal()
    .range(['#03afeb','orange','#06ce98','#fd6b5a']);

// -------------------SET SCALE X/Y AXIS----------------------    
var scaleXminNights = d3.scaleLinear()
    .domain([0, 30])
    .range([0,w]);  
var scaleYminNights = d3.scaleLinear()
    .domain([0, 30])
    .range([h,0]);  
var scaleXcleaningFee = d3.scaleLinear()
    .domain([0,300])
    .range([0,w]);    
var scaleYcleaningFee = d3.scaleLinear()
    .domain([0,300])
    .range([h,0]);
var scaleXreviewsPerMonth = d3.scaleLinear()
    .domain([0, 20])
    .range([0,w]);
var scaleYreviewsPerMonth = d3.scaleLinear()
    .domain([0, 20])
    .range([h,0]);
var scaleXprice = d3.scaleLinear()
    .domain([0, 850])
    .range([0,w]);    
var scaleYprice = d3.scaleLinear()
    .domain([0,850])
    .range([h,0]);
var scaleXcalculatedHostListing = d3.scaleLinear()
    .domain([0, 62])
    .range([0,w]);   
var scaleYcalculatedHostListing = d3.scaleLinear()
    .domain([0, 62])
    .range([h,0]);
    
// -------------------SET X/Y AXIS TICKSIZE----------------------    
var axisXscaleXminNights = d3.axisBottom()  
    .scale(scaleXminNights)
    .tickSize(-h);
var axisYscaleYminNights = d3.axisLeft()
    .scale(scaleYminNights)
    .tickSize(-w);
var axisXscaleXcleaningFee = d3.axisBottom()  
    .scale(scaleXcleaningFee)
    .tickSize(-h);
var axisYscaleYcleaningFee = d3.axisLeft()
    .scale(scaleYcleaningFee)
    .tickSize(-w);
var axisXscaleXreviewsPerMonth = d3.axisBottom()  
    .scale(scaleXreviewsPerMonth)
    .tickSize(-h);
var axisYscaleYreviewsPerMonth = d3.axisLeft()
    .scale(scaleYreviewsPerMonth)
    .tickSize(-w);
var axisXscaleXprice = d3.axisBottom()  
    .scale(scaleXprice)
    .tickSize(-h);
var axisYscaleYprice = d3.axisLeft()
    .scale(scaleYprice)
    .tickSize(-w);
var axisXscaleXcalculatedHostListing = d3.axisBottom()  
    .scale(scaleXcalculatedHostListing)
    .tickSize(-h);
var axisYscaleYcalculatedHostListing = d3.axisLeft()
    .scale(scaleYcalculatedHostListing)
    .tickSize(-w);
 
//Mapping - define projection, define path 
var projection = d3.geoMercator()
    .scale(160000)
    .rotate([71.068,0])
    .center([0,42.355])
    .translate([w/2,h/4])
    
var path = d3.geoPath().projection(projection);
var map = mapLayer.selectAll('path')
        .data(neighborhoods_json.features);
        
var controlBtnId = 1;
var colorPaletteOptions = {
    roomType: 1, 
    cancelPolicy: 2, 
    amenities: 3, 
    familyPets: 4,
    neighbourhood: 5
}
var colorPalette = colorPaletteOptions.roomType;

d3.queue()
    .defer(d3.csv,'../data/airbnb.csv',parse)
    .await(dataloaded);

// -------------------FILTER DATA THAT DO NOT MEET STANDARD---------------------  
function preprocessData(data){
    dataSet = data;
    dataSet = dataSet.filter(function(entry){
        if(entry.numReviews < 2) return false;
        if(entry.minNights == 0 || entry.minNights >31) return false;
        if(entry.calculatedHostListing == 0) return false;
        if(entry.minNights * entry.reviewsPerMonth > 30) return false;
        if(entry.cancelPolicy == 'super_strict_30') return false;
        // if(entry.neighbourhood == 'South Boston Waterfront' ||entry.neighbourhood == 'Leather District') return false;
        return true;
    });
    dataSet.forEach(function(d){
        if( !filterStatus.roomTypes.btns.has(d.roomType) ){
            filterStatus.roomTypes.btns.add(d.roomType);
        } 
        if( !filterStatus.neighbourLocations.btns.has(d.neighbourhood) ){
            filterStatus.neighbourLocations.btns.add(d.neighbourhood);
        } 
        if( !filterStatus.cancelTypes.btns.has(d.cancelPolicy) ){
            filterStatus.cancelTypes.btns.add(d.cancelPolicy);
        } 
    })
    addButtonGroups();
    $('#xDropdown').html('Minimum Nights<span class="caret"></span>');
    $('#yDropdown').html('Price<span class="caret"></span>');
}

function dataloaded(err, data){
    preprocessData(data);
    draw();
    drawAxis();
} 

function addButtonGroups(){
    addButtonGroup('.btn-group-roomType',  filterStatus.roomTypes.btns, roomTypeBtnClickHandler);
    filterStatus.roomTypes.selected = filterStatus.roomTypes.btns; // show circles at the beginning
    
    addButtonGroup('.btn-group-neighbourhood', filterStatus.neighbourLocations.btns, neighbourhoodBtnClickHandler);
    filterStatus.neighbourLocations.selected = filterStatus.neighbourLocations.btns;
    
    addButtonGroup('.btn-group-cancelPolicy', filterStatus.cancelTypes.btns, cancelPolicyBtnClickHandler);
    filterStatus.cancelTypes.selected = filterStatus.cancelTypes.btns;
    
    addButtonGroup('.btn-group-amenities', filterStatus.amenitiesTypes.btns, amenitiesBtnClickHandler);
    filterStatus.amenitiesTypes.selected = filterStatus.amenitiesTypes.btns;
    
    addButtonGroup('.btn-group-familyPets', filterStatus.familyPets.btns, familyPetsBtnClickHandler);
    filterStatus.familyPets.selected = filterStatus.familyPets.btns;

    colorBasedOnFilter();
    
}

function addButtonGroup(btnGroupContainer,btnNameSet,onclick) {
    d3.select(btnGroupContainer)
        .selectAll('.btn')
        .data(btnNameSet.values())
        .enter()
        .append('div')
        .html(function(d){return d})
        .attr('class','btn btn-default btnFilter')
        .style('color','white')
        .on('click',onclick);
}

function colorBasedOnFilter() {
    d3.selectAll('.btnFilter')
        .style('background',function(btnContent){
            if(isBtnSelected(btnContent)) {
                if(isBtnGroupColorPelette(btnContent)){
                    return scaleColorPolicy(btnContent)
                } else {
                    return '#b5b5b5';
                } 
            } else {
                return 'white';
            }
        })
}

function isBtnSelected(btn){
    if(filterStatus.roomTypes.selected.has(btn)) return true;
    if(filterStatus.neighbourLocations.selected.has(btn)) return true;
    if(filterStatus.cancelTypes.selected.has(btn)) return true;
    if(filterStatus.amenitiesTypes.selected.has(btn)) return true;
    if(filterStatus.familyPets.selected.has(btn)) return true;
    return false;
}

function isBtnGroupColorPelette(btn){
    var groupName;
    
    if(filterStatus.roomTypes.btns.has(btn)) groupName = 'roomType';
    if(filterStatus.neighbourLocations.btns.has(btn)) groupName = 'neighbourhood';
    if(filterStatus.cancelTypes.btns.has(btn)) groupName = 'cancelPolicy';
    if(filterStatus.amenitiesTypes.btns.has(btn)) groupName = 'amenities';
    if(filterStatus.familyPets.btns.has(btn)) groupName = 'familyPets';
    
    if($('input[name=optradio]:checked').val() == groupName) return true;
    return false;
}

function roomTypeBtnClickHandler(roomType){
    if (filterStatus.roomTypes.selected.has(roomType)){
        filterStatus.roomTypes.selected.remove(roomType);
    } else {
        filterStatus.roomTypes.selected.add(roomType);
    }
  
    if (filterStatus.roomTypes.selected.has(roomType)) {
        d3.select(this)
            .style('background',function(d){return scaleColorPolicy(d)})
            .style('color','white');
    } else {
        d3.select(this)
            .style('background','white')
            .style('color','#ddd')
            .style('border-style','dotted');
    }
    colorBasedOnFilter();
    draw();
}

function neighbourhoodBtnClickHandler(neighbourhood){
    if (filterStatus.neighbourLocations.selected.has(neighbourhood)){
        filterStatus.neighbourLocations.selected.remove(neighbourhood);
    } else {
        filterStatus.neighbourLocations.selected.add(neighbourhood);
    }
  
    if (filterStatus.neighbourLocations.selected.has(neighbourhood)) {
        d3.select(this).style('background','#337ab7')
        .style('color','white');
    } else {
        d3.select(this)
            .style('background','white')
            .style('color','#ddd')
            .style('border-style','dotted');
    }
    colorBasedOnFilter(); 
    draw();
}

function cancelPolicyBtnClickHandler(cancelPolicy){
    if (filterStatus.cancelTypes.selected.has(cancelPolicy)){
        filterStatus.cancelTypes.selected.remove(cancelPolicy);
    } else {
        filterStatus.cancelTypes.selected.add(cancelPolicy);
    }
  
    if (filterStatus.cancelTypes.selected.has(cancelPolicy)) {
        d3.select(this)
        .style('background',function(d){return scaleColorPolicy(d)})
        .style('color','white');
    } else {
        d3.select(this)
            .style('background','white')
            .style('color','#ddd')
            .style('border-style','dotted');
    }
    colorBasedOnFilter();    
    draw();
}

function amenitiesBtnClickHandler(amenities) {
    if (filterStatus.amenitiesTypes.selected.has(amenities)){
        filterStatus.amenitiesTypes.selected.remove(amenities);
    } else {
        filterStatus.amenitiesTypes.selected.add(amenities);
    }
  
    if (filterStatus.amenitiesTypes.selected.has(amenities)) {
        d3.select(this).style('background','#337ab7')
        .style('color','white');
    } else {
        d3.select(this)
            .style('background','white')
            .style('color','#ddd')
            .style('border-style','dotted');
    }
    colorBasedOnFilter();    
    draw();
}

function familyPetsBtnClickHandler(familyPets) {
    if (filterStatus.familyPets.selected.has(familyPets)){
        filterStatus.familyPets.selected.remove(familyPets);
    } else {
        filterStatus.familyPets.selected.add(familyPets);
    }
  
    if (filterStatus.familyPets.selected.has(familyPets)) {
        d3.select(this).style('background','#337ab7')
        .style('color','white');
    } else {
        d3.select(this)
            .style('background','white')
            .style('color','#ddd')
            .style('border-style','dotted');
    }
    colorBasedOnFilter();
    draw();
}

function drawAxis(){
    $('.axis-x').hide();
    $('.axis-y').hide();
    if ($('#xDropdown').text() == 'Minimum Nights') {
        axisLayer.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisXscaleXminNights);
    }else if ($('#xDropdown').text() == 'Reviews Per Month'){
        axisLayer.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisXscaleXreviewsPerMonth);
    }else if ($('#xDropdown').text() == 'Cleaning Fee'){
        axisLayer.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisXscaleXcleaningFee);
    }else if ($('#xDropdown').text() == 'Price'){
        axisLayer.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisXscaleXprice);
    }else if ($('#xDropdown').text() == 'Calculated Host Listings'){
        axisLayer.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisXscaleXcalculatedHostListing);
    };
    
    if ($('#yDropdown').text() == 'Minimum Nights') {
        axisLayer.append('g').attr('class','axis axis-y')
            .call(axisYscaleYminNights);
    }else if ($('#yDropdown').text() == 'Reviews Per Month'){
        axisLayer.append('g').attr('class','axis axis-y')
            .call(axisYscaleYreviewsPerMonth);
    }else if ($('#yDropdown').text() == 'Cleaning Fee'){
        axisLayer.append('g').attr('class','axis axis-y')
            .call(axisYscaleYcleaningFee);
    }else if ($('#yDropdown').text() == 'Price'){
        axisLayer.append('g').attr('class','axis axis-y')
            .call(axisYscaleYprice);
    }else if ($('#yDropdown').text() == 'Calculated Host Listings'){
        axisLayer.append('g').attr('class','axis axis-y')
            .call(axisYscaleYcalculatedHostListing);
    };
        
    $('.xAxisOptions').css('left', wLable).css('top', hLable);
    // $('.yAxisOptions').css('left', 150).css('top', 140).css('position','fixed');
    $('.yAxisOptions').css('left', -100).css('top', 30);
    
    
}

$('.xAxisOptions li a').click(function(){
    // $('#xDropdown').html($(this).text());
    $('#xDropdown').html($(this).text()+'<span class="caret"></span>');
    // $('#xDropdown').val($(this).text());
    drawAxis();
    draw();
});

$('.yAxisOptions li a').click(function(){
    // $('#yDropdown').html($(this).text());
    $('#yDropdown').html($(this).text()+'<span class="caret"></span>');
    // $('#yDropdown').val($(this).text());
    drawAxis();
    draw();
});

 
// Close the dropdown if the user clicks outside of it
// window.onclick = function(event) {
//   if (!event.target.matches('.dropbtn')) {

//     var dropdowns = document.getElementsByClassName("dropdown-content");
//     var i;
//     for (i = 0; i < dropdowns.length; i++) {
//       var openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains('show')) {
//         openDropdown.classList.remove('show');
//       }
//     }
//   }
// }

function drawMap(){
    map.enter()
        .append('path')
        .attr('fill','#ddd')
        .style('opacity',0.5)
        .attr('d',path);
    map.exit()
        .remove();
}

function canvasControl(){
    d3.select('#chartBtn').on('click',function(){
        $('#chartBtn').css('background','#d8d8d8');
        $('#mapBtn').css('background','white');
        if(controlBtnId == 1) return; 
        controlBtnId = 1; 
        drawAxis();
        $('.xAxisOptions').show();
        $('.yAxisOptions').show();
        $('path').css('display','none');
        draw();
    });
    
    d3.select('#mapBtn').on('click',function(){
        $('#chartBtn').css('background','white');
        $('#mapBtn').css('background','#d8d8d8');
        if(controlBtnId == 2) return; 
        controlBtnId = 2;
        drawMap();
        $('.axis-x').hide();
        $('.axis-y').hide();
        $('.xAxisOptions').hide();
        $('.yAxisOptions').hide();
        draw();
    });
    $('#chartBtn').css('background','#d8d8d8');
    $('#mapBtn').css('background','white');
}

canvasControl();

function drawGroupRectangle(filteredDataSet) {
    let boxs = [];
    if (filteredDataSet.length !== 0) {
        var tier1BarPercentile = 0.90;
        var tier2BarPercentile = 0.50;
        var sortedIncome = filteredDataSet.sort(function(a,b){
            return a.monthlyIncome - b.monthlyIncome; // low to high
        });
       
        var tier1BarIncome = sortedIncome[
            Math.floor(sortedIncome.length*tier1BarPercentile)].monthlyIncome;
        var tier2BarIncome = sortedIncome[
            Math.floor(sortedIncome.length*tier2BarPercentile)].monthlyIncome;
        
        var filteredTop = sortedIncome.filter(function(entry){
            entry.x = getCircleX(entry);
            entry.y = getCircleY(entry);
            if (entry.monthlyIncome >= tier1BarIncome){
                entry.tier = 1;
                return entry.monthlyIncome;
            }
        });
        
        var filteredMiddle = sortedIncome.filter(function(entry){
            if(entry.monthlyIncome < tier1BarIncome && 
                entry.monthlyIncome >= tier2BarIncome){
                entry.tier = 2;
                return true;
            }
            return false;
        });
        
        var filteredBottom = sortedIncome.filter(function(entry){
            if (entry.monthlyIncome < tier2BarIncome) {
                entry.tier = 3;
                return entry.monthlyIncome;
            }
        });
        
        // console.log(filteredTop);
        // console.log(fiteredMiddle);
        // console.log(filteredBottom);
        
    //----------SORT X/Y AXIS POSITION--------
        filteredTop.sort(function(a,b){
          if (a.x > b.x) return 1;
          if (a.x < b.x) return -1;
          return 0;
        });
        
        filteredMiddle.sort(function(a,b){
          if (a.x > b.x) return 1;
          if (a.x < b.x) return -1;
          return 0;
        });
        
        filteredBottom.sort(function(a,b){
          if (a.x > b.x) return 1;
          if (a.x < b.x) return -1;
          return 0;
        });
       
        boxs.push({});
        boxs[0].minXTopBox = filteredTop[Math.floor(filteredTop.length * 0.10)].x;
        boxs[0].maxXTopBox = filteredTop[Math.floor(filteredTop.length * 0.90)].x;
        
        boxs.push({});
        boxs[1].minXTopBox = filteredMiddle[Math.floor(filteredMiddle.length * 0.10)].x;
        boxs[1].maxXTopBox = filteredMiddle[Math.floor(filteredMiddle.length * 0.90)].x;
        
        boxs.push({});
        boxs[2].minXTopBox = filteredBottom[Math.floor(filteredBottom.length * 0.10)].x;
        boxs[2].maxXTopBox = filteredBottom[Math.floor(filteredBottom.length * 0.90)].x;
        
        filteredTop.sort(function(a,b){
            if (a.y > b.y) return 1;
            if (a.y < b.y) return -1;
            return 0;
        });
        
         filteredMiddle.sort(function(a,b){
            if (a.y > b.y) return 1;
            if (a.y < b.y) return -1;
            return 0;
        });
        
         filteredBottom.sort(function(a,b){
            if (a.y > b.y) return 1;
            if (a.y < b.y) return -1;
            return 0;
        });
        
        boxs[0].minYTopBox = filteredTop[Math.floor(filteredTop.length * 0.10)].y;
        boxs[0].maxYTopBox = filteredTop[Math.floor(filteredTop.length * 0.90)].y;
        boxs[0].tier = 1;
        
        boxs[1].minYTopBox = filteredMiddle[Math.floor(filteredMiddle.length * 0.10)].y;
        boxs[1].maxYTopBox = filteredMiddle[Math.floor(filteredMiddle.length * 0.90)].y;
        boxs[1].tier = 2;
        
        boxs[2].minYTopBox = filteredBottom[Math.floor(filteredBottom.length * 0.10)].y;
        boxs[2].maxYTopBox = filteredBottom[Math.floor(filteredBottom.length * 0.90)].y;
        boxs[2].tier = 3;
    }
    
    var plotboxs = plot.selectAll('rect')
        .data(boxs, function(box){return box.tier});
    
    var plotboxsEnter = plotboxs.enter()
        .append('rect')
        .style('fill', 'none')
        .attr("stroke-width", function(box){
            // if(box.tier == 1){
            //     return '3px';
            // }else if(box.tier ==2) {
            //     return '2px';
            // }else if(box.tier ==3){
            //     return '1px';
            // }
            return '0px';
        })
        .attr('stroke','#ff5a5f')
        // .attr('stroke',function(box){
        //     if(box.tier == 0){
        //         return 'black';
        //     }else if(box.tier ==1) {
        //         return 'green';
        //     }else if(box.tier ==2){
        //         return 'red';
        //     }
        // })
        .attr('x', 0)
        .attr('y', h)
        .attr('width', 0)
        .attr('height', 0);
        
    plotboxsEnter
        .merge(plotboxs)
        // .select('rect')
        .attr("stroke-width", function(box){
            if(box.tier == 1){
                return '4px';
            }else if(box.tier ==2) {
                return '2px';
            }else if(box.tier ==3){
                return '1px';
            }
        })
        .transition()
        .duration(1000)
        .attr("x", function(box) {
            return box.minXTopBox;
        })
        .attr("y", function(box) {
            return box.minYTopBox;
        })
        .attr("width", function(box) {
            return box.maxXTopBox - box.minXTopBox;
        })
        .attr("height", function(box) {
            return box.maxYTopBox- box.minYTopBox;
        });
        
        
    plotboxs.exit().remove();
}
        
function draw(){
    var minX = d3.min(dataSet, function(d){return d.monthlyIncome;}),
        maxX = d3.max(dataSet, function(d){return d.monthlyIncome;}); 
    var scaleIncome = d3.scaleLinear()
        .domain([minX, maxX])
        .range([2,15]);
        
    var filteredDataSet = dataSet.filter(function(entry){
        if(!filterStatus.roomTypes.selected.has(entry.roomType)) return false;
        if(!filterStatus.neighbourLocations.selected.has(entry.neighbourhood)) return false;
        if(!filterStatus.cancelTypes.selected.has(entry.cancelPolicy)) return false;
        if(!filterStatus.amenitiesTypes.selected.has(entry.amenities)) return false;
        if(!filterStatus.familyPets.selected.has(entry.familyPets)) return false;
        return true;
    });

    drawGroupRectangle(filteredDataSet);
    
    var node = dataLayer.selectAll('.node')
        .data(filteredDataSet,function(d){return d.id});
        
    //ENTER
    var nodeEnter = node.enter()
        .append('g')
        .attr('class','node')
        .on('click',function(d,i){
            // console.log(d);
            // console.log(i);
            // console.log(this);
            // console.log(d); 
        })
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.selectAll('.title')
                .html('Host: '+ d.hostName);
            tooltip.select('.value1')
                .html('<b>$'+ d.price + '/ night</b>');
            tooltip.select('.value2')    
                .html('<b>'+d.reviewsPerMonth +' reviews/month</b>');
            tooltip.select('.value3')
                .html("<b>Minimum Nights:</b><span style='color:#929292' class='tooltipValue'>"+d.minNights+ "</span>");
            tooltip.select('.value4')
                .html("<b>Monthly Income:</b><span style='color:#929292' class='tooltipValue'>"+'$'+ Math.round(d.monthlyIncome)+ "</span>");
            tooltip.select('.value5')
                .html("<b>Neighbourhood:</b><span style='color:#929292' class='tooltipValue'>"+d.neighbourhood+ "</span>");
            tooltip.select('.value6')
                .html("<b>Cancel Policy: </b><span style='color:#929292' class='tooltipValue'>"+d.cancelPolicy+ "</span>");
            tooltip.transition()
                .style('opacity',1)
                .style('visibility','visible');
            d3.select(this).style('stroke-width','3px');
        })
        .on('mousemove',function(d){
             var tooltip = d3.select('.custom-tooltip');
             var xy = d3.mouse(d3.select('.container').node());
             tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');
        })
        .on('mouseleave',function(d){
             var tooltip = d3.select('.custom-tooltip');
             tooltip.transition().style('opacity',0);
             d3.select(this).style('stroke-width','0px');
        });
    
    nodeEnter.append('circle')
        .attr('r', function(d){
            return scaleIncome(d.monthlyIncome);
        })
        .style('fill','#8c8c8c')
        .style('stroke-width', function(entry) {
            if (entry.tier == 1) {
                return '3px';
            } else if (entry.tier == 2) {
                return '1px';
            }
            return '0px';
        })
        .style('stroke', 'black');
  
    nodeEnter.select('circle')
        // .attr('cx',0)
        // .attr('cy',h/2)
         .attr('cx',function(d){
            if(controlBtnId == 1){
                // return 0;
                if($('#xDropdown').text() == 'Minimum Nights'){
                    return scaleXminNights(d.minNights);
                }else if($('#xDropdown').text() == 'Reviews Per Month'){
                    return scaleXreviewsPerMonth(d.reviewsPerMonth);
                }else if($('#xDropdown').text() == 'Cleaning Fee'){
                    return scaleXcleaningFee(d.cleaningFee);
                }else if($('#xDropdown').text() == 'Price'){
                    return scaleXprice(d.price);
                }else if($('#xDropdown').text() == 'Calculated Host Listings'){
                    return scaleXcalculatedHostListing(d.calculatedHostListing);
                }; 
            }else if(controlBtnId == 2){
                return w/2;
            }
        })
        .attr('cy',function(d){
            if(controlBtnId == 1){
                return h;
            }else if(controlBtnId == 2){
                return h/2;
            }
        });
   
    nodeEnter.merge(node)
        .select('circle')
        .transition()
        .duration(500)
        .attr('cx',getCircleX)
        .attr('cy',getCircleY)
        .style("fill", function(d) { 
            switch (colorPalette) {
                case colorPaletteOptions.roomType:
                    return scaleColorPolicy(d.roomType); 
                case colorPaletteOptions.cancelPolicy:
                    return scaleColorPolicy(d.cancelPolicy); 
                case colorPaletteOptions.amenities:
                    return scaleColorPolicy(d.amenities); 
                case colorPaletteOptions.familyPets:
                    return scaleColorPolicy(d.familyPets); 
                case colorPaletteOptions.neighbourhood:
                    return scaleColorPolicy(d.neighbourhood); 
            }
        })
        .style('opacity',0.6);
    //EXIT
    node.exit()
        .transition()
        .duration(500)
        .attr('cy',0)
        .style('opacity',0)
        .remove();
} 

function getCircleX(entry){
    if (controlBtnId == 1){
        if($('#xDropdown').text() == 'Minimum Nights'){
            // console.log($('#xDropdown').val());
            return scaleXminNights(entry.minNights);
        }else if($('#xDropdown').text() == 'Reviews Per Month'){
            return scaleXreviewsPerMonth(entry.reviewsPerMonth);
        }else if($('#xDropdown').text() == 'Cleaning Fee'){
            return scaleXcleaningFee(entry.cleaningFee);
        }else if($('#xDropdown').text() == 'Price'){
            return scaleXprice(entry.price);
        }else if($('#xDropdown').text() == 'Calculated Host Listings'){
            return scaleXcalculatedHostListing(entry.calculatedHostListing);
        };
        // return scaleX(d.secDeposit);
    }else if(controlBtnId ==2) {
        return projection([entry.lon,entry.lat])[0];
    }
};

function getCircleY(entry){
    if (controlBtnId == 1){
        if($('#yDropdown').text() == 'Minimum Nights'){
            return scaleYminNights(entry.minNights);
        }else if($('#yDropdown').text() == 'Reviews Per Month'){
            return scaleYreviewsPerMonth(entry.reviewsPerMonth);    
        }else if($('#yDropdown').text() == 'Cleaning Fee'){ 
            return scaleYcleaningFee(entry.cleaningFee);
        }else if($('#yDropdown').text() == 'Price'){
            return scaleYprice(entry.price);
        }else if($('#yDropdown').text() == 'Calculated Host Listings'){
            return scaleYcalculatedHostListing(entry.calculatedHostListing);
        };
    }else if(controlBtnId ==2) {
        return projection([entry.lon,entry.lat])[1];    
    };
}      
        
$('.roomTypeRadioBtn').click(function(){
    colorPalette = colorPaletteOptions.roomType;
    colorBasedOnFilter();
    draw();
});

$('.cancelPolicyRadioBtn').click(function(){
    colorPalette = colorPaletteOptions.cancelPolicy;
    colorBasedOnFilter();
    draw();
});

$('.amenitiesRadioBtn').click(function(){
    colorPalette = colorPaletteOptions.amenities;
    colorBasedOnFilter();
    draw();
});

$('.familyPetsRadioBtn').click(function(){
    colorPalette = colorPaletteOptions.familyPets;
    colorBasedOnFilter();
    draw();
});

$('.neighbourhoodRadioBtn').click(function(){
    colorPalette = colorPaletteOptions.neighbourhood;
    colorBasedOnFilter();
    draw();
});

//------------  LEGEND TOOLTIP  -------------------
$(function() {
    $('.incomeTooltip[title]' ).tooltip();
});

$(function() {
    $('.clusterRectTooltip[title]' ).tooltip();
});

function parse(d){
    var entry = {
        id:d.id,
        hostId: +d.host_id,
        hostName: d.host_name,
        neighbourhood: d.neighbourhood,
        lat: +d.latitude,
        lon: +d.longitude,
        roomType: d.room_type,
        accommodates: d.accommodates,
        bathrooms: +d.bathrooms,
        bedrooms: +d.bedrooms,
        price: +d.price,
        secDeposit: +d.security_deposit,
        cleaningFee:  d.cleaning_fee == ''? 0 : (+d.cleaning_fee),
        minNights: d.minimum_nights == ''? 0 : (+d.minimum_nights),
        numReviews:  d.number_of_reviews == ''? 0 :(+d.number_of_reviews),
        lastReview: new Date(d.last_review),
        reviewsPerMonth:  d.reviews_per_month == ''? 0 : (+d.reviews_per_month),
        calculatedHostListing: d.calculated_host_listings_count== ''? 0 : (+d.calculated_host_listings_count),
        availability: +d.availability_365,
        responseTime: d.host_response_time,
        acceptRate: d.host_acceptance_rate,
        cancelPolicy: d.cancellation_policy,
        // amenities: d.amenities,
        monthlyIncome: d.price * d.reviews_per_month *d.minimum_nights + d.cleaning_fee * d.reviews_per_month
    };
    
    if(d.amenities.includes('TV')) {
        if (d.amenities.includes('Wireless')){
            entry.amenities = 'TV + Wifi';
        } else {
            entry.amenities = 'TV';
        }
    } else {
        if (d.amenities.includes('Wireless')){
            entry.amenities = ' Wifi';
        } else {
            entry.amenities = 'None';
        } 
    } 
    
    if(d.amenities.includes('Family/Kid Friendly')) {
        if (d.amenities.includes('Pets Allowed')){
            entry.familyPets = 'Kids Friendly + Pets Allowed';
        } else {
            entry.familyPets = 'Kids Friendly';
        }
    } else {
        if (d.amenities.includes('Pets Allowed')){
            entry.familyPets = 'Pets Allowed';
        } else {
            entry.familyPets = 'Neither';
        } 
    } 
    
    if(!filterStatus.amenitiesTypes.btns.has(entry.amenities) ){
        filterStatus.amenitiesTypes.btns.add(entry.amenities);
    } 
    if(!filterStatus.familyPets.btns.has(entry.familyPets) ){
        filterStatus.familyPets.btns.add(entry.familyPets);
    } 
        
    return entry;
}
