package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseTraceWorkflowCustomerQrcodeHistory<M extends BaseTraceWorkflowCustomerQrcodeHistory<M>> extends Model<M> implements IBean {

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
	 * 内部二维码
	 */
	public void setInsideCode(java.lang.String insideCode) {
		set("inside_code", insideCode);
	}
	
	/**
	 * 内部二维码
	 */
	public java.lang.String getInsideCode() {
		return getStr("inside_code");
	}

	/**
	 * 客户二维码
	 */
	public void setCustomerCode(java.lang.String customerCode) {
		set("customer_code", customerCode);
	}
	
	/**
	 * 客户二维码
	 */
	public java.lang.String getCustomerCode() {
		return getStr("customer_code");
	}

	/**
	 * 产品编号
	 */
	public void setProductno(java.lang.String productno) {
		set("productno", productno);
	}
	
	/**
	 * 产品编号
	 */
	public java.lang.String getProductno() {
		return getStr("productno");
	}

	/**
	 * 类别
	 */
	public void setType(java.lang.String type) {
		set("type", type);
	}
	
	/**
	 * 类别
	 */
	public java.lang.String getType() {
		return getStr("type");
	}

	/**
	 * 绑定时间
	 */
	public void setCreateTime(java.util.Date createTime) {
		set("create_time", createTime);
	}
	
	/**
	 * 绑定时间
	 */
	public java.util.Date getCreateTime() {
		return get("create_time");
	}

}
