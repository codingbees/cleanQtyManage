package com.ray.common.controller.system;


import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import com.dingtalk.api.DefaultDingTalkClient;
import com.dingtalk.api.DingTalkClient;
import com.dingtalk.api.request.OapiSnsGetuserinfoBycodeRequest;
import com.dingtalk.api.request.OapiUserGetRequest;
import com.dingtalk.api.request.OapiUserGetUseridByUnionidRequest;
import com.dingtalk.api.request.OapiUserGetuserinfoRequest;
import com.dingtalk.api.response.OapiSnsGetuserinfoBycodeResponse;
import com.dingtalk.api.response.OapiUserGetResponse;
import com.dingtalk.api.response.OapiUserGetUseridByUnionidResponse;
import com.dingtalk.api.response.OapiUserGetuserinfoResponse;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.ray.common.model.UserRole;
import com.ray.common.ding.AccessTokenUtil;
import com.taobao.api.ApiException;

public class DingLoginController extends Controller {
	/**
	 * WEB端扫码登录
	 * @throws ApiException
	 */
	public void index() throws ApiException{ 
		DefaultDingTalkClient  client = new DefaultDingTalkClient("https://oapi.dingtalk.com/sns/getuserinfo_bycode");
		OapiSnsGetuserinfoBycodeRequest req = new OapiSnsGetuserinfoBycodeRequest();
		req.setTmpAuthCode(getPara("code"));
		OapiSnsGetuserinfoBycodeResponse response = client.execute(req,"dingoarbhd55u7xtx873ct","_M5n_T7reGxoSaD9hceAn1E1oeEXJIXbOZUOBTLKTmsrGEDQPiJDz4mQZ0H0eGz4");
		String dingtoken = AccessTokenUtil.getToken();
		//获取UserId
		DingTalkClient client2 = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/getUseridByUnionid");                 
		OapiUserGetUseridByUnionidRequest request2 = new OapiUserGetUseridByUnionidRequest();
		request2.setUnionid(response.getUserInfo().getUnionid());
		request2.setHttpMethod("GET");
		OapiUserGetUseridByUnionidResponse userInfo = client2.execute(request2, dingtoken);
		
		if(0==userInfo.getErrcode()){
			//获取用户详情
			DingTalkClient client3 = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/get");
			OapiUserGetRequest request = new OapiUserGetRequest();
			request.setUserid(userInfo.getUserid());
			request.setHttpMethod("GET");
			OapiUserGetResponse response3 = client3.execute(request, dingtoken);
			UsernamePasswordToken token = new UsernamePasswordToken(userInfo.getUserid(), userInfo.getUserid());
			Subject subject = SecurityUtils.getSubject();
			subject.login(token);
			subject.getSession().setAttribute("user", response3);
			//查询用户拥有角色供前端校验使用
			Record record = Db.findFirst("SELECT GROUP_CONCAT(role_name) AS roles FROM roles WHERE id IN (SELECT role_id FROM user_role WHERE user_id = '09112815001228979')");
			subject.getSession().setAttribute("user_roles", record.getStr("roles"));
			redirect("/index");
		}else{
			redirect("/loginInit?code=1&icon=5");
		}
	}
	
	/**
	 * 钉钉PC端免登
	 */
	public void dingLogin(){
		String accessToken = AccessTokenUtil.getToken();
		DingTalkClient client = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/getuserinfo");
		OapiUserGetuserinfoRequest request = new OapiUserGetuserinfoRequest();
		request.setCode(get(0));
		request.setHttpMethod("GET");
		OapiUserGetuserinfoResponse response = null;
		try {
			response = client.execute(request, accessToken);
		} catch (ApiException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String userId = response.getUserid();
		DingTalkClient client3 = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/get");
		OapiUserGetRequest request1 = new OapiUserGetRequest();
		request1.setUserid(userId);
		request1.setHttpMethod("GET");
		OapiUserGetResponse userinfo = null;
		try {
			userinfo = client3.execute(request1, accessToken);
		} catch (ApiException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		UsernamePasswordToken token = new UsernamePasswordToken(userId, userId);
		//如果用户没有任何角色，就初始化普通用户角色
		UserRole ur = UserRole.dao.findFirst("select * from user_role where role_id = 2 and user_id ='"+userId+"'");
		if(ur==null){
			ur = new UserRole();
			ur.setRoleId(2);
			ur.setUserId(userId);
			ur.save();
		};
		//查询用户拥有角色供前端校验使用
		Record record = Db.findFirst("SELECT GROUP_CONCAT(role_name) AS roles FROM roles WHERE id IN (SELECT role_id FROM user_role WHERE user_id = '"+userId+"')");
		Subject subject = SecurityUtils.getSubject();
		subject.login(token);
		subject.getSession().setAttribute("user", userinfo);
		subject.getSession().setAttribute("user_roles", record.getStr("roles"));
		redirect("/index");
	}
	
	/**
	 * 开发用
	 */
	public void y() throws ApiException{
			String dingtoken = AccessTokenUtil.getToken();
			//获取用户详情
			DingTalkClient client3 = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/get");
			OapiUserGetRequest request = new OapiUserGetRequest();
			request.setUserid("09112815001228979");
			request.setHttpMethod("GET");
			OapiUserGetResponse response3 = client3.execute(request, dingtoken);
			UsernamePasswordToken token = new UsernamePasswordToken("193125692825944092", "193125692825944092");
			Subject subject = SecurityUtils.getSubject();
			//查询用户拥有角色供前端校验使用
			Record record = Db.findFirst("SELECT GROUP_CONCAT(role_name) AS roles FROM roles WHERE id IN (SELECT role_id FROM user_role WHERE user_id = '09112815001228979')");
			subject.login(token);
			subject.getSession().setAttribute("user", response3);
			subject.getSession().setAttribute("user_roles", record.getStr("roles"));
			redirect("/index");
	}
	
}
