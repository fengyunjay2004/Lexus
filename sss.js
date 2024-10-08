/*
===================
[MITM]
hostname = fwdt.shengongshe.org

===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
^https:\/\/fwdt\.shengongshe\.org\/sgsWchartApi\/api\/User\/getUserInfoForApp url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/sss.js
 
*/

const APIKey = "yy_10000";
const $ = new API(APIKey, true);

if ($request) GetHeaders();

function GetHeaders() {
  // 检查 URL 是否匹配目标请求
  if ($request.url.indexOf("https://fwdt.shengongshe.org/sgsWchartApi/api/User/getUserInfoForApp") !== -1) {
    // 获取请求头中的字段
    
    let xsrfToken = $request.headers['X-XSRF-TOKEN'];   // 提取 X-XSRF-TOKEN
    let token = $request.headers['token'];              // 提取 token

    // 如果找到这些字段
    /*
    let cookie = $request.headers['Cookie'];            // 提取 Cookie
    if (cookie) {
      $.write(cookie, `sgs_Cookie`);                    // 保存 Cookie
      $.notify(`成功`, `Cookie 获取成功`, cookie);      // 通知 Cookie 获取成功
      $.info(`Cookie: ${cookie}`);                      // 输出 Cookie 到控制台
    } else {
      $.notify(`失败`, `未找到 Cookie`, `请检查请求头`);  // 如果未找到 Cookie，通知用户
    }
    */

   if (xsrfToken && token) {
     $.write(xsrfToken, `sgs_XSRFToken`);             // 保存 X-XSRF-TOKEN
     $.write(token, `sgs_Token`);                     // 保存 token
     $.notify(`成功`, `X-XSRF-TOKEN 和 Token 获取成功`, `Token值 & X-XSRF-TOKEN值\n${token}&${xsrfToken}`);  // 合并通知   Token值 & X-XSRF-TOKEN值
     $.info(`Token值 & X-XSRF-TOKEN值\n${token}&${xsrfToken}`);  // 输出 X-XSRF-TOKEN 和 Token 到控制台
   } else if (xsrfToken) {
     $.write(xsrfToken, `sgs_XSRFToken`);              // 保存 X-XSRF-TOKEN
     $.notify(`部分成功`, `仅获取到 X-XSRF-TOKEN`, `X-XSRF-TOKEN: ${xsrfToken}`);  // 通知仅获取到 X-XSRF-TOKEN
     $.info(`X-XSRF-TOKEN: ${xsrfToken}`);             // 输出 X-XSRF-TOKEN 到控制台
   } else if (token) {
     $.write(token, `sgs_Token`);                      // 保存 token
     $.notify(`部分成功`, `仅获取到 Token`, `Token: ${token}`);  // 通知仅获取到 Token
     $.info(`Token: ${token}`);                        // 输出 token 到控制台
   } else {
     $.notify(`失败`, `未找到 X-XSRF-TOKEN 和 Token`, `请检查请求头`);  // 未找到 X-XSRF-TOKEN 和 Token 时通知
   }

  }
}

$.done();

/* prettier-ignore */
function ENV(){const isJSBox=typeof require=="function"&&typeof $jsbox!="undefined";return{isQX:typeof $task!=="undefined",isLoon:typeof $loon!=="undefined",isSurge:typeof $httpClient!=="undefined"&&typeof $utils!=="undefined",isBrowser:typeof document!=="undefined",isNode:typeof require=="function"&&!isJSBox,isJSBox,isRequest:typeof $request!=="undefined",isScriptable:typeof importModule!=="undefined",isShadowrocket:"undefined"!==typeof $rocket,isStash:"undefined"!==typeof $environment&&$environment["stash-version"]}}
/* prettier-ignore */
function HTTP(defaultOptions={baseURL:""}){const{isQX,isLoon,isSurge,isScriptable,isNode,isBrowser,isShadowrocket,isStash,}=ENV();const methods=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"];const URL_REGEX=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;function send(method,options){options=typeof options==="string"?{url:options}:options;const baseURL=defaultOptions.baseURL;if(baseURL&&!URL_REGEX.test(options.url||"")){options.url=baseURL?baseURL+options.url:options.url}if(options.body&&options.headers&&!options.headers["Content-Type"]){options.headers["Content-Type"]="application/x-www-form-urlencoded"}options={...defaultOptions,...options};const timeout=options.timeout;const events={...{onRequest:()=>{},onResponse:(resp)=>resp,onTimeout:()=>{},},...options.events,};events.onRequest(method,options);let worker;if(isQX){worker=$task.fetch({method,...options})}else if(isLoon||isSurge||isNode||isShadowrocket||isStash){worker=new Promise((resolve,reject)=>{const request=isNode?require("request"):$httpClient;request[method.toLowerCase()](options,(err,response,body)=>{if(err)reject(err);else resolve({statusCode:response.status||response.statusCode,headers:response.headers,body,})})})}else if(isScriptable){const request=new Request(options.url);request.method=method;request.headers=options.headers;request.body=options.body;worker=new Promise((resolve,reject)=>{request.loadString().then((body)=>{resolve({statusCode:request.response.statusCode,headers:request.response.headers,body,})}).catch((err)=>reject(err))})}else if(isBrowser){worker=new Promise((resolve,reject)=>{fetch(options.url,{method,headers:options.headers,body:options.body,}).then((response)=>response.json()).then((response)=>resolve({statusCode:response.status,headers:response.headers,body:response.data,})).catch(reject)})}let timeoutid;const timer=timeout?new Promise((_,reject)=>{timeoutid=setTimeout(()=>{events.onTimeout();return reject(`${method}URL:${options.url}exceeds the timeout ${timeout}ms`)},timeout)}):null;return(timer?Promise.race([timer,worker]).then((res)=>{clearTimeout(timeoutid);return res}):worker).then((resp)=>events.onResponse(resp))}const http={};methods.forEach((method)=>(http[method.toLowerCase()]=(options)=>send(method,options)));return http}

