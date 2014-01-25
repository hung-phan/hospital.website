!function(t,e){"use strict";var n,i=t.document;n=function(){var n,s,o,r,a,l,c,u,f,d,p,y,h={},b={},m=!1,v={ENTER:13,ESC:27,SPACE:32},g=[];return b={buttons:{holder:'<nav class="alertify-buttons">{{buttons}}</nav>',submit:'<button type="submit" class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</button>',ok:'<button class="alertify-button alertify-button-ok" id="alertify-ok">{{ok}}</button>',cancel:'<button class="alertify-button alertify-button-cancel" id="alertify-cancel">{{cancel}}</button>'},input:'<div class="alertify-text-wrapper"><input type="text" class="alertify-text" id="alertify-text"></div>',message:'<p class="alertify-message">{{message}}</p>',log:'<article class="alertify-log{{class}}">{{message}}</article>'},y=function(){var t,n,s=!1,o=i.createElement("fakeelement"),r={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"};for(t in r)if(o.style[t]!==e){n=r[t],s=!0;break}return{type:n,supported:s}},n=function(t){return i.getElementById(t)},h={labels:{ok:"OK",cancel:"Cancel"},delay:5e3,buttonReverse:!1,buttonFocus:"ok",transition:e,addListeners:function(t){var e,n,a,l,c,u="undefined"!=typeof o,f="undefined"!=typeof s,y="undefined"!=typeof p,h="",b=this;e=function(e){return"undefined"!=typeof e.preventDefault&&e.preventDefault(),a(e),"undefined"!=typeof p&&(h=p.value),"function"==typeof t&&("undefined"!=typeof p?t(!0,h):t(!0)),!1},n=function(e){return"undefined"!=typeof e.preventDefault&&e.preventDefault(),a(e),"function"==typeof t&&t(!1),!1},a=function(){b.hide(),b.unbind(i.body,"keyup",l),b.unbind(r,"focus",c),y&&b.unbind(d,"submit",e),u&&b.unbind(o,"click",e),f&&b.unbind(s,"click",n)},l=function(t){var i=t.keyCode;i!==v.SPACE||y||e(t),i===v.ESC&&f&&n(t)},c=function(){y?p.focus():!f||b.buttonReverse?o.focus():s.focus()},this.bind(r,"focus",c),u&&this.bind(o,"click",e),f&&this.bind(s,"click",n),this.bind(i.body,"keyup",l),y&&this.bind(d,"submit",e),this.transition.supported||this.setFocus()},bind:function(t,e,n){"function"==typeof t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent&&t.attachEvent("on"+e,n)},handleErrors:function(){if("undefined"!=typeof t.onerror){var e=this;return t.onerror=function(t,n,i){e.error("["+t+" on line "+i+" of "+n+"]",0)},!0}return!1},appendButtons:function(t,e){return this.buttonReverse?e+t:t+e},build:function(t){var e="",n=t.type,i=t.message,s=t.cssClass||"";switch(e+='<div class="alertify-dialog">',"none"===h.buttonFocus&&(e+='<a href="#" id="alertify-noneFocus" class="alertify-hidden"></a>'),"prompt"===n&&(e+='<form id="alertify-form">'),e+='<article class="alertify-inner">',e+=b.message.replace("{{message}}",i),"prompt"===n&&(e+=b.input),e+=b.buttons.holder,e+="</article>","prompt"===n&&(e+="</form>"),e+='<a id="alertify-resetFocus" class="alertify-resetFocus" href="#">Reset Focus</a>',e+="</div>",n){case"confirm":e=e.replace("{{buttons}}",this.appendButtons(b.buttons.cancel,b.buttons.ok)),e=e.replace("{{ok}}",this.labels.ok).replace("{{cancel}}",this.labels.cancel);break;case"prompt":e=e.replace("{{buttons}}",this.appendButtons(b.buttons.cancel,b.buttons.submit)),e=e.replace("{{ok}}",this.labels.ok).replace("{{cancel}}",this.labels.cancel);break;case"alert":e=e.replace("{{buttons}}",b.buttons.ok),e=e.replace("{{ok}}",this.labels.ok)}return u.className="alertify alertify-"+n+" "+s,c.className="alertify-cover",e},close:function(t,e){var n,i,s=e&&!isNaN(e)?+e:this.delay,o=this;this.bind(t,"click",function(){n(t)}),i=function(t){t.stopPropagation(),o.unbind(this,o.transition.type,i),f.removeChild(this),f.hasChildNodes()||(f.className+=" alertify-logs-hidden")},n=function(t){"undefined"!=typeof t&&t.parentNode===f&&(o.transition.supported?(o.bind(t,o.transition.type,i),t.className+=" alertify-log-hide"):(f.removeChild(t),f.hasChildNodes()||(f.className+=" alertify-logs-hidden")))},0!==e&&setTimeout(function(){n(t)},s)},dialog:function(t,e,n,s,o){l=i.activeElement;var r=function(){f&&null!==f.scrollTop&&c&&null!==c.scrollTop||r()};if("string"!=typeof t)throw new Error("message must be a string");if("string"!=typeof e)throw new Error("type must be a string");if("undefined"!=typeof n&&"function"!=typeof n)throw new Error("fn must be a function");return"function"==typeof this.init&&(this.init(),r()),g.push({type:e,message:t,callback:n,placeholder:s,cssClass:o}),m||this.setup(),this},extend:function(t){if("string"!=typeof t)throw new Error("extend method must have exactly one paramter");return function(e,n){return this.log(e,t,n),this}},hide:function(){var t,e=this;g.splice(0,1),g.length>0?this.setup(!0):(m=!1,t=function(n){n.stopPropagation(),u.className+=" alertify-isHidden",e.unbind(u,e.transition.type,t)},this.transition.supported?(this.bind(u,this.transition.type,t),u.className="alertify alertify-hide alertify-hidden"):u.className="alertify alertify-hide alertify-hidden alertify-isHidden",c.className="alertify-cover alertify-cover-hidden",l.focus())},init:function(){i.createElement("nav"),i.createElement("article"),i.createElement("section"),c=i.createElement("div"),c.setAttribute("id","alertify-cover"),c.className="alertify-cover alertify-cover-hidden",i.body.appendChild(c),u=i.createElement("section"),u.setAttribute("id","alertify"),u.className="alertify alertify-hidden",i.body.appendChild(u),f=i.createElement("section"),f.setAttribute("id","alertify-logs"),f.className="alertify-logs alertify-logs-hidden",i.body.appendChild(f),i.body.setAttribute("tabindex","0"),this.transition=y(),delete this.init},log:function(t,e,n){var i=function(){f&&null!==f.scrollTop||i()};return"function"==typeof this.init&&(this.init(),i()),f.className="alertify-logs",this.notify(t,e,n),this},notify:function(t,e,n){var s=i.createElement("article");s.className="alertify-log"+("string"==typeof e&&""!==e?" alertify-log-"+e:""),s.innerHTML=t,f.appendChild(s),setTimeout(function(){s.className=s.className+" alertify-log-show"},50),this.close(s,n)},set:function(t){var e;if("object"!=typeof t&&t instanceof Array)throw new Error("args must be an object");for(e in t)t.hasOwnProperty(e)&&(this[e]=t[e])},setFocus:function(){p?(p.focus(),p.select()):a.focus()},setup:function(t){var i,l=g[0],c=this;m=!0,i=function(t){t.stopPropagation(),c.setFocus(),c.unbind(u,c.transition.type,i)},this.transition.supported&&!t&&this.bind(u,this.transition.type,i),u.innerHTML=this.build(l),r=n("alertify-resetFocus"),o=n("alertify-ok")||e,s=n("alertify-cancel")||e,a="cancel"===h.buttonFocus?s:"none"===h.buttonFocus?n("alertify-noneFocus"):o,p=n("alertify-text")||e,d=n("alertify-form")||e,"string"==typeof l.placeholder&&""!==l.placeholder&&(p.value=l.placeholder),t&&this.setFocus(),this.addListeners(l.callback)},unbind:function(t,e,n){"function"==typeof t.removeEventListener?t.removeEventListener(e,n,!1):t.detachEvent&&t.detachEvent("on"+e,n)}},{alert:function(t,e,n){return h.dialog(t,"alert",e,"",n),this},confirm:function(t,e,n){return h.dialog(t,"confirm",e,"",n),this},extend:h.extend,init:h.init,log:function(t,e,n){return h.log(t,e,n),this},prompt:function(t,e,n,i){return h.dialog(t,"prompt",e,n,i),this},success:function(t,e){return h.log(t,"success",e),this},error:function(t,e){return h.log(t,"error",e),this},set:function(t){h.set(t)},labels:h.labels,debug:h.handleErrors}},"function"==typeof define?define([],function(){return new n}):"undefined"==typeof t.alertify&&(t.alertify=new n)}(this);