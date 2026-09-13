(function(){'use strict';
function mount(){var r=document.querySelector('.below');if(!r)return;/* native bottom is authoritative; legacy runtime module disabled */}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();})();
