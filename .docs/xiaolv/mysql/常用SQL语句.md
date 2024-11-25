## 查询表结构
```sql
show create table table_name;
```

## 索引
### 建表时创建索引
```sql
PRIMARY KEY(`id`)
PRIMARY KEY `pk_id` (`id`),
UNIQUE KEY `uk_id_card` (`id_card`),
KEY `idx_name` (`name`),
KEY `idx_name_age` (`name`, `age`),
FULLTEXT KEY `ft_content` (`content`), 
```
### 已有表上索引操作
```sql
删除索引（包括唯一索引）
alter TABLE tb_name drop index tenant_id;
新增主键索引
ALTER TABLE tb_name ADD PRIMARY KEY (`id`) COMMENT '主键';
新增唯一索引
ALTER TABLE tb_name ADD UNIQUE uk_tenant_adcode(tenant_id,adcode) COMMENT '唯一索引';
新增普通索引
CREATE INDEX `idx_email` ON `tb_name` (`email`);
新增联合索引
CREATE INDEX `idx_username_email` ON `tb_name` (`username`, `email`);
```

### 阿里索引规范
在阿里巴巴的开发规范中，对MySQL的索引命名有一些具体的规定。
1. 主键索引：pk_字段名
2. 唯一索引：uk_字段名
3. 普通索引：idx_字段名
4. 外键索引：fk_表名_字段名
5. 组合索引：idx_字段名1_字段名2
6. 全文索引：ft_字段

## 字段
### 建表创建字段
```sql
CREATE TABLE `tb_name` (
  id bigint unsigned auto_increment comment '主键id',
  gmt_create datetime not null default CURRENT_TIMESTAMP comment '创建时间',
  gmt_modified datetime not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP comment '最后修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_source_task_id` (`source_task_id`,`task_type_code`,`source`),
  KEY `idx_create_time` (`gmt_create`) COMMENT '时间索引',
  KEY `idx_tenantid_gmtcreate_tasksubtypecode` (`tenant_id`,`gmt_create`,`task_sub_type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=DYNAMIC COMMENT='创建表的模版注释'
;
```
### 已有表上字段操作
```sql
-- add column
ALTER TABLE table_name 
    ADD column_name data_type COMMENT '注释信息' AFTER another_column;

-- update column
ALTER TABLE table_name
    MODIFY COLUMN column_name new_data_type COMMENT 'your_comment_here';

-- delete column
ALTER TABLE 表名 
    DROP COLUMN 列名;
```

### 常用字段类型

```SQL
int(11)
bigint(20)
varchar(100)
datetime
```


## 其他SQL
### 查询t1表有但是t2表没有的数据
#### LEFT JOIN 和 IS NULL 结合方式
```sql
SELECT t1.*
FROM table1 t1
LEFT JOIN table2 t2 ON t1.id = t2.foreign_key_id
WHERE t2.foreign_key_id IS NULL;
```
#### NOT EXISTS
```sql
SELECT *
FROM table1 AS t1
WHERE NOT EXISTS (
    SELECT 1
    FROM table2 AS t2
    WHERE t1.id = t2.id
);
```