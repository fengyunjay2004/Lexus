const $ = new Env('浙江油价监控');

// 主函数
!(async () => {
  try {
    $.log(`开始执行浙江油价监控脚本 - ${new Date().toLocaleString()}`);
    
    // 发送 GET 请求
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Proxy-Connection': 'keep-alive',
      'Referer': 'http://www.qiyoujiage.com/zhejiang.shtml',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    };
    
    $.log("正在请求油价网站...");
    const response = await $.http.get({
      url: 'http://www.qiyoujiage.com/zhejiang.shtml',
      headers: headers
    });
    
    $.log(`网站响应状态: ${response.response.statusCode}`);
    
    // 获取网页内容
    const html = response.body;
    $.log(`获取到网页内容，长度: ${html.length} 字符`);
    
    // 直接查找关键词
    const keyword = "油价4月17日24时";
    $.log(`开始查找关键词: "${keyword}"`);
    
    if (html.includes(keyword)) {
      $.log(`找到关键词: "${keyword}"`);
      
      // 提取包含关键词的整段内容
      const startIndex = Math.max(0, html.indexOf(keyword) - 50);
      const endIndex = Math.min(html.length, html.indexOf(keyword) + 200);
      const context = html.substring(startIndex, endIndex);
      
      $.log(`关键词上下文内容: ${context}`);
      
      // 尝试提取完整的内容块
      let fullContent = "";
      
      // 方法1: 尝试找到包含关键词的完整DIV
      const divPattern = new RegExp(`<div[^>]*>[\\s\\S]*?${keyword}[\\s\\S]*?<\\/div>`, 'i');
      const divMatch = html.match(divPattern);
      
      if (divMatch) {
        $.log("找到包含关键词的DIV元素");
        const rawContent = divMatch[0];
        // 移除HTML标签
        fullContent = rawContent.replace(/<[^>]+>/g, '').trim();
      } else {
        $.log("未找到包含关键词的完整DIV，尝试直接提取内容");
        
        // 方法2: 尝试直接提取包含关键词的段落
        const paragraphPattern = new RegExp(`${keyword}[^<]*`, 'i');
        const paragraphMatch = html.match(paragraphPattern);
        
        if (paragraphMatch) {
          $.log("直接找到关键词所在段落");
          fullContent = paragraphMatch[0];
        } else {
          $.log("无法准确提取内容，返回上下文内容");
          fullContent = context.replace(/<[^>]+>/g, '').trim();
        }
      }
      
      // 进一步清理内容
      fullContent = fullContent.replace(/\s+/g, ' ').trim();
      $.log(`提取的完整内容: ${fullContent}`);
      
      // 提取日期信息
      const datePattern = /(\d{1,2}月\d{1,2}日)/;
      const dateMatch = fullContent.match(datePattern);
      
      if (dateMatch) {
        const extractedDateStr = dateMatch[1];
        $.log(`提取到的日期: ${extractedDateStr}`);
        
        // 获取今天日期并格式化
        const today = new Date();
        const todayStr = formatDate(today);
        
        // 计算昨天和明天的日期
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);
        
        $.log(`今天日期: ${todayStr}, 昨天: ${yesterdayStr}, 明天: ${tomorrowStr}`);
        
        // 判断提取的日期是否是昨天、今天或明天
        let message = null;
        if (extractedDateStr === todayStr) {
          message = `今日浙江油价消息: ${fullContent}`;
        } else if (extractedDateStr === yesterdayStr) {
          message = `昨日浙江油价消息: ${fullContent}`;
        } else if (extractedDateStr === tomorrowStr) {
          message = `明日浙江油价消息: ${fullContent}`;
        } else {
          message = `浙江油价消息(${extractedDateStr}): ${fullContent}`;
        }
        
        $.log(`准备发送通知: ${message}`);
        $.notify("浙江油价监控", "", message);
      } else {
        $.log("在提取的内容中未找到日期信息，直接发送");
        const message = `浙江油价消息: ${fullContent}`;
        $.notify("浙江油价监控", "", message);
      }
    } else {
      // 如果找不到精确关键词，尝试更宽松的搜索
      $.log(`未找到精确关键词"${keyword}"，尝试更宽松的搜索`);
      
      // 尝试匹配"油价"和"24时"
      const loosePattern = /油价\d{1,2}月\d{1,2}日.*?24时/;
      const looseMatch = html.match(loosePattern);
      
      if (looseMatch) {
        $.log(`找到相似内容: ${looseMatch[0]}`);
        
        // 提取包含相似内容的整段
        const startIndex = Math.max(0, html.indexOf(looseMatch[0]) - 20);
        const endIndex = Math.min(html.length, html.indexOf(looseMatch[0]) + 200);
        const context = html.substring(startIndex, endIndex);
        
        // 清理内容
        const cleanContent = context.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        $.log(`提取的相似内容: ${cleanContent}`);
        
        // 发送通知
        $.notify("浙江油价监控", "找到相似内容", cleanContent);
      } else {
        // 最后尝试，只匹配日期和油价
        $.log("尝试匹配日期和油价");
        const dateOilPattern = /\d{1,2}月\d{1,2}日[^<]*油价/;
        const dateOilMatch = html.match(dateOilPattern);
        
        if (dateOilMatch) {
          $.log(`找到日期和油价相关内容: ${dateOilMatch[0]}`);
          
          // 提取上下文
          const startIndex = Math.max(0, html.indexOf(dateOilMatch[0]) - 20);
          const endIndex = Math.min(html.length, html.indexOf(dateOilMatch[0]) + 200);
          const context = html.substring(startIndex, endIndex);
          
          // 清理内容
          const cleanContent = context.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          
          // 发送通知
          $.notify("浙江油价监控", "找到油价相关内容", cleanContent);
        } else {
          $.log("在页面中未找到任何油价相关信息");
          
          // 分析网页整体结构
          const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyContent) {
            $.log("网页正文内容摘要:");
            const bodyText = bodyContent[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            $.log(bodyText.substring(0, 300) + "...");
          }
          
          $.notify("浙江油价监控", "错误", "未找到任何油价相关信息，网站可能已更改");
        }
      }
    }
  } catch (e) {
    $.log(`执行过程中发生错误: ${e.message}`);
    $.log(`错误堆栈: ${e.stack}`);
    $.notify("浙江油价监控", "错误", `运行时出错: ${e.message}`);
  } finally {
    $.log("脚本执行完成");
    $.done();
  }
})();

// 工具函数：格式化日期为 "4月18日" 格式（去除前导零）
function formatDate(date) {
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  return `${month}月${day}日`;
}

// Surge 环境模拟
function Env(name) {
  this.name = name;
  
  this.log = (msg) => {
    console.log(`[${name}] ${msg}`);
    // 将日志保存到持久化存储
    try {
      const existingLogs = $persistentStore.read("debug_logs") || "";
      const timestamp = new Date().toLocaleTimeString();
      const newLog = `${timestamp}: ${msg}\n`;
      $persistentStore.write(existingLogs + newLog, "debug_logs");
    } catch (e) {
      console.log(`保存日志失败: ${e.message}`);
    }
  };
  
  this.notify = (title, subtitle, message) => {
    $notification.post(title, subtitle, message);
    this.log(`通知: ${title} ${subtitle} ${message}`);
  };
  
  this.http = {
    get: async (options) => {
      return new Promise((resolve, reject) => {
        $httpClient.get(options, (error, response, body) => {
          if (error) {
            this.log(`HTTP请求失败: ${error}`);
            reject(error);
          } else {
            this.log(`HTTP请求成功，状态码: ${response.statusCode}`);
            resolve({response, body});
          }
        });
      });
    }
  };
  
  this.done = () => {
    this.log("脚本执行结束");
    $done({});
  };
}
