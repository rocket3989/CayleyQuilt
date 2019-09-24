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
var rgb = [255,255,255, 255];
var undos = [];
var canvasPic;
window.addEventListener("resize", redraw);
// redraw();

function redraw() {
    var min = (x,y) =>{ return (x > y ? y : x)};
    canvas.height = Math.floor(min(.9 * window.innerHeight, .5 * window.innerWidth - 60) / matrix.length) * matrix.length;
    canvas.width = canvas.height;
    $('#drawing').css("height",canvas.height);
    $('#drawing').css("width", canvas.height);
    $('.canvwrap').css("width", window.innerWidth * .5);
    makeGrid();
    
}

let dropSel = $("#pattern");
tables = [
    ["XOR", ["0 1","1 0"]],
    ["Dihedral 8", ["e r r2 r3 v h d1 d2", "r r2 r3 e d1 d2 h v", "r2 r3 e r h v d2 d1", "r3 e r r2 d2 d1 v h", "v d2 h d1 e r2 r3 r", "h d1 v d2 r2 e r r3", "d1 v d2 h r r3 e r2", "d2 h d1 v r3 r r2 e"]],
    ["Z8, *", ["0 0 0 0 0 0 0 0 ", "0 1 2 3 4 5 6 7 ", "0 2 4 6 0 2 4 6 ", "0 3 6 1 4 7 2 5 ", "0 4 0 4 0 4 0 4 ", "0 5 2 7 4 1 6 3", "0 6 4 2 0 6 4 2 ", "0 7 6 5 4 3 2 1 "]],
    ["Z8, +", ["0 1 2 3 4 5 6 7 ", "1 2 3 4 5 6 7 0 ", "2 3 4 5 6 7 0 1 ", "3 4 5 6 7 0 1 2 ", "4 5 6 7 0 1 2 3 ", "5 6 7 0 1 2 3 4", "6 7 0 1 2 3 4 5 ", "7 0 1 2 3 4 5 6 "]],
    ["Z+7, *", ["1 2 3 4 5 6 ", "2 4 6 1 3 5 ", "3 6 2 5 1 4 ", "4 1 5 2 6 3 ", "5 3 1 6 4 2 ", "6 5 4 3 2 1 "]],
]
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
                   
    $("#truthTable").empty();
    tables[this.value][1].forEach((e)=>{
        $("#truthTable").append(e + '\n');                              
    });
    $("#readTable").click()

});




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
	draw(true);
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
        draw(false);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    let currVal = matrix[currCell.x][currCell.y];
    
    if(!fill && currCell.x == lastCell.x && currCell.y == lastCell.y){

        let arr = hashMap.get(currVal);
    
        arr.forEach(cordPair =>{
            ctx.beginPath();
            ctx.moveTo((posX[0] % rowSize) + cordPair.x * rowSize, (posY[0] % rowSize) + cordPair.y * rowSize);
            ctx.lineTo((posX[1] % rowSize) + cordPair.x * rowSize, (posY[1] % rowSize) + cordPair.y * rowSize);
            ctx.lineCap = 'round';
            ctx.stroke();
        });

        
        
        
    }
    
    if(fill && clicked){

        colors = ctx.getImageData(currCell.x * rowSize, currCell.y * rowSize, rowSize, rowSize);

        
        console.log(colors)

        xCurr = posX[1] % rowSize
        yCurr = posY[1] % rowSize

        pixels = [[xCurr, yCurr], [xCurr + 1, yCurr]]

        console.log(pixels[0])
        console.log(posX[1])

        pixelPos = (yCurr * rowSize + xCurr) * 4;

        console.log(pixelPos)
        startColor = {
            r:colors.data[pixelPos],
            g:colors.data[pixelPos + 1],
            b:colors.data[pixelPos + 2],
            a:colors.data[pixelPos + 3]
        }

        count = 0
        while(pixels.length){

            cell = pixels.pop()

            pixelPos = (cell[1] * rowSize + cell[0]) * 4;
            
            if(colors.data[pixelPos] + colors.data[pixelPos + 1] + colors.data[pixelPos + 2] + colors.data[pixelPos + 3] != 0)
                continue;

            colors.data[pixelPos] = rgb[0];
            colors.data[pixelPos + 1] = rgb[1];
            colors.data[pixelPos + 2] = rgb[2];
            colors.data[pixelPos + 3] = rgb[3];


            for(offX = -1; offX <= 1; offX += 2){
                xCurr = cell[0] + offX
                if(xCurr > rowSize || xCurr < 0)
                    continue;
                
                for(offY = -1; offY <= 1; offY += 2){
                    yCurr = cell[1] + offY
                    if(yCurr > rowSize || yCurr < 0)
                        continue;

                    pixelPos = (yCurr * rowSize + xCurr) * 4;

                    // if(colors.data[pixelPos] + colors.data[pixelPos + 1] + colors.data[pixelPos + 2] + colors.data[pixelPos + 3] == 0)
                        pixels.push([xCurr, yCurr])
                }
                    
            }
            // if (pixels.length > 10000)
            //     break;

        }
        console.log(count)
        let arr = hashMap.get(currVal);
    
        arr.forEach(cordPair =>{
            ctx.putImageData(colors, cordPair.x * rowSize, cordPair.y * rowSize);
        });
        
       
    }
    

    lastCell = currCell;
}
