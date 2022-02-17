var Acorn = require('acorn')
var Walk = require('acorn-walk')
var Escodegen = require('escodegen')

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
          exp.type = 'CallExpression'
          exp.callee = {type: 'MemberExpression', object: {type: 'Identifier', name: '$Rhodium'}, property: {type: 'Identifier', name: 'get'}}
          exp.arguments = [{type: 'MemberExpression', object: {type: 'Identifier', name: exp.object.name||'amongus'}, property: {type: 'Identifier', name: exp.object.property?exp.object.property.name:'sus'}}]
          if (!exp.object.property) delete exp.arguments[0].property
          declaration.init.object = exp
          return declaration;
          break;
      }
    } else {
      
    }
  })
  return node
}

function InitCalculatorRewrites(node) {
  if (node.expression) {
    var exp = node.expression
    console.log(exp)
    if (exp.left&&exp.left.object&&exp.left.object.object&&(exp.left.object.object.name=='window'||exp.left.object.object.name=='self'||exp.left.object.object.name=='this')) {
      exp = exp.left
      var obj = exp.object
      exp.object = {}
      var dxp = exp
      exp = exp.object
      exp.type = 'CallExpression'
      dxp.property = {type: 'Identifier', name: dxp.object.name}
      exp.callee = {type:'MemberExpression', object: {type: 'Identifier', name: '$Rhodium'}, property: {name: 'get', type: 'Identifier'}}
      exp.arguments = [{type: 'MemberExpression', object: {type: 'Identifier', name: obj.object.name}, property: {name: obj.property.name, type: 'Identifier'}}]
      dxp.object = exp
      node.expression.left = dxp
    }
    if (exp.right&&exp.right.object&&exp.right.object.name=='window') {
      
    }
  }
  return node
}

function InitExpressionRewrites(node) {
  if (node.expression) {
    var exp = node.expression.object
    if (node.type=='ExpressionStatement') return InitCalculatorRewrites(node)
    if (exp.object&&(exp.object.name!=='window'||exp.object.name!=='document')) return node
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

function rewriteJS(js) {
  js = js.toString()
  const ast = Acorn.parse(js, {ecmaVersion: 2020})
  Walk.simple(ast, {
    ExpressionStatement(node) {
      node = InitExpressionRewrites(node)
    },
    VariableDeclaration(node) {
      node = InitVariableRewrites(node)
    }
  })
  return Escodegen.generate(ast, {comment: true})
}

console.log((rewriteJS('var amongus = window.location.href')))

module.exports = rewriteJS