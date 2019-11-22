document.addEventListener("DOMContentLoaded", () => {

  var currentpoints = []; //will be an array to hold arrays

  const svg = d3.select("#svg")

  var currentIndex = 0;
  var isPlayingBack = false;
  var playbackNum = 0;
  var autoDrawInterval = null;

  var lastpoint = [0,0]
  var drawing = false;
  var counter = 0;



  if(localStorage.length == 0){
    startNewDrawing()
  } else {
      populatePastDrawings(); //populates it on startup
      selectPastDrawing(0)
  }

  function startNewDrawing(){
    //clears the canvas
    svg.selectAll("*").remove();

    let name = "drawing" + localStorage.length;

    document.querySelector("#drawingname").value = name;

    currentIndex = localStorage.length;

    clearInterval(autoDrawInterval);
    isPlayingBack = false;
    playbackNum = 0;
    autoDrawInterval = null;
    counter = 0;

    currentpoints = []

    //this  saves the fact that you started a new drawing to the local localStorage
    saveCurrentDrawing();
  }

  function saveCurrentDrawing(){
    let name = document.querySelector("#drawingname").value

    //make sure user has named the drawing
    if(name.length == 0) {
      alert('Please, name the drawing')
      return;
    }

    localStorage.setItem(currentIndex, JSON.stringify({"name" : name, "points": currentpoints}))
    populatePastDrawings();
  }

  function populatePastDrawings(){


      const playbackselect = document.querySelector("#pastdrawings")

      playbackselect.innerHTML = ''; //makes it empty, so I can refill it

      for (var i = 0; i < localStorage.length; i++){
          var opt = document.createElement('option');
          opt.value = i
          opt.innerHTML = JSON.parse(localStorage.getItem(i))["name"]
          opt.style.backgroundColor = "darkgray";
          playbackselect.appendChild(opt);
        }


        document.querySelector("#pastdrawings").selectedIndex = currentIndex;
  }

  //gets it from memory
  function selectPastDrawing(index){
    //index represents the one in localStorage where the drawing info is held
    svg.selectAll("*").remove();

    clearInterval(autoDrawInterval);
    isPlayingBack = false;
    playbackNum = 0;
    autoDrawInterval = null;
    counter = 0;

    currentIndex = index;

    currentpoints = JSON.parse(localStorage.getItem(index))["points"]

    let name = JSON.parse(localStorage.getItem(index))["name"]

    document.querySelector("#drawingname").value = name;

    playBackInstantly()
  }

  //plays back the currentpoints instantly
  function playBackInstantly(){

    clearInterval(autoDrawInterval);
    isPlayingBack = false;
    playbackNum = 0;
    autoDrawInterval = null;
    counter = 0;

    for(let i = 0; i < currentpoints.length; i++){
      playbackDraw()
    }

    counter = 0;
    playbackNum = 0;
  }


  document.querySelector("#pastdrawings").onchange = () => {
    selectPastDrawing(document.querySelector("#pastdrawings").value)
  }



  document.querySelector("#savedrawing").onclick = () => {
    saveCurrentDrawing();
  }

  document.querySelector("#newdrawing").onclick = () => {
    startNewDrawing();
  }



  document.querySelector("#clearlocalStorage").onclick = () => {
    localStorage.clear();
    populatePastDrawings();
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

     document.querySelector("#drawingname").onkeydown = e => {
       if(e.keyCode == 13){
          saveCurrentDrawing();
        }
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
