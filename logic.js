document.addEventListener("DOMContentLoaded", () => {

  var currentpoints = []; //will be an array to hold arrays

  const svg = d3.select("#svg")

  var lastpoint = [0,0]

  var isPlayingBack = false;
  var playbackNum = 0;
  var autoDrawInterval = null;

  var drawing = false;
  var counter = 0;


  function startNewDrawing(){
    document.querySelector("#drawingname").value = "drawing0";

    saveDrawing();

    const pastdrawingselect = document.querySelector("#pastdrawings")

    var opt = document.createElement('option');
    opt.value = 0
    opt.innerHTML = "drawing0"
    opt.style.backgroundColor = "darkgray";

    pastdrawingselect.appendChild(opt);

  }

  if(localStorage.length == 0){
    startNewDrawing()
  }

  svg.on("mousedown", () => {
    drawing = true;
  });

  svg.on("mouseup", () => {
    drawing = false;
    counter = 0;
  });

  svg.on('mousemove', function() {
    var mouse = d3.mouse(this);
    draw_point(mouse,
    document.querySelector("#color").value,
    document.querySelector("#widthrange").value,
    true)
  });

  function draw_point(pointarray, color, width, user) {
    if(user == true){
      if(!drawing){
        return;
      }

      const thispoint = [pointarray[0], pointarray[1], color, width]

      if(counter == 0){
        thispoint.push(true) //puts true if first time click (4th index of the array)
      } else {
        thispoint.push(false) //false if dragged
      }

      currentpoints.push(thispoint)
    }

    svg.append('circle')
      .attr('cx',pointarray[0])
      .attr('cy',pointarray[1])
      .attr('r',width / 2)
      .style("fill", color)

    if(counter != 0) {
      svg.append("line")          // attach a line
      .style("stroke", color)  // colour the line
      .style("stroke-width", width)
      .attr("x1", pointarray[0])     // x position of the first end of the line
      .attr("y1", pointarray[1])      // y position of the first end of the line
      .attr("x2", lastpoint[0])     // x position of the second end of the line
      .attr("y2", lastpoint[1]);
    }

    lastpoint[0] = pointarray[0]
    lastpoint[1] = pointarray[1]

    counter++
  }

    document.querySelector("#playback").onclick = () => {
      svg.selectAll("*").remove(); //clear the board, then
      if(isPlayingBack){
        clearInterval(autoDrawInterval)
      }

      autoDrawInterval = setInterval(playbackDraw, document.querySelector("#playbackspeedrange").value)
      isPlayingBack = true;
      playbackNum = 0;
      counter = 0;

    }

    function playbackDraw() {
      if(playbackNum < currentpoints.length) {

        if(currentpoints[playbackNum][4] == true){
          counter = 0;
        }

        draw_point(currentpoints[playbackNum],
        currentpoints[playbackNum][2],
        currentpoints[playbackNum][3],
        false)

        playbackNum++
      } else {
        isPlayingBack = false;
        clearInterval(autoDrawInterval);
        counter = 0;
        playbackNum = 0;
      }
    }

    //selecting other drawings
    /*
    document.querySelector("#pastdrawings").onchange = () => {
      //when you decide to work on another drawing...
      saveDrawing() // saves current drawing

      let drawingselect = document.querySelector("#pastdrawings");

      clearCanvas(); //makes the canvas blank
      document.querySelector("#drawingname").value = JSON.parse(localStorage.getItem(drawingselect.value))["name"];

      //reset some variables
      isPlayingBack = false;
      clearInterval(autoDrawInterval);
      counter = 0;
      playbackNum = 0;

      currentpoints = JSON.parse(localStorage.getItem(drawingselect.value))["points"]

      currentname = JSON.parse(localStorage.getItem(drawingselect.value))["name"]
    }
    */

    function populatePastDrawings(){

        const playbackselect = document.querySelector("#pastdrawings")

        playbackselect.innerHTML = '';

        for (var i = 0; i < localStorage.length; i++){
            var opt = document.createElement('option');
            opt.value = i
            opt.innerHTML = JSON.parse(localStorage.getItem(i))["name"]
            opt.style.backgroundColor = "darkgray";
            playbackselect.appendChild(opt);
          }
    }

    populatePastDrawings()

    document.querySelector("#clearlocalStorage").onclick = () => {
      localStorage.clear();
      populatePastDrawings();
    }


    function saveDrawing(){
      let name = document.querySelector("#drawingname").value

      //if it is empty
      if(name.length == 0) {
        alert('Please, name the drawing')
        return;
      }

      for (var i = 0; i < localStorage.length; i++){
          if(JSON.parse(localStorage.getItem(i))["name"] == name){
            localStorage.setItem(i, JSON.stringify({"name" : name, "points": currentpoints}))
            populatePastDrawings();
            return;
          }
        }

      localStorage.setItem(localStorage.length, JSON.stringify({"name" : name, "points": currentpoints}))
    }



    document.querySelector("#savedrawing").onclick = () => {
      saveDrawing();
    }

    document.querySelector("#widthrange").oninput = () =>{
      setWidthLabel();
    }

    function setWidthLabel(){
      let text = document.querySelector("#widthrange").value.toString();

      if(text < 10){
        text = "0" + text;
      }

      document.querySelector("#widthlabel").innerHTML = text;
    }


    document.onwheel = e => {
      if(e.deltaY < 0){
        document.querySelector("#widthrange").stepUp()
      } else {
        document.querySelector("#widthrange").stepDown()
      }

      setWidthLabel()
    };


    document.querySelector("#playbackspeedrange").value = 5;

    document.querySelector("#playbackspeedrange").oninput = () =>{
      let text = document.querySelector("#playbackspeedrange").value.toString()

        if(text < 10){
          text = "0" + text;
      }

      document.querySelector("#playbackspeedlabel").innerHTML = text;
    }

    document.querySelector("#playbackspeedrange").onchange = () => {
      if(isPlayingBack){
        clearInterval(autoDrawInterval);
        autoDrawInterval = setInterval(playbackDraw, document.querySelector("#playbackspeedrange").value)
      }
    }

    function clearCanvas(){
      svg.selectAll("*").remove();
    }

    document.querySelector("#clear").onclick = () => {
      svg.selectAll("*").remove();
      points = [];
    }

    const colors = ["Red", "Green", "Blue","Black","Magenta","White","Lime","Gold"]

    const colorselect = document.querySelector("#color")

    for (var i = 0; i < colors.length; i++){
        var opt = document.createElement('option');
        opt.value = colors[i];
        opt.innerHTML = colors[i];
        opt.style.color = colors[i];
        opt.style.backgroundColor = "darkgray";
        colorselect.appendChild(opt);
    }
  });
