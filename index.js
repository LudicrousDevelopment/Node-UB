const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')

app.get('/', (req, res) => {
  res.send('<form action="/proxy" method=GET><input name="url"></form>')
})

app.get('/proxy', (req, res) => {
  if (req.query.url) {
    var Regex = /\s+(href|src)=['`"](.*?)['`"]/gi;
    var DeleteRegex = /\s+(http-equiv|nonce|integrity)=['`"](.*?)['`"]/gi
    var r = {}
    if (req.query.url.startsWith`inject`) return res.writeHead(200, {'content-type': 'application/javscript'}).end(fs.readFileSync('./inject.js').toString())
    https.request(req.query.url.replace(/lolLocation/g, 'location'), {method: req.method, headers: {}}, (response) => {
      var chunks = []
      response.on('data', chunk => chunks.push(chunk)).on('end', () => {
        var text = Buffer.concat(chunks)
        function rewriteURL(url) {
          var Url = new URL(req.query.url)
          url = url.replace(/^\/\//g, Url.protocol+'//')
          if (url.startsWith('http')) return '/proxy?url='+url;
          url = '/proxy?url=https://'+Url.hostname+(url.startsWith('/')?url:'/'+url)
          return url
        }
        function rewriteHeaders(headers) {
          var newHeaders = Object.assign({}, headers);
          ['content-security-policy'].forEach(e => delete newHeaders[e])
          return newHeaders
        }
        function rewriteHTML(html) {
          return '<script src="/proxy?url=inject"></script>'+html.toString().replace(Regex, (str, p1, p2) => {
            return ` data-proxy_${p1}=${p2} ${p1}="${rewriteURL(p2)}"`
          }).replace(DeleteRegex, (str, p1, p2) => {
            return ` no${p1}="${p2}"`
          })
        }
        var rewriteJS = require('./js')
        switch(response.headers['content-type'].split('; ')[0]) {
          case "text/html":
            text = rewriteHTML(text)
            break;
          case "text/javascript":
          case "application/javascript":
          case "text/js":
            text = rewriteJS(text)
        }
        //console.log(rewriteURL('https://discord.com'))
        //console.log(Buffer.concat(chunks).toString().match(Regex))
        return res.writeHead(response.statusCode, rewriteHeaders(response.headers)).end(text)
      })
    }).end()
  } else {
    res.send('Please Specity <code>req.query,url</code>')
  }
})

app.listen(8080, () => {console.log('https://localhost:8080')})

function InitVariableRewrites(node) {
  node.declarations = node.declarations.map(declaration => {
    //console.log(declaration)
    if (declaration.init) {
      switch(declaration.init.type) {
        case 'Literal':
          return declaration;
          break;
        case "MemberExpression":
          var exp = declaration.init.object
          if (exp.object&&(exp.object.name!=='window'||exp.object.name!=='document')) return declaration
          var newProxyObject = {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: '$Rhodium' },
            property: { type: 'Identifier', name: 'get' }
          }
          exp.callee = newProxyObject
          exp.arguments = [{type: 'MemberExpression', object: {type: 'Identifier', name: exp.object.name}, property: {name: exp.property.name, type: 'Identifier'}}]
          delete exp.object
          delete exp.property
          delete exp.start
          delete exp.end
          exp.type = 'CallExpression'
          declaration.init.object = exp
          return declaration
          break;
      }
    } else {
      
    }
  })
  return node
}

function InitExpressionRewrites(node) {
  if (node.expression) {
    var exp = node.expression.object
    if (exp.object.object&&(exp.object.name!=='window'||exp.object.name!=='document')) return node
    var newProxyObject = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: '$Rhodium' },
      property: { type: 'Identifier', name: 'get' }
    }
    exp.callee = newProxyObject
    exp.arguments = []
    delete exp.object
    delete exp.property
    delete exp.start
    delete exp.end
    exp.type = 'CallExpression'
    node.expression.object = exp
  }
  return node
}

/*let acorn = require("acorn");
var ast = acorn.parse('function sus() {window.location.host}', {ecmaVersion: 2020})
/*ast.body.forEach(node => {
  if (node.type=='VariableDeclaration') {
    switch(node.kind) {
      case "var":
        node = InitVariableRewrites(node)
        return node
        break;
      default:
        break;
    }
  }
  if (node.type=='ExpressionStatement') {
    node = InitExpressionRewrites(node)
  }
})*/

/*const walk = require("acorn-walk")

walk.simple(ast, {
  ExpressionStatement(node) {
    node = InitExpressionRewrites(node)
  },
  VariableDeclaration(node) {
    node = InitVariableDeclaration(node)
  }
})



var escodegen = require('escodegen')*/
//console.log(escodegen.generate(ast, {comment: true}));