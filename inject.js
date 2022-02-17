/*var Attribute_Array = ['src','href','srcset']

var CONFIG = {
  query: location.search.split('?')[1].split('&').map((e, ind) => {if (ind==0) return '';return e.split('=').map((b,i)=>i==0?(ind==1?'?':'&')+b:b).join('=')}).join(''),
  url: new URLSearchParams(location.search).get('url')
}

CONFIG.url+=CONFIG.query

window.XMLHttpRequest.prototype.open = new Proxy(window.XMLHttpRequest.prototype.open, {
  construct(g, a) {
    if (a[1]) a[1] = rewriteURL(a[1])
    return Reflect.construct(g, a)
  }
})

function rewriteURL(url) {
    var Url = new URL(CONFIG.url)
    url = url.replace(/^\/\//g, Url.protocol+'//')
    if (url.startsWith('http')) return '/proxy?url='+url;
    url = '/proxy?url=https://'+Url.hostname+(url.startsWith('/')?url:'/'+url)
    console.log(url)
    return url
}

window.Element.prototype.setAttribute = new Proxy(window.Element.prototype.setAttribute, {
  apply(t, g, a) {
    if (Attribute_Array.indexOf(a[0].toLowerCase())>-1) {
      g.dataset['proxy_'+a[0]] = a[1]
      if (a[0]=='srcset') return Reflect.apply(t, g, a)
      a[1] = rewriteURL(a[1])
      return Reflect.apply(t, g, a)
    }
    return Reflect.apply(t, g, a)
  }
})

window.Element.prototype.getAttribute = new Proxy(window.Element.prototype.getAttribute, {
  apply(t, g, a) {
    if (Attribute_Array.indexOf(a[0].toLowerCase())>-1) {
      var c = g.dataset['proxy_'+a[0]]||Reflect.apply(t, g, a)
      return c||''
    }
    return Reflect.apply(t, g, a)||''
  }
})

Attribute_Array.forEach(attr => {
  Object.defineProperty(window.Element, attr, {
    get() {
      return this.getAttribute(attr)
    },
    set(val) {
      return this.setAttribute(attr, val)
    }
  })
})

document.currentScript.remove()*/

var $Rhodium = {}

$Rhodium.get = function(obj) {
  if (obj==window.location) {
    return {}
  }
  return obj
}