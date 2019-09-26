var posY = [];
var posX = [];
var lastCell = {x:-1,y:-1}
var hashMap = new Map();
var matrix = [];
var penDown = false;
var cursor = false;
var canvas = document.getElementById('drawing');
var ctx = canvas.getContext('2d');
var width = $('#line_width').val();
var rowSize = 10;

var rainbow = false;
var fill = false;
var alpha = 1;
var speed = .1;
var hue = 0;
var rgb = [0,0,0, 255];
var quiltSel = 0;
var undos = [];
var canvasPic;
window.addEventListener("resize", redraw);
// redraw();

function redraw() {

    var min = (x,y) =>{ return (x > y ? y : x)};
    canvas.height = Math.floor(min(.9 * window.innerHeight, .5 * window.innerWidth - 60) / matrix.length) * matrix.length;
    canvas.width = canvas.height;
    ctx.fillStyle = 'rgba(255, 255, 255, 255)'
    ctx.fillRect(0,0,canvas.width,canvas.width)
    $('#drawing').css("height",canvas.height);
    $('#drawing').css("width", canvas.height);
    $('.canvwrap').css("width", window.innerWidth * .5);
    makeGrid();
    
}

let dropSel = $("#pattern");

tables.forEach((e, i)=>{
    if(i == 0){
        dropSel.append($('<option selected></option>').attr('value', i).text(e[0])) 

        e[1].forEach((d)=>{
            $("#truthTable").append(d + '\n');                              
        });
    }
    else
        dropSel.append($('<option></option>').attr('value', i).text(e[0]))  
});


dropSel.prop('selectedIndex', 0);


dropSel.change(function(){
    newText = ''
    tables[this.value][1].forEach((e)=>{
        newText += e + '\n';                              
    });
    
    $("#truthTable").val(newText);
    $("#readTable").click()

});


$('#quilt').click(function (){
    
    undos.push(canvas.toDataURL());
    
    $("#grid").hide();
    drawn = document.createElement('canvas');
    drawn.width = canvas.width;
    drawn.height = canvas.height;

    drawCtx = drawn.getContext('2d');
    drawCtx.drawImage(canvas, 0, 0);

	ctx.clearRect(0, 0, canvas.width, canvas.height);


    if(quiltSel == 0){
        for(i = 0; i < 4; i++){
            ctx.drawImage(drawn, 0, 0, canvas.width / 2, canvas.width / 2);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI/2);
            ctx.translate(-canvas.width/2, -canvas.width/2)
        }
    }
    else{
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.drawImage(drawn, 0, 0, canvas.width / 2, canvas.width / 2);
        ctx.scale(-1,1)
        ctx.drawImage(drawn, 0, 0, canvas.width / 2, canvas.width / 2);
        ctx.scale(1,-1)
        ctx.drawImage(drawn, 0, 0, canvas.width / 2, canvas.width / 2);
        ctx.scale(-1,1)
        ctx.drawImage(drawn, 0, 0, canvas.width / 2, canvas.width / 2);
        ctx.scale(1,-1)
        ctx.translate(-canvas.width/2, -canvas.width/2)
    }

    //ctx.drawImage(drawn, 0, 0, canvas.width / 2, canvas.width / 2);




});




// Changes to the form input trigger variable reloads
$("#quiltType").change(function(){
    quiltSel = this.value;
})
$('#line_width').change(function (){
	if ($('#line_width').val() <= 0)
		$('#line_width').val(1);
	width = $('#line_width').val();
});

$('#rainbow').change(function (){
	rainbow =! rainbow
	hue = 0;
	if(rainbow){
		$('.speed').show();
		$('.rainbow').css({marginBottom:'10'});
	}
	else{
		$('.speed').hide();
		$('.rainbow').css({marginBottom: '41px'});
	}
});
$('#gridBtn').click(function (){
	$("#grid").toggle();
});

$('#fill').change(function (){
    fill =! fill
    $('#line_width').val(1);
});

$('#speed').change(function (){
	speed = $('#speed').val()/1000;
});

$('#alpha').change(function (){
	alpha = $('#alpha').val()/100;
	rgbPick = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
	if (rainbow)
		rgbPick = 'hsla('+ parseInt(hue) +',100%,50%,' + alpha + ')';
	$('#rgb').css("background-color", rgbPick);
});

$('#alpha').mousemove(function (){
	alpha = $('#alpha').val()/100;
	rgbPick = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
	if (rainbow)
		rgbPick = 'hsla('+ parseInt(hue) +',100%,50%,' + alpha + ')';
	$('#rgb').css("background-color", rgbPick);
});

$('#btn-download').mousedown(function (){
	var dataURL = canvas.toDataURL('image/png');
    $('#btn-download').attr('href',dataURL);
});

$("#background").click(function(){
	undos.push(canvas.toDataURL());
	ctx.fillStyle=rgbPick;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
});
$("#undo").click(function(){
	if(undos.length){
		canvasPic = new Image();
		canvasPic.src = undos.pop();
		canvasPic.onload = function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(canvasPic, 0, 0);
		}
	}
});
$("#reset").click(function(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
});


$("#rainFill").click(function(){
    hue = 0

    hashMap.forEach((e, i)=>{

        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = .5 < 0.5 ? .5 * (1 + 1) : .5 + 1 - .5 * 1;
        var p = 2 * .5 - q;
        rgb[0] = Math.round(hue2rgb(p, q, (hue/360) + 1/3) * 255);
        rgb[1] = Math.round(hue2rgb(p, q, hue/360) * 255);
        rgb[2] = Math.round(hue2rgb(p, q, (hue/360) - 1/3) * 255);

        floodFill((e[0].x * rowSize) + 1, (e[0].y * rowSize) + 1)
        hue += 360/hashMap.size
        rgbPick = 'hsla('+ parseInt(hue) +',100%,50%,' + alpha + ')';
        $('#rgb').css("background-color", rgbPick);
    });
});

$('.line').hide();
$('.cursor').hide();
$('.speed').hide();


$('#drawing').mouseover(function(){
    cursor = true;
	$('.cursor').show();
});
$('#drawing').mouseout(function(){
    cursor = false;
    $('.cursor').hide();
    penDown = false;
});
$('#drawing').mousedown(function(){
    undos.push(canvas.toDataURL());
    pos = getMousePos();
	posX[0] = (posX[1] = pos.x);
    posY[0] = (posY[1] = pos.y);
    if(!fill)
        draw();
    else
        floodFill(posX[1], posY[1]);
	penDown = true;
	
});
$('body').mouseout(function(){
    penDown = false;
})
$('body').mouseup(function(){	
    penDown = false;
});


function getMousePos() {
    let rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(event.clientX - rect.left),
      y: Math.floor(event.clientY - rect.top)
    };
}

$('body').mousemove(function(){
    
    if(penDown){
        posX[0] = posX[1];
        posY[0] = posY[1];
        pos = getMousePos();
        posX[1] = pos.x;
        posY[1] = pos.y;

        if (rainbow)
            hueChange();
        if(!fill)
            draw();
    }
	$('.cursor').css({top: event.clientY-1-width/2, left:  event.clientX-1-width/2,width:width,height:width});
});

function hueChange(){
	hue += Math.sqrt((posY[0]-posY[1]) * (posY[0]-posY[1]) + (posX[0]-posX[1]) * (posX[0]-posX[1]))*speed;
	hue = hue%360;
	rgbPick = 'hsla('+ parseInt(hue) +',100%,50%,' + alpha + ')';
	$('#rgb').css("background-color", rgbPick);
}


$("#readTable").click(function(){
    
    hashMap.clear();
    matrix = [];
    let lines = $("#truthTable").val().split('\n').filter(d => d);
    lines.forEach((line, y) => {
        matrix.push([]);
        elements = line.split(' ').filter(d => d);
        elements.forEach((element, x) => {
            matrix[y].push(element);
            if(hashMap.get(element) == undefined)
                hashMap.set(element, [{x:x,y:y}]);
            else   
                hashMap.get(element).push({x:x,y:y});    
        });
    });
    redraw();
});

function makeGrid(){
    $("#grid").empty();
    let rect = canvas.getBoundingClientRect();
    rowSize = Math.floor(canvas.height / matrix.length);
    for(i = 1; i < matrix.length; i++){
        $("#grid").prepend('<div class="line"></div>');
        $(".line:first").css({
            width: canvas.height,
            height: 2,
            top: rect.top + rowSize * i ,
            left: rect.left + 1,
        });
        $("#grid").prepend('<div class="line"></div>');
        $(".line:first").css({
            width: 2,
            height: canvas.height,
            top: rect.top + 1,
            left: rect.left + rowSize * i ,
        })
    }
}

$("#readTable").click()


function draw(clicked){
	ctx.lineWidth = width;
    ctx.strokeStyle = rgbPick;
    ctx.fillStyle = rgbPick;

    currCell = {x:Math.floor(posX[1] / rowSize),y:Math.floor(posY[1] / rowSize)}
    let currVal = matrix[currCell.y][currCell.x];
    
    if(currCell.x == lastCell.x && currCell.y == lastCell.y){

        let arr = hashMap.get(currVal);
    
        arr.forEach(cordPair =>{
            ctx.beginPath();
            ctx.moveTo((posX[0] % rowSize) + cordPair.x * rowSize, (posY[0] % rowSize) + cordPair.y * rowSize);
            ctx.lineTo((posX[1] % rowSize) + cordPair.x * rowSize, (posY[1] % rowSize) + cordPair.y * rowSize);
            ctx.lineCap = 'round';
            ctx.stroke();
        });
        
    }
    // make fill own function, add stitching to points the cross boundaries
    
    

    lastCell = currCell;
}

function floodFill(inX, inY){

    currCell = {x:Math.floor(inX / rowSize),y:Math.floor(inY / rowSize)}
    
    let currVal = matrix[currCell.y][currCell.x];

    colors = ctx.getImageData(currCell.x * rowSize, currCell.y * rowSize, rowSize, rowSize);
    
    xCurr = inX % rowSize
    yCurr = inY % rowSize

    pixels = [[xCurr, yCurr]]

    pixelPos = (yCurr * rowSize + xCurr) * 4;

    startColor = {
        r:colors.data[pixelPos],
        g:colors.data[pixelPos + 1],
        b:colors.data[pixelPos + 2],
        a:colors.data[pixelPos + 3]
    }

    while(pixels.length){

        cell = pixels.pop()

        pixelPos = (cell[1] * rowSize + cell[0]) * 4;


        if(colors.data[pixelPos] == rgb[0] &&
            colors.data[pixelPos + 1] == rgb[1]&&
            colors.data[pixelPos + 2] == rgb[2]&&
            colors.data[pixelPos + 3] == rgb[3])
            continue;
        
        if(colors.data[pixelPos] != startColor.r || 
           colors.data[pixelPos + 1] != startColor.g ||
           colors.data[pixelPos + 2] != startColor.b ||
           colors.data[pixelPos + 3] != startColor.a){
            
            colors.data[pixelPos] = (rgb[0] + colors.data[pixelPos]) / 2;
            colors.data[pixelPos + 1] = (rgb[1] + colors.data[pixelPos + 1]) / 2;
            colors.data[pixelPos + 2] = (rgb[2] + colors.data[pixelPos + 2]) / 2;
            colors.data[pixelPos + 3] = (rgb[3] + colors.data[pixelPos + 3]) / 2;
            continue;
        }
            
        

        colors.data[pixelPos] = rgb[0];
        colors.data[pixelPos + 1] = rgb[1];
        colors.data[pixelPos + 2] = rgb[2];
        colors.data[pixelPos + 3] = rgb[3];

        for(offX = -1; offX <= 1; offX += 1){
            xCurr = cell[0] + offX
            if(xCurr > rowSize || xCurr < 0)
                continue;
            
            for(offY = -1; offY <= 1; offY += 1){
                yCurr = cell[1] + offY
                if(yCurr > rowSize || yCurr < 0)
                    continue;

                pixelPos = (yCurr * rowSize + xCurr) * 4;

                pixels.push([xCurr, yCurr])
            }
                
        }

    }
    
    let arr = hashMap.get(currVal);

    arr.forEach(cordPair =>{
        ctx.putImageData(colors, cordPair.x * rowSize, cordPair.y * rowSize);
    });
    
}