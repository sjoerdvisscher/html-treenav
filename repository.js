var pane;
var heads=[];
var saveScrollTO=0;
var headHeight;

function init()
{
  pane=document.getElementById('pane');
  copyHeads(heads, pane.getElementsByTagName('h2'), "");
  var m=(''+document.cookie).match(/paneScrollTop=(\d+)/);
  if (m) pane.scrollTop=1*m[1];
  fixHeads();
  window.onresize = fixHeads;
  setInterval("if (heads[0].offsetHeight!=headHeight) fixHeads()",200);
//  createScrollbar(pane);
}

function copyHeads(hs, els, prefix)
{
  var panelheaders=document.getElementById('panelheaders');
  for (var h=0;h<els.length;h++)
  {
    var el = els[h];
    hs[h] = el;
    var div=document.createElement(el.nodeName);
    div.innerHTML = el.innerHTML.replace(/<a name="[^"]+"><\/a>/g, "");
    div.onclick=new Function("","toHeader("+prefix+h+")");
    el.onclick=new Function("","toHeader("+prefix+h+")");
    el.panelheader = panelheaders.appendChild(div);
    el.heads = [];
    copyHeads(el.heads, el.parentNode.getElementsByTagName('h'+(1*el.nodeName.substr(1)+1)), prefix+h+",");
  }
}  

function fixHeads()
{
  subFixHeads(heads, 0, pane.clientHeight);
  if (saveScrollTO) clearTimeout(saveScrollTO);
  saveScrollTO=window.setTimeout("saveScroll()", 100);
}
function subFixHeads(hs, startPos, endPos, parentPanelPos)
{
  if (hs.length == 0) return;

  var headHeight = hs[0].panelheader.offsetHeight;
  var l=hs.length;
  for (var h=0;h<l;h++) 
  {
    var min = startPos + h*headHeight;
    var max = endPos - (l - h) * headHeight;
    if (max<min) 
      if (parentPanelPos == 'min')
        min = max;
      else
        max = min;
    var top = hs[h].offsetTop - pane.scrollTop;
    var panelHeader = hs[h].panelheader;
    //panelHeader.style.width = hs[h].offsetWidth + 'px';
    //panelHeader.style.left = hs[h].offsetLeft + 'px';
    if (top<min) 
    {
      panelHeader.pos = 'min';
      panelHeader.style.top = min + 'px';
      panelHeader.style.visibility = '';
    } 
    else if (top>max)
    {
      panelHeader.pos = 'max';
      panelHeader.style.top = max + 'px';
      panelHeader.style.visibility = '';
    } 
    else 
    {
      panelHeader.pos = '';
      panelHeader.style.top = top + 'px';
      //panelHeader.style.visibility = 'hidden';
    }
  }
  for (var h=0;h<l;h++) 
  {
    var panelHeader = hs[h].panelheader;
    var nextPanelHeader = hs[h+1];
    var panelBottom = nextPanelHeader?nextPanelHeader.panelheader.offsetTop:endPos;
    subFixHeads(hs[h].heads, panelHeader.offsetTop + headHeight, panelBottom, panelHeader.pos);
  }
}

function saveScroll() 
{
  document.cookie="paneScrollTop="+pane.scrollTop+";path=/";
}

function toHeader() {
  var hs = heads;
  var h;
  for (var i=0; i<arguments.length-1; i++)
  {
    h = arguments[i];
    hs = hs[h].heads;
  }
  h = arguments[i];

  animate(hs[h].offsetTop);
}

var animationTOH;
function animate(target) {
  var start = pane.scrollTop;
  anim(start, target - start, 1*new Date());
}

function slope(t) { return Math.exp(3*Math.log(t*2))/2; }
function anim(start, diff, t0) {
  try {
    if (animationTOH) window.clearTimeout(animationTOH);
  } catch(e) {}

  t = (new Date - t0) / 1000;
  if (t>1) 
  {
    pane.scrollTop = start + diff;
    return;
  }

  var f = t < 0.5 ? slope(t) : 1-slope(1-t);
  
  pane.scrollTop = start + diff * f;

  animationTOH=window.setTimeout("anim("+start+","+diff+","+t0+")",30);
}

function createScrollbar(srcEl) {
  var bcrSrcEl = srcEl.getBoundingClientRect();

  var contentEl = document.createElement('div');
  contentEl = document.body.appendChild(contentEl);

  contentEl.innerHTML = srcEl.innerHTML;
  contentEl.style.position = 'absolute';
  contentEl.style.top = (bcrSrcEl.top + srcEl.clientTop + 18) + 'px';
  contentEl.style.left = (bcrSrcEl.right - (srcEl.offsetWidth-srcEl.clientWidth) - 1) + 'px';
  contentEl.style.overflow = 'hidden';
  contentEl.style.zIndex = -1;

  contentEl.style.filter = "progid:DXImageTransform.Microsoft.Matrix(filterType='nearest neighbor', sizingMethod='auto expand')";
  var f = contentEl.filters('DXImageTransform.Microsoft.Matrix');
  f.M11 = 14/contentEl.offsetWidth;
  f.M12 = 0;
  f.M21 = 0;
  f.M22 = (srcEl.clientHeight-36)/contentEl.offsetHeight;

  srcEl.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=1,opacity=100,finishOpacity=60,startx="+(100*srcEl.clientWidth/srcEl.offsetWidth)+",starty=0,finishx=100,finishy=0)";
}