package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseTraceWorkflowEquipfeeding<M extends BaseTraceWorkflowEquipfeeding<M>> extends Model<M> implements IBean {

	public void setId(java.lang.Integer id) {
		set("id", id);
	}
	
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 车间
	 */
	public void setWorkshop(java.lang.Integer workshop) {
		set("workshop", workshop);
	}
	
	/**
	 * 车间
	 */
	public java.lang.Integer getWorkshop() {
		return getInt("workshop");
	}

	/**
	 * 产线
	 */
	public void setProductline(java.lang.Integer productline) {
		set("productline", productline);
	}
	
	/**
	 * 产线
	 */
	public java.lang.Integer getProductline() {
		return getInt("productline");
	}

	/**
	 * 子部件编码
	 */
	public void setPartNo(java.lang.String partNo) {
		set("part_no", partNo);
	}
	
	/**
	 * 子部件编码
	 */
	public java.lang.String getPartNo() {
		return getStr("part_no");
	}

	/**
	 * 批次号
	 */
	public void setBatchNo(java.lang.String batchNo) {
		set("batch_no", batchNo);
	}
	
	/**
	 * 批次号
	 */
	public java.lang.String getBatchNo() {
		return getStr("batch_no");
	}

	/**
	 * 数量
	 */
	public void setQuantity(java.lang.Integer quantity) {
		set("quantity", quantity);
	}
	
	/**
	 * 数量
	 */
	public java.lang.Integer getQuantity() {
		return getInt("quantity");
	}

	/**
	 * 清洗框二维码
	 */
	public void setCleanBoxNo(java.lang.String cleanBoxNo) {
		set("clean_box_no", cleanBoxNo);
	}
	
	/**
	 * 清洗框二维码
	 */
	public java.lang.String getCleanBoxNo() {
		return getStr("clean_box_no");
	}

	/**
	 * 清洗绑定时间
	 */
	public void setCleaningTime(java.util.Date cleaningTime) {
		set("cleaning_time", cleaningTime);
	}
	
	/**
	 * 清洗绑定时间
	 */
	public java.util.Date getCleaningTime() {
		return get("cleaning_time");
	}

	/**
	 * 设备上料时间
	 */
	public void setFeedingTime(java.util.Date feedingTime) {
		set("feeding_time", feedingTime);
	}
	
	/**
	 * 设备上料时间
	 */
	public java.util.Date getFeedingTime() {
		return get("feeding_time");
	}

}
