const fg = require('fast-glob');
const path = require('path');
const fs = require('fs');
const postcss = require('postcss');

const atomMap = {
  'position:absolute':'absolute',
  'position:relative':'relative',
  'white-space':'ws',
  'overflow':'of',
  'line-height':'lh',
  'font-size':'fs',
  'color':'c',
  'border-radius':'br',
  'border':'b',
  'background-image':'bi',
  'background-color':'bc',
  'transform':'t',
  'margin-top':'mt',
  'bottom':'b',
  'font-family':'ff',
  'font-weight':'fw',
  'text-align':'ta',
  'border-bottom-left-radius':'bblr',
  'justify-content':'jc',
  'display':'d',
  'flex-wrap':'flw'
}
const numberAtomMap = {
  'padding-left':'pl',
  'padding-bottom':'pb',
  'padding-top':'pt',
  'padding-right':'pr',
  'padding':'p',
  'margin-left':'ml',
  'margin-bottom':'mb',
  'margin-top':'mt',
  'margin-right':'mr',
  'margin':'m',
  'height':'h',
  'width':'w',
  'max-width':'min-w',
  'right':'right',
  'top':'top',
  'left':'left',
  'bottom':'bottom',
  'max-width':'max-w',
  'min-height':'min-h',
  'max-height':'max-h'
}
const scanFiles = (dirs, cssName) => {
  let files = {}
  dirs.length && dirs.forEach(dir=>{
    if(!files[`${dir}`]) files[`${dir}`] = []
    files[`${dir}`] = files[`${dir}`].concat(fg.sync([`${dir}/**/*.${cssName}`]))
  })
  return files
}

const postCssCollect = (options = {})  => {
  const classCollection = options.classCollection
  return {
    postcssPlugin:'postcss-get-common',
    Rule(node) {
      if(node.parent.type === 'root'){
        let commonRule = 
        node.nodes.forEach((rule)=>{
          console.log('rule',node.selector,rule.prop,rule.value)
        })
      }
    },
    AtRule: {
      media: (atRule) => {
        atRule.nodes.forEach((rule)=>{
          rule.nodes.forEach((node)=>{
            console.log('atrule',node.prop,node.value,atRule.name,atRule.params,rule.selector )
          })
        })
      },
      keyframes: (atRule) => {
        atRule.nodes.forEach((rule)=>{
          rule.nodes.forEach((node)=>{
            console.log('atrule',node.prop,node.value,atRule.name,atRule.params,rule.selector )
          })
        })
      }
    }
  }
}

const collectClass = async (Files) => {
  if(!Object.keys(Files).length) return

  let AllClass = ''
  let promiseArr = []

  for(let filePackage in Files){

    Files[filePackage].forEach(file=>{
      promiseArr.push(
        new Promise((resolve,reject)=>{
          fs.readFile(file, (err,data) => {
            if(err) reject(err)
            postcss(postCssCollect({
              classCollection: AllClass
            })).process(data).then(()=>{
              resolve()
            }).catch((err)=>{
              reject(err)
              console.log(err,'收集class阶段wxss文件执行失败')
            })
          })
        })
      )
    })
  }

  await Promise.all(promiseArr).catch(err=>{
    console.log('postCssCollect err',err)
  })
  return new Promise((resolve,reject) => {
    resolve(AllClass)
  })
}
const writeFile = () => {

}
const init = () => {
  const files = scanFiles(['dist/wx','dist/wx/components'],'wxss')
  const css = collectClass(files)
  // fs.writeFile(path.join(importClass,`${commonStyle}.${cssName}`),subpackageCommonRoot.toString(),()=>{
  //   if (err) throw err;
  //   // console.log('The file has been saved!');
  // })
}
init()