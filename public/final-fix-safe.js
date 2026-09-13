(function(){'use strict';
function panel(){return document.getElementById('psPanel');}
function closeAi(){var p=panel();if(!p)return;p.classList.remove('open');p.style.setProperty('display','none','important');p.setAttribute('aria-hidden','true');}
function keepOpen(){var p=panel();if(!p)return;if(p.classList.contains('open')){p.style.removeProperty('display');p.setAttribute('aria-hidden','false');}}
window.psClosePanel=closeAi;
function wire(){var p=panel();if(!p||p.dataset.closeFixed)return;p.dataset.closeFixed='1';var b=p.querySelector('.psClose');if(b){b.type='button';b.addEventListener('pointerdown',function(e){e.preventDefault();e.stopImmediatePropagation();closeAi();},true);b.addEventListener('pointerup',function(e){e.preventDefault();e.stopImmediatePropagation();closeAi();},true);b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();closeAi();},true);}new MutationObserver(keepOpen).observe(p,{attributes:true,attributeFilter:['class','style']});}
function run(){wire();keepOpen();}
run();document.addEventListener('DOMContentLoaded',run,{once:true});setTimeout(run,100);setTimeout(run,500);setTimeout(run,1500);})();
