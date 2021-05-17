package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseUser<M extends BaseUser<M>> extends Model<M> implements IBean {

	/**
	 * ID
	 */
	public void setId(java.lang.Integer id) {
		set("id", id);
	}
	
	/**
	 * ID
	 */
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 登录账号
	 */
	public void setUsername(java.lang.String username) {
		set("username", username);
	}
	
	/**
	 * 登录账号
	 */
	public java.lang.String getUsername() {
		return getStr("username");
	}

	/**
	 * 登录密码
	 */
	public void setPassword(java.lang.String password) {
		set("password", password);
	}
	
	/**
	 * 登录密码
	 */
	public java.lang.String getPassword() {
		return getStr("password");
	}

	/**
	 * 用户姓名
	 */
	public void setNickname(java.lang.String nickname) {
		set("nickname", nickname);
	}
	
	/**
	 * 用户姓名
	 */
	public java.lang.String getNickname() {
		return getStr("nickname");
	}

	/**
	 * 钉钉USERID
	 */
	public void setDingUserId(java.lang.String dingUserId) {
		set("ding_user_id", dingUserId);
	}
	
	/**
	 * 钉钉USERID
	 */
	public java.lang.String getDingUserId() {
		return getStr("ding_user_id");
	}

	/**
	 * 修改时间
	 */
	public void setUpdateTime(java.util.Date updateTime) {
		set("update_time", updateTime);
	}
	
	/**
	 * 修改时间
	 */
	public java.util.Date getUpdateTime() {
		return get("update_time");
	}

	/**
	 * 创建时间
	 */
	public void setCreateTime(java.util.Date createTime) {
		set("create_time", createTime);
	}
	
	/**
	 * 创建时间
	 */
	public java.util.Date getCreateTime() {
		return get("create_time");
	}

}
