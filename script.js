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

var rainbow = false;
var alpha = 1;
var speed = .1;
var hue = 0;
var rgb = [0,0,0];
var undos = [];
var canvasPic;
window.addEventListener("resize", redraw);
redraw();

function redraw() {
    var min = (x,y) =>{ return (x > y ? y : x)};
    canvas.height = min(.9 * window.innerHeight, .5 * window.innerWidth - 60);
    canvas.width = canvas.height;
    $('#drawing').css("height",canvas.height);
    $('#drawing').css("width", canvas.height);
    $('.canvwrap').css("width", window.innerWidth * .5);
    makeGrid();
    
}


// Changes to the form input trigger variable reloads

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
$('input[type=radio][name=brush]').change(function(){
	brush = this.value;
	penDown = false;
})
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
	draw();
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
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
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
        draw();
    }
	$('.cursor').css({top: event.clientY-1-width/2, left:  event.clientX-1-width/2,width:width,height:width});
});

function hueChange(){
	hue += Math.sqrt(posY[0]*posY[0] )*speed;
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
            if(y == 0)
                hashMap.set(element, [{x:x,y:y}]);
            else   
                hashMap.get(element).push({x:x,y:y});    
        });
    });
    //<div class="line"></div>
    makeGrid();
});
function makeGrid(){
    $("#grid").empty();
    let rect = canvas.getBoundingClientRect();
    let rowSize = canvas.height / matrix.length;
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

function draw(){
	ctx.lineWidth = width;
    ctx.strokeStyle = rgbPick;

    let rowSize = canvas.height / matrix.length;
    currCell = {x:Math.floor(posY[1] / rowSize),y:Math.floor(posX[1] / rowSize)}
    let currVal = matrix[currCell.x][currCell.y];
    
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
    lastCell = currCell;
}