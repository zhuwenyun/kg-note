


举个例子，假设我们有两个表：学生表和课程表。学生表中有一个学生ID字段，课程表中有一个课程ID字段。如果我们想要记录每个学生所选的课程，就需要在学生表中添加一个外键，指向课程表中的课程ID字段。这样，我们就可以通过外键来查询每个学生所选的课程信息。
学生表创建一个外键，通过这个外键能查询【每个学生所选的课程信息】。
站在课程角度，是不是一个课程可以被多个学生选择，所以是 1:n 的关系
课程(1):学生(n) 
站在学生角度，是不是一个学生可以拥有多门课程，所以是 1:n 的关系
学生(1):课程(n)


https://www.yuque.com/pdmaner/docs/pdmaner-manual



## drawdb
git clone https://github.com/drawdb-io/drawdb
cd drawdb
npm install
npm run dev



去完成路线失败
/api/v1/learning/roadExam/check

11927836013707