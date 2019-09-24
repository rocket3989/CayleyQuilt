var picker = document.getElementById('canvas_picker').getContext('2d');
var onPick = false;
var rgbPick = '#fff';
var img = new Image();
img.src = document.getElementById('colors').src;
img.setAttribute('crossOrigin', '');
picker.drawImage(img,0,0);
function pickColor(){
    let rect = document.getElementById('canvas_picker').getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    rgb = picker.getImageData(x, y, 1, 1).data;
    rgbPick = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
    $('#rgb').css("background-color", rgbPick);
}
$('#canvas_picker').mousedown(function(){
    onPick = true;
    if(!rainbow)
        pickColor();
});
$('body').mouseup(function(){
    onPick = false;
});
$('#canvas_picker').mousemove(function(){
    if(onPick)
    {
        if(!rainbow)
            pickColor();
    }
});