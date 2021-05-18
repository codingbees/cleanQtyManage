package com.ray.common.excelModel;

import com.github.liaochong.myexcel.core.annotation.ExcelColumn;


public class ProductPlan {

	@ExcelColumn(index = 0)
	private String productLine;
	
	@ExcelColumn(index = 1)
	private String shift;

	@ExcelColumn(index = 2)
	private String  partNo;
	
	@ExcelColumn(index = 3)
	private String partName;
	
	@ExcelColumn(index = 4)
	private String planQty;
	
	@ExcelColumn(index = 5)
	private String note;

	public String getProductLine() {
		return productLine;
	}

	public void setProductLine(String productLine) {
		this.productLine = productLine;
	}

	public String getShift() {
		return shift;
	}

	public void setShift(String shift) {
		this.shift = shift;
	}

	public String getPartNo() {
		return partNo;
	}

	public void setPartNo(String partNo) {
		this.partNo = partNo;
	}

	public String getPartName() {
		return partName;
	}

	public void setPartName(String partName) {
		this.partName = partName;
	}

	public String getPlanQty() {
		return planQty;
	}

	public void setPlanQty(String planQty) {
		this.planQty = planQty;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}
}
