
    // export default functions that are handy and usable with the javascrip expression field
    // expand if you need, you will to do a rebuild
const https=require('https')
const axios=require("axios")
const fs = require("fs")
const logger=require("../lib/logger");
const jq=require("node-jq")
const YAML=require("yaml")
const credentialModel = require("../models/credential.model")

exports.fnGetNumberedName=function(names,pattern,value,fillgap){
  var nr=null
  var nrsequence
  var regex
  var nrs
  var re=new RegExp("[^\#]*(\#+)[^\#]*")
  var patternmatch=re.exec(pattern)
  if(!names || !Array.isArray(names)){
    logger.warn("fnGetNumberedName, No input or no array")
    return value
  }
  if(patternmatch && patternmatch.length==2){
  	nrsequence=patternmatch[1]
	  regex="^" + pattern.replace(nrsequence,"([0-9]{"+nrsequence.length+"})") + "$"
    nrs=names.map((item)=>{
      var regexp=new RegExp(regex,"g");
      var matches=regexp.exec(item)
      if(matches && matches.length==2){
        return parseInt(matches[1])
      }else{
        null
      }
    }).filter((item)=>(item))
    var gaps=nrs.reduce(function(acc, cur, ind, arr) {
      var diff = cur - arr[ind-1];
      if (diff > 1) {
        var i = 1;
        while (i < diff) {
          acc.push(arr[ind-1]+i);
          i++;
        }
      }
      return acc;
    }, []);
    var max=(nrs.length>0)?Math.max(...nrs):null
    var gap=(gaps.length>0)?Math.min(...gaps):null
    if(max){
      nr=max+1
    }
    if(fillgap && gap){
      nr=gap
    }
    if(nr){
      var tmp = pattern.replace(nrsequence,nr.toString().padStart(nrsequence.length,"0"))
      return tmp
    }else{
      logger.warn("fnGetNumberedName, no pattern matches found in the list")
    	return value
    }
  }else{
    logger.warn("fnGetNumberedName, no pattern found, use ### for numbers")
	  return value
  }
}
exports.fnJq=async function(input,jqe){
    const jq = require('node-jq')
    let result=undefined
    try{
      result=await jq.run(jqe, input, { input:"json",output:"json" })
    }catch(e){
      logger.error("Error in fnJq : " + e)
    }
    return result
}
exports.fnCopy=function(input){
    return input
},
exports.fnMap=function(input,map){
  let result=input
  if(!Array.isArray){
    logger.warn("Warning in fnMap : input is not an array")
    return result
  }
  if(!map){
    logger.warn("Warning in fnMap : map code not provided")
    return result
  }

  try{
    result = eval("result.map("+map+")")
  }catch(e){
    logger.error("Error in fnMap : " + e)
  }
  return result
}
exports.fnSort=function(input,sort){
  let result=input
  if(!Array.isArray){
    logger.warn("Warning in fnSort : input is not an array")
    return result
  }
  if(!sort){
    logger.warn("Warning in fnSort : sort code not provided")
    return result
  }

  try{
    result = eval("result.sort("+sort+")")
  }catch(e){
    logger.error("Error in fnSort : " + e)
  }
  return result
}
exports.fnSum = function(a,b) { return a+b };
exports.fnMultiply = function(a,b) { return a*b };
exports.fnReadJsonFile = async function(path,jqe) {
  if(!path)return undefined
  let result=undefined
  try{
    let rawdata = fs.readFileSync(path,'utf8');
    result = JSON.parse(rawdata)
    if(jqe){
      result=await jq.run(jqe, result, { input:"json",output:"json" })
    }
  }catch(e){
    logger.error("Error in fnReadJsonFile : " + e)
  }
  return result
};
exports.fnReadYamlFile = async function(path,jqe) {
  if(!path)return undefined
  let result=undefined
  try{
    let rawdata = fs.readFileSync(path,'utf8');
    result = YAML.parse(rawdata)
    if(jqe){
      result=await jq.run(jqe, result, { input:"json",output:"json" })
    }
  }catch(e){
    logger.error("Error in fnReadYamlFile : " + e)
  }
  return result
};
exports.fnRestBasic = async function(action,url,body,credential,jqe,sort,map){
  var headers={}
  if(credential){
    try{
      restCreds = await credentialModel.findByName(credential)
    }catch(e){
      logger.error(e)
    }
    headers.Authorization="Basic " + Buffer.from(restCreds.user + ':' + restCreds.password).toString('base64')
  }
  return await exports.fnRestAdvanced(action,url,body,headers,jqe,sort,map)
}
exports.fnRestAdvanced = async function(action,url,body,headers,jqe,sort,map){
  if(!action || !url){
    logger.warning("[fnRest] No action or url defined")
    return undefined
  }
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  })
  var axiosConfig = {
    headers: {},
    httpsAgent:httpsAgent
  }
  if(headers){
    axiosConfig.headers=headers
  }

  let result=[]
  try{
    if(action=="get"){
      data = await axios.get(url,axiosConfig);
    }else if(action=="post"){
      data = await axios.post(url,body,axiosConfig);
    }else if(action=="delete"){
      data = await axios.post(url,axiosConfig);
    }else if(action=="put"){
      data = await axios.put(url,body,axiosConfig);
    }
    result=data.data
    if(jqe){
      result=await jq.run(jqe, result, { input:"json",output:"json" })
    }
    if(sort){
      if(Array.isArray(result)){
        result = eval("result.sort("+sort+")")
      }else{
        logger.debug("Skipping sort eval, no array")
      }

    }
    if(map){
      if(Array.isArray(result)){
        result = eval("result.map("+map+")")
      }else{
        logger.debug("Skipping map eval, no array")
      }

    }
  }catch(e){
    logger.error("Error in fnRestBasic : " + e)
  }
  logger.silly("Basic rest result : " + JSON.stringify(result))
  return result

}
exports.fnRestJwt = async function(action,url,body,token,jqe,sort,map){
  var headers={}
  if(token){
    headers.Authorization="Bearer " + token
  }
  return await exports.fnRestAdvanced(action,url,body,headers,jqe,sort,map)
}
// etc
