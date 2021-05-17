package com.ray.common.ding.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.dingtalk.api.DefaultDingTalkClient;
import com.dingtalk.api.DingTalkClient;
import com.dingtalk.api.request.OapiUserGetRequest;
import com.dingtalk.api.request.OapiUserGetuserinfoRequest;
import com.dingtalk.api.response.OapiUserGetResponse;
import com.dingtalk.api.response.OapiUserGetuserinfoResponse;
import com.jfinal.core.Controller;
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
        String dingtoken = AccessTokenUtil.getToken();
        //获取用户信息
        DingTalkClient client = new DefaultDingTalkClient(Env.URL_GET_USER_INFO);
        OapiUserGetuserinfoRequest request = new OapiUserGetuserinfoRequest();
        request.setCode(getPara("authCode"));
        request.setHttpMethod("GET");
        OapiUserGetuserinfoResponse response = new OapiUserGetuserinfoResponse();
        try {
            response = client.execute(request, dingtoken);
        } catch (ApiException e) {
            e.printStackTrace();
            renderNull();
        }
        //查询得到当前用户的userId
        String userId = response.getUserid();
        //根据userId判断是否创建用户，没有则创建        
        DingTalkClient client2 = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/get");
		OapiUserGetRequest request2 = new OapiUserGetRequest();
		request2.setUserid(userId);
		request2.setHttpMethod("GET");
		OapiUserGetResponse response2 = client2.execute(request2, dingtoken);
		Record user = Db.findFirst("select * from user where ding_user_id = '"+response2.getUserid()+"'");
		if(user==null) {
			user = new Record();
			user.set("username", response2.getMobile());
			user.set("password", response2.getMobile());
			user.set("nickname", response2.getName());
			user.set("ding_user_id", response2.getUserid());
			Db.save("user", user);
			UserRole ur = new UserRole();
			ur.setRoleId(2);
			ur.setUserId(user.getInt("id"));
			ur.save(); 
		}
        //根据用户信息获取角色信息
        List<Record> roleIdList =Db.find("select role_id from user_role where user_id ='"+user.get("id")+"'");
        Integer[] roleIds = new Integer[roleIdList.size()];
        for (int i = 0; i < roleIdList.size(); i++) {
        	roleIds[i]=roleIdList.get(i).get("role_id");			
		} 
        //返回结果
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("roleIds", roleIds);
        resultMap.put("user", user);
        ServiceResult serviceResult = ServiceResult.success(resultMap);
        renderJson(serviceResult);
    }
    
    /*
     * 修改密码
     */
    public void changeSecret(){
    	Record result = new Record(); 
    	Record user = Db.findById("user",get("userid"));
    	if(user!=null){
    		if(get("newSecret")!=null&&get("newSecret").equals(get("newSecret1"))){
    			user.set("password", get("newSecret"));
    			Db.update("user",user);
    			result.set("code", 1);
    			result.set("msg", "密码修改成功");
    		}else{
    			result.set("code", 0);
    			result.set("msg", "输入的两次密码不一致");
    		}
    	}
    	renderJson(result);
    }
}
