//////// api2 ///////////
var body = $response.body;
var obj = JSON.parse(body);
obj.data = {
    "user_info": {
    "status": "login",
    "phonenum": "18616871168",
    "user_auth": "bc3e869a043a642ce5335477042f232f",
    "sessionid": "s49vy3ugf7gm2pdurgbz8jhmnjqv3wqv",
    "head_image": "https://f.diyiedu.com/dynb/img/head6.png",
    "nick_name": "186****1168",
    "utk": 328139565,
    "userid": 43130816,
    "vip_detail": {
      "is_vip": true
    },
    "is_vip": true,
    "ec_name": "",
    "action": {
      "view_name": "main_user",
      "command": "jump_tab"
    }
  },
  "retcode": "SUCC"
};
body = JSON.stringify(obj);
$done({body});
