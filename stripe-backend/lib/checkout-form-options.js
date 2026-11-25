"use strict";

const SHIPPING_ALLOWED_COUNTRIES = ["CA","MX","US","AG","AI","AW","BB","BL","BM","BQ","BS","BZ","CR","CW","DM","DO","GD","GL","GP","GT","HN","HT","JM","KN","KY","LC","MF","MQ","MS","NI","PA","PM","PR","SV","SX","TC","TT","VC","VG","AD","AL","AT","AX","BA","BE","BG","BY","CH","CZ","DE","DK","EE","ES","FI","FO","FR","GB","GG","GI","GR","HR","HU","IE","IM","IS","JE","LI","LT","LU","LV","MC","MD","ME","MK","MT","NL","NO","PL","PT","RO","RS","RU","SE","SI","SJ","SK","SM","UA","VA","AO","BF","BI","BJ","BW","CD","CF","CG","CI","CM","CV","DJ","DZ","EG","ER","ET","GA","GH","GM","GN","GQ","GW","IO","KE","KM","LR","LS","LY","MA","MG","ML","MR","MU","MW","MZ","NA","NE","NG","RE","RW","SC","SH","SL","SN","SO","SS","ST","SZ","TD","TF","TG","TN","TZ","UG","YT","ZA","ZM","ZW","AR","BO","BR","BV","CL","CO","EC","FK","GF","GS","GY","PE","PY","SR","UY","VE","AE","AF","AM","AZ","BD","BH","BN","BT","CN","CY","GE","HK","ID","IL","IN","IQ","JO","JP","KG","KH","KW","KZ","LA","LB","LK","MM","MN","MO","MV","MY","NP","OM","PH","PK","QA","SA","SG","TH","TJ","TL","TM","TR","TW","UZ","VN","YE","AU","CK","FJ","KI","NC","NR","NU","NZ","PF","PG","PN","SB","TK","TO","TV","VU","WF","WS"];

module.exports = function checkoutFormOptions() {
  return {
    ui_mode: "form",
    billing_address_collection: "required",
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: true },
    submit_type: "auto",
    shipping_address_collection: {
      allowed_countries: SHIPPING_ALLOWED_COUNTRIES
    },
    saved_payment_method_options: {
      payment_method_save: "enabled"
    },
    integration_identifier: "custom_embedded_web_0001"
  };
};
