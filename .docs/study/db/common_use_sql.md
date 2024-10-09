
## 查询表结构
```sql
show create table table_name;
```

## 表字段变更
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