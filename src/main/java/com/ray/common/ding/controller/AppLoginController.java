package com.ray.common.ding.controller;

import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;
import com.dingtalk.api.DefaultDingTalkClient;
import com.dingtalk.api.DingTalkClient;
import com.dingtalk.api.request.OapiDepartmentGetRequest;
import com.dingtalk.api.request.OapiUserGetRequest;
import com.dingtalk.api.request.OapiUserGetuserinfoRequest;
import com.dingtalk.api.response.OapiDepartmentGetResponse;
import com.dingtalk.api.response.OapiUserGetResponse;
import com.dingtalk.api.response.OapiUserGetuserinfoResponse;
import com.jfinal.core.Controller;
import com.jfinal.core.NotAction;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.ray.common.ding.AccessTokenUtil;
import com.ray.common.ding.Env;
import com.ray.common.model.UserRole;
import com.ray.util.ServiceResult;
import com.taobao.api.ApiException;

public class AppLoginController extends Controller {
	@SuppressWarnings("rawtypes")
	public void login() throws ApiException {
        //获取accessToken,注意正是代码要有异常流处理
        String accessToken = AccessTokenUtil.getToken();

        //获取用户信息
        DingTalkClient client = new DefaultDingTalkClient(Env.URL_GET_USER_INFO);
        OapiUserGetuserinfoRequest request = new OapiUserGetuserinfoRequest();
        request.setCode(getPara("authCode"));
        request.setHttpMethod("GET");
        OapiUserGetuserinfoResponse response = new OapiUserGetuserinfoResponse();
        try {
            response = client.execute(request, accessToken);
        } catch (ApiException e) {
            e.printStackTrace();
            renderNull();
        }
        //3.查询得到当前用户的userId
        // 获得到userId之后应用应该处理应用自身的登录会话管理（session）,避免后续的业务交互（前端到应用服务端）每次都要重新获取用户身份，提升用户体验
        String userId = response.getUserid();
        
        OapiUserGetResponse userinfo = getUserInfo(accessToken, userId);
        Record user = Db.findFirst("select * from user where ding_user_id = '"+userinfo.getUserid()+"'");
		if(user==null) {
			user = new Record();
			user.set("username", userinfo.getMobile());
			user.set("password", userinfo.getMobile());
			user.set("nickname", userinfo.getName());
			user.set("ding_user_id", userinfo.getUserid());
			Db.save("user", user);
			UserRole ur = new UserRole();
			ur.setRoleId(2);
			ur.setUserId(user.get("id"));
			ur.save(); 
		}
        
        //获取用户部门名称
        String departs = "";
        for (int i = 0; i < userinfo.getDepartment().size(); i++) {
        	DingTalkClient client1 = new DefaultDingTalkClient("https://oapi.dingtalk.com/department/get");
            OapiDepartmentGetRequest request1 = new OapiDepartmentGetRequest();
            request1.setId(userinfo.getDepartment().get(i).toString());
            request1.setHttpMethod("GET");
            OapiDepartmentGetResponse response1 = client1.execute(request1, accessToken);
            departs += response1.getName()+",";
		}
        departs = departs.substring(0, departs.length()-1);
        /*Map<String, Object> map = FastJson.getJson().parse(userinfo.getBody(), Map.class);
        Record user = new Record().setColumns(map);*/
        //返回结果
        Map<String, Object> resultMap = new HashMap<>();
        JSONObject jb = JSONObject.parseObject(userinfo.getBody());
        jb.put("departments", departs);
        jb.put("id", user.getInt("id"));
        resultMap.put("userinfo", jb.toString());
        ServiceResult serviceResult = ServiceResult.success(resultMap);
        renderJson(serviceResult);
    }
    
    /**
              * 获取用户详情
     *
     * @param accessToken
     * @param userId
     * @return
     */
    @NotAction
    private OapiUserGetResponse getUserInfo(String accessToken, String userId) {
        try {
            DingTalkClient client = new DefaultDingTalkClient(Env.URL_USER_GET);
            OapiUserGetRequest request = new OapiUserGetRequest();
            request.setUserid(userId);
            request.setHttpMethod("GET");
            OapiUserGetResponse response = client.execute(request, accessToken);
            return response;
        } catch (ApiException e) {
            e.printStackTrace();
            return null;
        }
    }
}
