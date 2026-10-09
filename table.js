/* ---- the table (second square of the grid). Its drawing: drag the coloured blocks out of their holes and put them anywhere -
   on the top, on the floor, or under the net, where the table hides them. Drop one near its hole and it drops back in. ---- */
(function(){
  var PIECES={"circle":[[283.7,553.4],[274.2,553.4],[267.2,552.8],[254.8,549.8],[248.3,547.4],[242.0,544.2],[237.7,541.4],[233.8,538.2],[230.2,534.5],[227.8,530.8],[225.8,526.0],[225.2,523.0],[225.4,518.2],[226.9,513.0],[229.6,508.3],[233.1,503.8],[237.2,500.4],[241.5,497.8],[246.3,495.4],[252.7,493.1],[259.2,491.2],[266.5,489.8],[272.5,488.9],[280.3,488.4],[286.5,488.4],[295.0,489.2],[307.0,492.2],[317.0,496.2],[323.3,500.1],[327.2,503.1],[330.8,506.7],[333.2,510.0],[335.1,513.5],[336.2,517.7],[336.2,523.7],[335.6,526.8],[333.6,531.3],[329.6,537.0],[326.0,540.4],[322.7,542.8],[318.5,545.1],[311.8,547.9],[299.3,551.4],[289.8,552.9]],"square":[[612.7,482.9],[569.8,440.5],[643.5,415.4],[685.9,457.8]],"triangle":[[638.0,340.4],[536.4,310.7],[631.3,274.2]]};   // outlines of the three blocks, traced from the drawing (0-1000 across the square)
  var TABLE={
    img:"projects/table/iso.png",
    top:[[28.7,560],[679,184.2],[949.3,340.7],[299,716.5]],   // the four corners of the table top
    H:168,   // height of the table top above the floor
    T:5.2,   // thickness of the top (and of the blocks)
    pieces:{circle:{c:"#c6e2ff",smooth:1,p:PIECES.circle},square:{c:"#bb5e55",p:PIECES.square},triangle:{c:"#c8dcc2",p:PIECES.triangle}}
  };
  var st={},NS="http://www.w3.org/2000/svg";                     // where each block is (kept while the page is open)
  Object.keys(TABLE.pieces).forEach(function(k){st[k]={dx:0,dy:0,where:"seated"}});
  function cen(p){var x=0,y=0;p.forEach(function(q){x+=q[0];y+=q[1]});return[x/p.length,y/p.length]}
  function inPoly(pt,p){var c=false;for(var i=0,j=p.length-1;i<p.length;j=i++){var a=p[i],b=p[j];
    if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
  function hull(pts){pts=pts.slice().sort(function(a,b){return a[0]-b[0]||a[1]-b[1]});
    function cr(o,a,b){return(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])}
    var lo=[],up=[];pts.forEach(function(p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)});
    pts.slice().reverse().forEach(function(p){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)});
    return lo.slice(0,-1).concat(up.slice(0,-1))}
  function pstr(p,dx,dy){return p.map(function(q){return(q[0]+dx).toFixed(1)+","+(q[1]+dy).toFixed(1)}).join(" ")}
  function el(n,a,par){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(par)par.appendChild(e);return e}
  /* where a block lands: back in its hole, on the top, on the floor in front, or on the floor under / behind the table */
  function settle(k){var s=st[k],c=cen(TABLE.pieces[k].p),x=c[0]+s.dx,y=c[1]+s.dy;
    if(Math.hypot(s.dx,s.dy)<22){s.dx=s.dy=0;s.where="seated";return}
    if(inPoly([x,y],TABLE.top)){s.where="top";return}
    var A=TABLE.top[0],B=TABLE.top[1],D=TABLE.top[3],ux=B[0]-A[0],uy=B[1]-A[1],vx=D[0]-A[0],vy=D[1]-A[1],
        px=x-A[0],py=y-TABLE.H-A[1],det=ux*vy-uy*vx,u=(px*vy-py*vx)/det,v=(ux*py-uy*px)/det;   // the point of the top straight above it
    s.where=(u>0&&v<1)?"under":"floor"}
  function drawPiece(k,g,lift){var s=st[k],pc=TABLE.pieces[k],P=pc.p,dx=s.dx,dy=s.dy,T=TABLE.T,grp=el("g",{"class":"tpc","data-k":k},g);
    if(s.where==="seated"&&!lift){                                  // in its hole: flush with the top, just a hint of shadow
      el("polygon",{points:pstr(P,dx+.8,dy+1.4),"class":"tsh seat"},grp);
      el("polygon",{points:pstr(P,dx,dy),fill:pc.c,"class":"ttop"},grp);return}
    var up=T+(lift||0),sh=lift?{o:.16,b:"url(#tblurL)",x:6,y:9}:{o:.22,b:"url(#tblur)",x:2.5,y:3.5};
    el("polygon",{points:pstr(P,dx+sh.x,dy+sh.y),fill:"#000","fill-opacity":sh.o,filter:sh.b,"class":"tsh"},grp);   // its little shadow
    var topP=P.map(function(q){return[q[0]+dx,q[1]+dy-up]}),bot=P.map(function(q){return[q[0]+dx,q[1]+dy-up+T]}),H=hull(topP.concat(bot));
    el("polygon",{points:pstr(H,0,0),fill:"#fff","class":"tln"},grp);   // its edge, as thick as the table top
    if(!pc.smooth){var Hs=H.map(String);bot.forEach(function(b,i){if(Hs.indexOf(String(b))>=0)el("line",{x1:topP[i][0],y1:topP[i][1],x2:b[0],y2:b[1],"class":"tln"},grp)})}
    el("polygon",{points:pstr(topP,0,0),fill:pc.c,"class":"ttop"},grp)}
  window.tableScene=function(box){
    var dragK=null;
    var svg=el("svg",{viewBox:"20 80 960 960","aria-label":"The table: drag the coloured blocks"},box);
    svg.innerHTML='<defs><filter id="tblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>'+
      '<filter id="tblurL" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter></defs>'+
      '<g class="lunder"></g><image href="'+TABLE.img+'" width="1000" height="1000"/><g class="lfloor"></g><g class="ltop"></g>';
    var L={under:svg.querySelector(".lunder"),floor:svg.querySelector(".lfloor"),top:svg.querySelector(".ltop")};
    function render(){for(var n in L)L[n].innerHTML="";
      Object.keys(st).sort(function(a,b){return(cen(TABLE.pieces[a].p)[1]+st[a].dy)-(cen(TABLE.pieces[b].p)[1]+st[b].dy)})
        .forEach(function(k){if(k!==dragK)drawPiece(k,L[st[k].where==="seated"?"top":st[k].where])});
      if(dragK)drawPiece(dragK,L.top,14)}                            // the one in your hand: lifted, on top of everything
    render();
    function pt(e){var p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
    var d=null;
    svg.addEventListener("pointerdown",function(e){var g=e.target.closest&&e.target.closest(".tpc");if(!g)return;e.preventDefault();e.stopPropagation();
      var k=g.getAttribute("data-k"),p=pt(e);dragK=k;d={k:k,x:p.x,y:p.y,dx:st[k].dx,dy:st[k].dy};svg.setPointerCapture(e.pointerId);svg.classList.add("dragging");render()});
    svg.addEventListener("pointermove",function(e){if(!d)return;var p=pt(e),s=st[d.k],c=cen(TABLE.pieces[d.k].p);
      s.dx=Math.max(-c[0]+40,Math.min(960-c[0],d.dx+p.x-d.x));s.dy=Math.max(-c[1]+110,Math.min(1030-c[1],d.dy+p.y-d.y));render()});
    function up(){if(!d)return;settle(d.k);d=null;dragK=null;svg.classList.remove("dragging");render()}
    svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
    svg.addEventListener("click",function(e){if(e.target.closest&&e.target.closest(".tpc"))e.stopPropagation()});
  };
})();
