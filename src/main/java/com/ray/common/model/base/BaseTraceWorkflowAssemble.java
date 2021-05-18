package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseTraceWorkflowAssemble<M extends BaseTraceWorkflowAssemble<M>> extends Model<M> implements IBean {

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
	 * 车间
	 */
	public void setWorkshopId(java.lang.Integer workshopId) {
		set("workshop_id", workshopId);
	}
	
	/**
	 * 车间
	 */
	public java.lang.Integer getWorkshopId() {
		return getInt("workshop_id");
	}

	/**
	 * 产线
	 */
	public void setProductlineId(java.lang.Integer productlineId) {
		set("productline_id", productlineId);
	}
	
	/**
	 * 产线
	 */
	public java.lang.Integer getProductlineId() {
		return getInt("productline_id");
	}

	/**
	 * 产品编号
	 */
	public void setProductId(java.lang.Integer productId) {
		set("product_id", productId);
	}
	
	/**
	 * 产品编号
	 */
	public java.lang.Integer getProductId() {
		return getInt("product_id");
	}

	/**
	 * 产品二维码
	 */
	public void setBarcode(java.lang.String barcode) {
		set("barcode", barcode);
	}
	
	/**
	 * 产品二维码
	 */
	public java.lang.String getBarcode() {
		return getStr("barcode");
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