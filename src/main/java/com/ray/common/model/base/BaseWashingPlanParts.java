package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseWashingPlanParts<M extends BaseWashingPlanParts<M>> extends Model<M> implements IBean {

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
	 * 产品型号
	 */
	public void setPartNo(java.lang.String partNo) {
		set("part_no", partNo);
	}
	
	/**
	 * 产品型号
	 */
	public java.lang.String getPartNo() {
		return getStr("part_no");
	}

	/**
	 * 产品名称
	 */
	public void setPartName(java.lang.String partName) {
		set("part_name", partName);
	}
	
	/**
	 * 产品名称
	 */
	public java.lang.String getPartName() {
		return getStr("part_name");
	}

	/**
	 * 产品ID
	 */
	public void setProductId(java.lang.Integer productId) {
		set("product_id", productId);
	}
	
	/**
	 * 产品ID
	 */
	public java.lang.Integer getProductId() {
		return getInt("product_id");
	}

	/**
	 * 数量
	 */
	public void setQty(java.lang.Integer qty) {
		set("qty", qty);
	}
	
	/**
	 * 数量
	 */
	public java.lang.Integer getQty() {
		return getInt("qty");
	}

	/**
	 * 1=白班，2=夜班
	 */
	public void setShift(java.lang.Integer shift) {
		set("shift", shift);
	}
	
	/**
	 * 1=白班，2=夜班
	 */
	public java.lang.Integer getShift() {
		return getInt("shift");
	}

	/**
	 * 计划日期
	 */
	public void setPlanDate(java.util.Date planDate) {
		set("plan_date", planDate);
	}
	
	/**
	 * 计划日期
	 */
	public java.util.Date getPlanDate() {
		return get("plan_date");
	}

	/**
	 * 备注
	 */
	public void setNote(java.lang.String note) {
		set("note", note);
	}
	
	/**
	 * 备注
	 */
	public java.lang.String getNote() {
		return getStr("note");
	}

	/**
	 * 日期id
	 */
	public void setDateId(java.lang.Integer dateId) {
		set("date_id", dateId);
	}
	
	/**
	 * 日期id
	 */
	public java.lang.Integer getDateId() {
		return getInt("date_id");
	}

}