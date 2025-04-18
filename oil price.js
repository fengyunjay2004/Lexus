/*
上海油价监控 surge专用
*/
const $ = new Env('上海油价监控');

// 主函数
!(async () => {
  try {
    // 发送 GET 请求
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Proxy-Connection': 'keep-alive',
      'Referer': 'http://www.qiyoujiage.com/shanghai.shtml',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    };
    
    const response = await $.http.get({
      url: 'http://www.qiyoujiage.com/shanghai.shtml',
      headers: headers
    });
    
    // 解析网页内容
    const html = response.body;
    const youjiaCont = getElementBySelector(html, '#youjiaCont > div:nth-child(2)');
    
    if (youjiaCont) {
      // 提取内容文本
      const contentText = youjiaCont.replace(/<[^>]+>/g, '').trim();
      
      // 使用正则表达式提取日期（例如 "4月17日"）
      const datePattern = /(\d{1,2}月\d{1,2}日)/;
      const dateMatch = contentText.match(datePattern);
      
      if (dateMatch) {
        const extractedDateStr = dateMatch[1];
        
        // 获取今天日期并格式化为 "4月18日"（去除前导零）
        const today = new Date();
        const todayStr = formatDate(today);
        
        // 计算昨天和明天的日期
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);
        
        // 判断提取的日期是否是昨天、今天或明天
        let message = null;
        if (extractedDateStr === todayStr) {
          message = `今日上海油价消息: ${contentText}`;
          $.log(`今天的消息: ${message}`);
        } else if (extractedDateStr === yesterdayStr) {
          message = `昨日上海油价消息: ${contentText}`;
          $.log(`昨天的消息: ${message}`);
        } else if (extractedDateStr === tomorrowStr) {
          message = `明日上海油价消息: ${contentText}`;
          $.log(`明天的消息: ${message}`);
        } else {
          $.log("提取的日期与今天相差超过一天，不发送通知。");
        }
        
        // 如果有消息，发送Surge通知
        if (message) {
          $.notify("上海油价监控", "", message);
        }
      } else {
        const errorMsg = "未找到日期信息！";
        $.log(errorMsg);
        $.notify("上海油价监控", "错误", errorMsg);
      }
    } else {
      const errorMsg = "没有找到匹配的内容！";
      $.log(errorMsg);
      $.notify("上海油价监控", "错误", errorMsg);
    }
  } catch (e) {
    $.log(`发生错误: ${e.message}`);
    $.notify("上海油价监控", "错误", `运行时出错: ${e.message}`);
  } finally {
    $.done();
  }
})();

// 工具函数：格式化日期为 "4月18日" 格式（去除前导零）
function formatDate(date) {
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  return `${month}月${day}日`;
}

// 工具函数：简单的选择器解析函数
function getElementBySelector(html, selector) {
  // 这里只是一个简单实现，用于提取 #youjiaCont > div:nth-child(2) 的内容
  // 实际使用中可能需要更复杂的解析
  const regex = /<div[^>]*id=["']youjiaCont["'][^>]*>[\s\S]*?<div[\s\S]*?>([\s\S]*?)<\/div>/i;
  const match = html.match(regex);
  return match ? match[1] : null;
}

// Surge 环境模拟
function Env(name) {
  this.name = name;
  this.log = (msg) => console.log(`[${name}] ${msg}`);
  this.notify = (title, subtitle, message) => {
    $notification.post(title, subtitle, message);
    this.log(`通知: ${title} ${subtitle} ${message}`);
  };
  this.http = {
    get: async (options) => {
      return new Promise((resolve, reject) => {
        $httpClient.get(options, (error, response, body) => {
          if (error) reject(error);
          else resolve({response, body});
        });
      });
    }
  };
  this.done = () => $done({});
}
