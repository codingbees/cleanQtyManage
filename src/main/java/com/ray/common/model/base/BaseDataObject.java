package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseDataObject<M extends BaseDataObject<M>> extends Model<M> implements IBean {

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
	 * 表名
	 */
	public void setTableName(java.lang.String tableName) {
		set("table_name", tableName);
	}
	
	/**
	 * 表名
	 */
	public java.lang.String getTableName() {
		return getStr("table_name");
	}

	/**
	 * 英文编码
	 */
	public void setEn(java.lang.String en) {
		set("en", en);
	}
	
	/**
	 * 英文编码
	 */
	public java.lang.String getEn() {
		return getStr("en");
	}

	/**
	 * 中文名
	 */
	public void setCn(java.lang.String cn) {
		set("cn", cn);
	}
	
	/**
	 * 中文名
	 */
	public java.lang.String getCn() {
		return getStr("cn");
	}

	/**
	 * 查询表达式
	 */
	public void setWhereAttr(java.lang.String whereAttr) {
		set("where_attr", whereAttr);
	}
	
	/**
	 * 查询表达式
	 */
	public java.lang.String getWhereAttr() {
		return getStr("where_attr");
	}

	/**
	 * 拦截器
	 */
	public void setInterceptor(java.lang.String interceptor) {
		set("interceptor", interceptor);
	}
	
	/**
	 * 拦截器
	 */
	public java.lang.String getInterceptor() {
		return getStr("interceptor");
	}

	/**
	 * 是否新增
	 */
	public void setIsAdd(java.lang.Boolean isAdd) {
		set("is_add", isAdd);
	}
	
	/**
	 * 是否新增
	 */
	public java.lang.Boolean getIsAdd() {
		return getBoolean("is_add");
	}

	/**
	 * 是否修改
	 */
	public void setIsUpdate(java.lang.Boolean isUpdate) {
		set("is_update", isUpdate);
	}
	
	/**
	 * 是否修改
	 */
	public java.lang.Boolean getIsUpdate() {
		return getBoolean("is_update");
	}

	/**
	 * 是否可行内修改
	 */
	public void setIsLineUpdate(java.lang.Boolean isLineUpdate) {
		set("is_line_update", isLineUpdate);
	}
	
	/**
	 * 是否可行内修改
	 */
	public java.lang.Boolean getIsLineUpdate() {
		return getBoolean("is_line_update");
	}

	/**
	 * 是否删除
	 */
	public void setIsDelete(java.lang.Boolean isDelete) {
		set("is_delete", isDelete);
	}
	
	/**
	 * 是否删除
	 */
	public java.lang.Boolean getIsDelete() {
		return getBoolean("is_delete");
	}

	/**
	 * 是否拥有操作列
	 */
	public void setIsHandle(java.lang.Boolean isHandle) {
		set("is_handle", isHandle);
	}
	
	/**
	 * 是否拥有操作列
	 */
	public java.lang.Boolean getIsHandle() {
		return getBoolean("is_handle");
	}

	/**
	 * 操作列宽度
	 */
	public void setHandleWidth(java.lang.String handleWidth) {
		set("handle_width", handleWidth);
	}
	
	/**
	 * 操作列宽度
	 */
	public java.lang.String getHandleWidth() {
		return getStr("handle_width");
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
