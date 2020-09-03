package com.ray.util;

import java.util.ArrayList;

import javax.sql.DataSource;

import com.jfinal.kit.Prop;
import com.jfinal.kit.PropKit;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import cn.smallbun.screw.core.Configuration;
import cn.smallbun.screw.core.engine.EngineConfig;
import cn.smallbun.screw.core.engine.EngineFileType;
import cn.smallbun.screw.core.engine.EngineTemplateType;
import cn.smallbun.screw.core.execute.DocumentationExecute;
import cn.smallbun.screw.core.process.ProcessConfig;

/**
 * 数据库文档结构生成工具
 * @author Ray
 *
 */
public class DataNote {
	public static void main(String[] args) {
		//数据源
		Prop p = PropKit.use("config-dev.properties").appendIfExists("config-pro.properties");
		   HikariConfig hikariConfig = new HikariConfig();
		   hikariConfig.setDriverClassName("com.mysql.jdbc.Driver");
		   hikariConfig.setJdbcUrl(p.get("jdbcUrl"));
		   hikariConfig.setUsername(p.get("user"));
		   hikariConfig.setPassword(p.get("password"));
		   //设置可以获取tables remarks信息
		   hikariConfig.addDataSourceProperty("useInformationSchema", "true");
		   hikariConfig.setMinimumIdle(2);
		   hikariConfig.setMaximumPoolSize(5);
		   DataSource dataSource = new HikariDataSource(hikariConfig);
		   //生成配置
		   EngineConfig engineConfig = EngineConfig.builder()
		         //生成文件路径
		         .fileOutputDir("src/main/webapp/WEB-INF/sql")
		         //打开目录
		         .openOutputDir(true)
		         //文件类型
		         .fileType(EngineFileType.HTML)
		         //生成模板实现
		         .produceType(EngineTemplateType.freemarker)
		         //自定义文件名称
		         .fileName(p.get("company")+"_数据库设计文档").build();

		   //忽略表
		   ArrayList<String> ignoreTableName = new ArrayList<>();
		   ignoreTableName.add("dicts");
		   ignoreTableName.add("file");
		   ignoreTableName.add("menu");
		   ignoreTableName.add("permissions");
		   ignoreTableName.add("role_permission");
		   ignoreTableName.add("roles");
		   ignoreTableName.add("serial_number");
		   ignoreTableName.add("user");
		   ignoreTableName.add("user_role");
		   ignoreTableName.add("yw_test");
		   ignoreTableName.add("yw_test_son");
		   //忽略表前缀
		   ArrayList<String> ignorePrefix = new ArrayList<>();
		   ignorePrefix.add("data_");
		   //忽略表后缀    
		   ArrayList<String> ignoreSuffix = new ArrayList<>();
		   //ignoreSuffix.add("_test");
		   ProcessConfig processConfig = ProcessConfig.builder()
		         //指定生成逻辑、当存在指定表、指定表前缀、指定表后缀时，将生成指定表，其余表不生成、并跳过忽略表配置	
				 //根据名称指定表生成
				 .designatedTableName(new ArrayList<>())
				 //根据表前缀生成
				 .designatedTablePrefix(new ArrayList<>())
				 //根据表后缀生成	
				 .designatedTableSuffix(new ArrayList<>())
		         //忽略表名
		         .ignoreTableName(ignoreTableName)
		         //忽略表前缀
		         .ignoreTablePrefix(ignorePrefix)
		         //忽略表后缀
		         .ignoreTableSuffix(ignoreSuffix).build();
		   //配置
		   Configuration config = Configuration.builder()
		         //版本
		         .version("1.0.0")
		         //描述
		         .description("数据库设计文档")
		         //数据源
		         .dataSource(dataSource)
		         //生成配置
		         .engineConfig(engineConfig)
		         //生成配置
		         .produceConfig(processConfig)
		         .build();
		   //执行生成
		   new DocumentationExecute(config).execute();
	}
}
