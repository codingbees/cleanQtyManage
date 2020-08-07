package com.ray.common.controller;

import com.dingtalk.api.DefaultDingTalkClient;
import com.dingtalk.api.DingTalkClient;
import com.dingtalk.api.request.OapiUserGetRequest;
import com.dingtalk.api.response.OapiUserGetResponse;
import com.jfinal.core.NotAction;
import com.jfinal.kit.Ret;
/*     */
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.redis.Redis;
import com.ray.common.ding.AccessTokenUtil;
import com.taobao.api.ApiException;

import java.util.List;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.ExcessiveAttemptsException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;

public class MainController extends BaseController{
	
	/**
	 * 开发用
	 */
	public void a() throws ApiException{ 
			String dingtoken = AccessTokenUtil.getToken();
			//获取用户详情
			DingTalkClient client3 = new DefaultDingTalkClient("https://oapi.dingtalk.com/user/get");
			OapiUserGetRequest request = new OapiUserGetRequest();
			request.setUserid("09112815001228979");
			request.setHttpMethod("GET");
			OapiUserGetResponse response3 = client3.execute(request, dingtoken);
			UsernamePasswordToken token = new UsernamePasswordToken("09112815001228979", "09112815001228979");
			Subject subject = SecurityUtils.getSubject();
			subject.login(token);
			subject.getSession().setAttribute("user", response3);
			Record record = Db.findFirst("SELECT GROUP_CONCAT(role_name) AS roles FROM roles WHERE id IN (SELECT role_id FROM user_role WHERE user_id = '09112815001228979')");
			subject.getSession().setAttribute("user_roles", record.getStr("roles"));
			redirect("/index");
	}
	
	public void dingLogin(){
		render("dingLogin.html");
	}
	public void index(){
//		setAttr("menu", getMenu());
		set("request",getRequest());
		render("index.html");
	}

	public void loginInit() {
		if(getPara("code")!=null){
			setAttr("code", getPara("code"));
			setAttr("icon", getPara("icon"));
		}else{
			setAttr("code", 0);
			setAttr("icon", 1);
		}
		render("login.html");
	}

	public void login() {
		UsernamePasswordToken token = new UsernamePasswordToken(getPara("username"), getPara("password"));
		Subject subject = SecurityUtils.getSubject();
		Record rsp = new Record();
		rsp.set("code", Integer.valueOf(0));
		try {
			subject.login(token);
			rsp.set("result", Integer.valueOf(1));
			rsp.set("msg", "登录成功");
			rsp.set("icon", Integer.valueOf(1));
		}
		catch (IncorrectCredentialsException ice) {
			rsp.set("result", Integer.valueOf(0));
			rsp.set("msg", "密码错误");
			rsp.set("icon", Integer.valueOf(5));
			renderJson(rsp);
			return;
		}
		catch (UnknownAccountException uae) {
			rsp.set("result", Integer.valueOf(0));
			rsp.set("msg", "用户不存在");
			rsp.set("icon", Integer.valueOf(5));
			renderJson(rsp);
			return;
		}
		catch (ExcessiveAttemptsException eae) {
			rsp.set("result", Integer.valueOf(0));
			rsp.set("msg", "错误登录过多");
			rsp.set("icon", Integer.valueOf(5));
			renderJson(rsp);
			return;
		}
		Record user = Db.findFirst("select * from user where username = '" + getPara("username") + "'");
		subject.getSession().setAttribute("user", user);
		try {
			Redis.use("test").incr("loginTimes");
		}
		catch (Exception localException) {
		}
		renderJson(rsp);
	}

	public void logout() {
		Subject currentUser = SecurityUtils.getSubject();
		currentUser.logout();
		setAttr("code", 0);
		setAttr("icon", 1);
		render("login.html");
	}

	public void mainInfo() {
		render("sys/home/main.html");
	}
	
	public void menus() {
		try {
			List<Record> top_menu = Db.find("select * from menu where parent_menu = 0 and is_hide = 0 order by seq_num");
			top_menu = menuAuth(top_menu);
			List<Record> menu = getMenus(top_menu);
			renderJson(Ret.ok("menus", menu));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("msg", "失败：" + e.getMessage()));
		}
	}

	/**
	 * 递归获取菜单
	 * @param menus
	 * @return
	 */
	public List<Record> getMenus(List<Record> menus){
		for (int i = 0; i < menus.size(); i++) {
			List<Record> children_menu = Db.find("select * from menu where parent_menu = "+menus.get(i).getInt("id")+" and is_hide = 0 order by seq_num");
			if(children_menu.size()>0) {
				children_menu = getMenus(menuAuth(children_menu));
			}
			menus.get(i).set("children", menuAuth(children_menu));
		}
		return menus;
	}
//	public List<Record> getMenu(){
//		List<Record> top_menu = Db.find("select * from menu where menu_level = 1 and is_hide = 0 order by seq_num");
//		top_menu = menuAuth(top_menu);
//		for (int i = 0; i < top_menu.size(); i++) {
//			List<Record> second_menu = Db.find("select * from menu where menu_level = 2 and is_hide = 0 and parent_menu = "
//				+ ((Record) top_menu.get(i)).getInt("id") + " order by seq_num");
//			second_menu = menuAuth(second_menu);
//			for (int j = 0; j < second_menu.size(); j++) {
//				List<Record> third_menu = Db.find("select * from menu where menu_level = 3 and is_hide=0 and parent_menu = "
//					+ ((Record) second_menu.get(j)).getInt("id") + " order by seq_num");
//				third_menu = menuAuth(third_menu);
//				if (third_menu.size() > 0) {
//					((Record) second_menu.get(j)).set("children", third_menu);
//				}
//			}
//			if (second_menu.size() > 0) {
//				((Record) top_menu.get(i)).set("children", second_menu);
//			}
//		}
//		return top_menu;
//	}
	
	@NotAction
	public List<Record> menuAuth(List<Record> menu){
		OapiUserGetResponse user = (OapiUserGetResponse) getSessionAttr("user");
		String sql = "SELECT gl_id FROM permissions WHERE id IN (SELECT permission_id FROM role_permission WHERE role_id IN (SELECT role_id FROM user_role WHERE user_id = '"
				+ user.getUserid() + "')) AND TYPE = 1";
		List<Record> menuPermissions = Db.find(sql);
		for (int i = 0; i < menu.size(); i++) {
			boolean flag = true;
			for (int j = 0; j < menuPermissions.size(); j++) {
				if (((Record) menu.get(i)).get("id").equals(((Record) menuPermissions.get(j)).get("gl_id"))) {
					flag = false;
				}
			}
			if (flag) {
				menu.remove(i);
				i--;
			}
		}
		return menu;
	}

	@NotAction
	public static void main(String[] args) {
		Redis.use("test").lpush("ray", new Object[] { "1" });
	}
}