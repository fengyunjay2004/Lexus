//////// api1 ///////////
var body = $response.body;
var obj = JSON.parse(body);
obj = {
  "username": "18616871168",
  "is_vip": true,
  "is_join_qw": 1,
  "is_join_service_qw": 1,
  "is_join_convert_qw": 1,
  "is_countdown_remind": 1,
  "is_month_cycle": 1,
  "member_status": 1,
  "vip_start_date": "2024-02-20",
  "vip_end_date": "2099-12-12",
  "used_right_count": 1,
  "remain_right_count": 1,
  "up_level_discount": 1,
  "renewal_discount": 1,
  "register_discount": 1,
  "deadline_discount": 1,
  "one_yuan_discount": 1,
  "vip_price": 19800,
  "vip_fake_price": 24800,
  "year_vip_price": 19800,
  "year_vip_fake_price": 24800,
  "month_vip_price": 2500,
  "month_vip_product_fake_price": 2900,
  "double_vip_price": 0,
  "double_vip_fake_price": 0,
  "date_joined": "2024-02-27",
  "all_click_count": 1,
  "read_listen_book_count": 1
}
body = JSON.stringify(obj);
$done({body});
