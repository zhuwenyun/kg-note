
```properties
yueyue.sequence.dataSource.disposeMain=账号:密码:连接URL
yueyue.dbsharding.dataSourceMap.dsm0=账号:密码:连接URL
yueyue.dbsharding.dataSourceMap.dsm1=账号:密码:连接URL

yueyue.dbsharding.hash.driver_task=hash|2|128
```

```yml
yueyue:
  dbsharding:
    defaultDataSourceGroupInfo: master|disposeMain
    shardingMetaMap:
      #逻辑表名:分表类型|总库数|总表数
      driver_task: ${yueyue.dbsharding.hash.driver_task}
    dataSourceMap:
      dsm0: ${yueyue.dbsharding.dataSourceMap.dsm0}
      dsm1: ${yueyue.dbsharding.dataSourceMap.dsm1}
      disposeMain: ${yueyue.sequence.dataSource.disposeMain}
    virtualDataSourceMap:
      disposeVds:
        0: master|dsm0
        1: master|dsm1
      dispose:
        0: master|disposeMain
```
::: danger
```
shardingMetaMap:
    driver_task: value1
dataSourceMap: 原始数据源很重要
    dsm0: value1
    dsm1: value2
virtualDataSourceMap: 虚拟数据源是从原始数据源解析过来的
    disposeVds:
        0: master|dsm0
        1: master|dsm1
    dispose:
        0: master|disposeMain
一维Map
private Map<String, String> shardingMetaMap;
private Map<String, String> dataSourceMap;
二维Map
private Map<String, Map<String, String>> virtualDataSourceMap;
```
:::
```java
@Data
@ConfigurationProperties(prefix = "yueyue.dbsharding")
public class DBShardingProperties {
    private Pool pool = new Pool();
    private Map<String/*虚拟数据源名称*/, Map<String/*数据源组名称*/, String/*数据源信息表达式*/>> virtualDataSourceMap;
    private Map<String/*逻辑表名*/, String/*分表元数据表达式*/> shardingMetaMap;
    private String defaultDataSourceGroupInfo;
    private Map<String/*数据源key*/, String/*数据源信息*/> dataSourceMap;
    private String shadowTenants;
    private String shadowMaker;
}

@Slf4j
@Configuration
@EnableConfigurationProperties
@ConditionalOnClass({ShardingContext.class, DruidDataSource.class})
public class DBShardingAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public DBShardingProperties dbShardingProperties(){
        return new DBShardingProperties();
    }

    @Bean("virtualDataSource")
    @Primary
    @ConditionalOnMissingBean(name = "virtualDataSource")
    public DataSource virtualDataSource(DBShardingProperties dbShardingProperties) throws SQLException {
        LazyConnectionDataSourceProxy dataSourceProxy = new LazyConnectionDataSourceProxy();
        dataSourceProxy.setDefaultAutoCommit(false);
        dataSourceProxy.setDefaultTransactionIsolation(TransactionDefinition.ISOLATION_REPEATABLE_READ);
        dataSourceProxy.setTargetDataSource(shardingDataSource);
        return dataSourceProxy;
    }
}
```




配置接收对象
```java
@Data
public class ShardingMeta {
    //分库总数。
    private int dbTotalCount = 1;
    //分表总数。
    private int tableTotalCount = 1;
    //分表策略
    private ShardingStrategy shardingStrategy;
    // 表级别指定虚拟数据源Key
    private String vdsKey;
}

public class ShardingMetaMap {
    //key=逻辑表名
    private Map<String, ShardingMeta> metaMap = new HashMap<>();
}


public class ShardingDataSourceLookup implements DataSourceLookup {
    //保存数据源组的映射。
    private Map<String, VirtualDataSource> virtualDataSourceMap;

}

@Data
public class VirtualDataSource {
    //名称。
    private String name ;
    //实际数据源组Map。
    private Map<String, DataSourceGroup> dataSourceGroupMap;
}

@Data
public class DataSourceGroup {
    //名称。
    private String name;
    //主数据源。
    private DataSource masterDataSource;
    //从数据源。
    private List<DataSource> slaveDataSources = new ArrayList<>();
}

```



```java
@Mapper
@ShardingContext(vdsKey = "disposeVds", logicTableName = "driver_task", shardingPropertyName = "driverId")
public interface DriverTaskDao {

}

1、如何找数据库？
2、如何找表？

ShardingContext

如何使用的
DefaultHashShardingStrategy



AbstractRoutingDataSource



@Intercepts({
        @Signature(
                type = StatementHandler.class,
                method = "prepare",
                args = {Connection.class, Integer.class}
        ),
        @Signature(
                type = Executor.class,
                method = "update",
                args = {MappedStatement.class, Object.class}
        ),
        @Signature(
                type = Executor.class,
                method = "query",
                args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class, CacheKey.class, BoundSql.class}
        ),
        @Signature(
                type = Executor.class,
                method = "query",
                args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}
        ),
})
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ShardingInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        bject targetObject = invocation.getTarget();
        if (targetObject instanceof Executor) {
            MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
            //================ 通过反射获取 Class 对象
            //获取Dao执行的方法信息。 例如：com.a.b.UserDao.addUser
            String methodInfo = mappedStatement.getId();
            //获取Dao层面的目标执行方法。
            int splitIndex = methodInfo.lastIndexOf(".");
            String className = methodInfo.substring(0, splitIndex);
            //String methodName = methodInfo.substring(splitIndex + 1);
            Class<?> classObject = ReflectionCache.putAndGetClass(className);
            //================ 读取Class对象中的注解信息
            ShardingContext shardingContext = classObject.getAnnotation(ShardingContext.class);
            if (shardingContext != null){
                //1.获取分库分表字段值
                String shardingPropertyName = shardingContext.shardingPropertyName();
                Object shardingValue = ShardingValueInvoker.getShardingValue(mappedStatement, shardingPropertyName, parameterObject);
                //2.预处理分库分表字段值
                Class<? extends ShardingKeyStrategy> keyStrategyClass = shardingContext.shardingKeyStrategy();
                ShardingKeyStrategy keyStrategy = ReflectionCache.putAndGetInstance(keyStrategyClass);
                shardingValue = keyStrategy.handleShardingKey(shardingValue);


                //4.计算分库分表结果
                Class<? extends ShardingStrategy> strategyClass = shardingContext.shardingStrategy();
                ShardingStrategy shardingStrategy = ShardingStrategy.EmptyShardingStrategy.class.equals(strategyClass) ?
                        shardingMeta.getShardingStrategy() : ReflectionCache.putAndGetInstance(strategyClass);
                ShardingResult shardingResult = shardingStrategy.sharding(shardingValue,
                        shardingMeta.getDbTotalCount(), shardingMeta.getTableTotalCount());
                String dbKey = shardingResult.getDbKey();
                String tableKey = shardingResult.getTableKey();


            }



                        Object parameterObject = invocation.getArgs()[1];
                        Object shardingValue = ShardingValueInvoker.getShardingValue(mappedStatement, shardingPropertyName, parameterObject);
        }


    }


    @Override
    public Object plugin(Object target) {
        if (target instanceof StatementHandler) {
            return Plugin.wrap(target, this);
        } else if (target instanceof Executor) {
            return Plugin.wrap(target, this);
        } else {
            return target;
        }
    }
}
```


```java
import java.lang.reflect.Method;
import java.util.StringJoiner;
import java.util.WeakHashMap;

public class ReflectionCache {

    private static WeakHashMap<String, Class<?>> CLASS_CACHE = new WeakHashMap<>();
    private static WeakHashMap<String, Method> METHOD_CACHE = new WeakHashMap<>();
    private static WeakHashMap<Class<?>, Object> INSTANCE_CACHE = new WeakHashMap<>();

    public static void putClass(String className, Class<?> targetClass) {
        CLASS_CACHE.put(className, targetClass);
    }

    public static Class<?> getClass(String className) {
        return CLASS_CACHE.get(className);
    }

    public static Class<?> putAndGetClass(String className) throws ClassNotFoundException {
        Class<?> targetClass = getClass(className);
        if (targetClass == null) {
            synchronized (className.intern()) {
                targetClass = getClass(className);
                if (targetClass == null) {
                    targetClass = Class.forName(className);
                    putClass(className, targetClass);
                }
            }
        }
        return targetClass;
    }

    public static void putMethod(Class<?> classType, Class<?>[] parametersType, Method method) {
        METHOD_CACHE.put(join(classType, method.getName(), parametersType), method);
    }

    public static Method getMethod(Class<?> classType, String methodName, Class<?>[] parametersType) {
        return METHOD_CACHE.get(join(classType, methodName, parametersType));
    }

    public static Method putAndGetMethod(Class<?> classType, String methodName, Class<?>[] parametersType) throws NoSuchMethodException {
        Method method = getMethod(classType, methodName, parametersType);
        if (method == null) {
            synchronized (classType.getName().intern()) {
                method = getMethod(classType, methodName, parametersType);
                if (method == null) {
                    method = classType.getMethod(methodName, parametersType);
                    putMethod(classType, parametersType, method);
                }
            }
        }
        return method;
    }

    private static String join(Class<?> classType, String methodName, Class<?>[] parametersType) {
        StringJoiner joiner = new StringJoiner("-");
        joiner.add(classType.getName()).add(methodName);
        for (Class<?> type : parametersType) {
            joiner.add(type.getName());
        }
        return joiner.toString();
    }

    public static <T> T getInstance(Class<T> classType) throws IllegalAccessException, InstantiationException {
        return classType.cast(INSTANCE_CACHE.get(classType));
    }

    public static <T> void putInstance(Class<T> classType, T instance) {
        INSTANCE_CACHE.put(classType, instance);
    }

    public static <T> T putAndGetInstance(Class<T> classType) throws IllegalAccessException, InstantiationException {
        T instance = getInstance(classType);
        if (instance == null) {
            synchronized (classType.getName().intern()) {
                instance = getInstance(classType);
                if (instance == null) {
                    instance = classType.newInstance();
                    putInstance(classType, instance);
                }
            }
        }
        return instance;
    }

}
```



```java
@Bean(name = "shardingInterceptor")
@ConditionalOnMissingBean(name = "shardingInterceptor")
public Interceptor shardingInterceptor(@Value("${spring.application.name:}") String applicationName,
                                        DBShardingProperties dbShardingProperties) {
    ShardingInterceptor shardingInterceptor = new ShardingInterceptor();
    ShardingMetaMap warpper = new ShardingMetaMap();
    //逻辑表名:分表类型|总库数|总表数
    Map<String, String> shardingMetaMap = dbShardingProperties.getShardingMetaMap();
    if(shardingMetaMap != null && shardingMetaMap.size() > 0){
        for(String logicTableName : shardingMetaMap.keySet()){
            String expression = shardingMetaMap.get(logicTableName);
            ShardingMeta shardingMeta = parse2meta(expression);
            warpper.addShardingMeta(logicTableName, shardingMeta);
        }
    }
    shardingInterceptor.setShardingMetaMap(warpper);
    if (!StringUtils.isEmpty(dbShardingProperties.getShadowMaker())) {
        try {
            ShadowFlagMaker shadowFlagMaker = (ShadowFlagMaker) Class.forName(dbShardingProperties.getShadowMaker()).newInstance();
            shardingInterceptor.setShadowDataSourceService(new ShadowDataSourceService(shadowFlagMaker));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    RouteService routeService = new RouteService(applicationName);
    routeService.init();
    shardingInterceptor.setRouteService(routeService);

    return shardingInterceptor;
}
/*
* 解析分表元数据表达式
* 表达式格式: 分表类型|param1|param2|...
* 如:hash|4|32|vds1  表示哈希类型分表,一共分4个库,32张表。vds1表示指定改表使用的数据源
*/
private ShardingMeta parse2meta(String expression) {
    ShardingMeta shardingMeta = new ShardingMeta();
    String[] infos = expression.split("\\|");
    String type = infos[0];
    if (ShardingType.HASH.name().equalsIgnoreCase(type)) {
        shardingMeta.setShardingStrategy(new DefaultHashShardingStrategy());
        shardingMeta.setDbTotalCount(Integer.parseInt(infos[1]));
        shardingMeta.setTableTotalCount(Integer.parseInt(infos[2]));
    } else if (ShardingType.SPECIFY.name().equalsIgnoreCase(type)) {
        shardingMeta.setShardingStrategy(new SpecifyShardingStrategy());
        shardingMeta.setDbTotalCount(Integer.parseInt(infos[1]));
        shardingMeta.setTableTotalCount(Integer.parseInt(infos[2]));
    } else if(ShardingType.DAY.name().equalsIgnoreCase(type)) {
        shardingMeta.setShardingStrategy(new DayShardingStrategy());
    } else {
        throw new IllegalArgumentException("目前不支持分表类型:[" + type + "]!");
    }
    if (infos.length >= 4) {
        shardingMeta.setVdsKey(infos[3]);
    }
    return shardingMeta;
}

```


//根据逻辑表名找到配置的分库分表配置元数据
ShardingMeta shardingMeta = this.getShardingMeta(logicTableNames[i]);
//根据Mapper注解中配置的分表策略执行分库分表逻辑得到库和表的索引
Class<? extends ShardingStrategy> strategyClass = shardingContext.shardingStrategy();
ShardingStrategy shardingStrategy = ShardingStrategy.EmptyShardingStrategy.class.equals(strategyClass) ?
        shardingMeta.getShardingStrategy() : ReflectionCache.putAndGetInstance(strategyClass);
//注意得到的只是索引 01 和 0001 这样
ShardingResult shardingResult = shardingStrategy.sharding(shardingValue,
        shardingMeta.getDbTotalCount(), shardingMeta.getTableTotalCount());
String dbKey = shardingResult.getDbKey();
String tableKey = shardingResult.getTableKey();


//5.计算并设置实际物理表名。
StringBuilder tableNameBuilder = new StringBuilder();
// 增加影子表前缀
if (ShardingDataTestSupportUtils.isShadowTableChoosed()) {
    tableNameBuilder.append(ShardingDataTestSupportUtils.SHADOWTABLE_PREFIX);
    ShardingDataTestSupportUtils.removeShadowFlag();
}
tableNameBuilder.append(logicTableNames[i]);
// 增加分表后缀
if (!StringUtils.isEmpty(shardingContext.delimiter()) || shardingContext.forceSharding()) {
    tableNameBuilder.append(shardingContext.delimiter())
            .append(tableKey);
}




## 如何选择切换真实的数据源

### 解析配置生成ShardingDataSource

```java

public DataSource generate(){
    ShardingDataSource shardingDataSource = new ShardingDataSource();
    ShardingDataSourceLookup dataSourceLookup = new ShardingDataSourceLookup();

    //设置默认数据源。【很重要，在没有切数据源的时候默认的数据源】
    boolean defaultSetFlag = false;
    String defaultDataSourceGroupInfo = dbShardingProperties.getDefaultDataSourceGroupInfo();
    if(defaultDataSourceGroupInfo != null && defaultDataSourceGroupInfo.trim().length() > 0){
        DataSourceGroup defaultDataSourceGroup = parse2group(defaultDataSourceGroupInfo, dataSourceMap);
        dataSourceLookup.setDefaultDataSourceGroup(defaultDataSourceGroup);
        defaultSetFlag = true;
    }

    //将二维Map转成一维Map，此处DataSourceGroup内部也是一个Map
    Map<String, VirtualDataSource> virtualDataSourceMap = new HashMap<>();
    Map<String, Map<String, String>> virtualDataSourceInfos = dbShardingProperties.getVirtualDataSourceMap();
    if(virtualDataSourceInfos != null && virtualDataSourceInfos.size() > 0){
        for(String vdsName : virtualDataSourceInfos.keySet()){
            //一个虚拟数据源就是一个Map
            VirtualDataSource virtualDataSource = new VirtualDataSource();
            Map<String, String> dataSrouceGroupInfos = virtualDataSourceInfos.get(vdsName);
            Map<String, DataSourceGroup> dataSourceGroupMap = new HashMap<>();
            if(dataSrouceGroupInfos != null && dataSrouceGroupInfos.size() > 0){
                for(String groupName : dataSrouceGroupInfos.keySet()){
                    DataSourceGroup dataSourceGroup = parse2group(dataSrouceGroupInfos.get(groupName), dataSourceMap);
                    dataSourceGroup.setName(groupName);
                    dataSourceGroupMap.put(groupName, dataSourceGroup);
                    if(!defaultSetFlag){
                        dataSourceLookup.setDefaultDataSourceGroup(dataSourceGroup);
                        defaultSetFlag = true;
                    }
                }
            }
            virtualDataSource.setName(vdsName);
            virtualDataSource.setDataSourceGroupMap(dataSourceGroupMap);
            virtualDataSourceMap.put(vdsName, virtualDataSource);
        }
    }

    dataSourceLookup.setVirtualDataSourceMap(virtualDataSourceMap);
    shardingDataSource.setDataSourceLookup(dataSourceLookup);
}

/*
* 解析虚拟数据源组信息表达式
* 表达式格式: 数据源类型|数据源key
* 如:master|dsm1#slave|dss1
*/
private DataSourceGroup parse2group(String expression, Map<String, DataSource> dataSourceMap) {
    String[] dataSourceInfos = expression.split("#");
    if(dataSourceInfos.length > 0){
        DataSourceGroup dataSourceGroup = new DataSourceGroup();
        for(String dataSourceInfo : dataSourceInfos){
            String[] infos = dataSourceInfo.split("\\|");
            DataSourceType dataSourceType = DataSourceType.from(infos[0]);
            if(DataSourceType.MASTER.equals(dataSourceType)){
                DataSource masterDataSource = dataSourceMap.get(infos[1]);
                if(masterDataSource == null){
                    throw new IllegalArgumentException("dataSourceMap中没有key为[" + infos[1] + "]的数据源,请检查配置!");
                }
                dataSourceGroup.setMasterDataSource(masterDataSource);
            }else{
                DataSource slaveDataSource = dataSourceMap.get(infos[1]);
                if(slaveDataSource == null){
                    throw new IllegalArgumentException("dataSourceMap中没有key为[" + infos[1] + "]的数据源,请检查配置!");
                }
                dataSourceGroup.addSlaveDataSource(slaveDataSource);
            }
        }
        return dataSourceGroup;
    }else{
        throw new IllegalArgumentException("dataSourceInfos is null or empey!");
    }
}

```


```java
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.datasource.lookup.DataSourceLookup;
import org.springframework.jdbc.datasource.lookup.DataSourceLookupFailureException;

import javax.sql.DataSource;
import java.util.Map;

@Slf4j
@Data
public class ShardingDataSourceLookup implements DataSourceLookup {

    //保存数据源组的映射。
    private Map<String, VirtualDataSource> virtualDataSourceMap;

    //默认数据源组。
    private DataSourceGroup defaultDataSourceGroup;

    public DataSource getDataSource(String dataSourceName)
            throws DataSourceLookupFailureException {
        try {
            if(virtualDataSourceMap == null || virtualDataSourceMap.size() == 0){
                throw new RuntimeException("virtualDataSourceMap is null or empry!");
            }
            //根据名称获取虚拟数据源。
            VirtualDataSource vds = virtualDataSourceMap.get(dataSourceName);
            if(vds == null){
                ShardingDataSourceKey key = new ShardingDataSourceKey();
                key.setVdsName(dataSourceName);
                key.setDbGroupKey(null);
                ShardingDataSourceUtils.setCurrentShardingDataSourceKey(key);
                //选择默认的数据源组。
                return defaultDataSourceGroup.getMasterDataSource();
            }else{
                if(log.isDebugEnabled())
                    log.debug("通过[DataSourceName={}]选择了一个虚拟数据源[{}]!", dataSourceName, vds);
                //获取物理数据源组。
                //通过具体分库分表策略计算得出的数据库标记来获取一个数据源组。
                //判断是否为手工指定
                String dbKey;
                if(ShardingDataSourceUtils.isManual()){
                    dbKey = DataSourceLocalKeys.MANUAL_CURRENT_DS_GROUP_KEY.get();
                }else{
                    //得到的分库的索引值，例如：0、1、。。。
                    dbKey = DataSourceLocalKeys.CURRENT_DS_GROUP_KEY.get();
                }
                if(dbKey == null){
                    throw new RuntimeException("dbKey is null!");
                }
                //从虚拟数据源中的Map找到每个分库对应的数据源
                DataSourceGroup targetDSGroup = vds.getDataSourceGroup(dbKey);
                if(targetDSGroup == null){
                    throw new RuntimeException("can't find dataSourceGroup with name ["+dbKey+"]!");
                }
                ShardingDataSourceKey key = new ShardingDataSourceKey();
                key.setVdsName(dataSourceName);//虚拟数据源的名称
                key.setDbGroupKey(dbKey);//虚拟数据源的索引
                ShardingDataSourceUtils.setCurrentShardingDataSourceKey(key);
                return targetDSGroup.getMasterDataSource();
            }
        } catch (Exception e) {
            log.error("选择数据源过程中发生错误!", e);
            throw new DataSourceLookupFailureException(e.getMessage(), e);
        } finally{
            DataSourceLocalKeys.CURRENT_DS_GROUP_KEY.remove();
            DataSourceLocalKeys.CURRENT_VDS_KEY.remove();
        }
    }

}
```

有空分析下
1、Mapper接口的实现类创建过程
2、调用Mapper接口中的方式，实际的执行过程


MapperFactoryBean
```java
public class MapperFactoryBean<T> extends SqlSessionDaoSupport implements FactoryBean<T> {
    private Class<T> mapperInterface;
    public T getObject() throws Exception {
        return getSqlSession().getMapper(this.mapperInterface);
    }
    public Class<T> getObjectType() {
        return this.mapperInterface;
    }
    public boolean isSingleton() {
        return true;
    }
}

public class ClassPathMapperScanner extends ClassPathBeanDefinitionScanner {
    public Set<BeanDefinitionHolder> doScan(String... basePackages) {
        Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);

        if (beanDefinitions.isEmpty()) {
            logger.warn("No MyBatis mapper was found in '" + Arrays.toString(basePackages) + "' package. Please check your configuration.");
        } else {
            processBeanDefinitions(beanDefinitions);
        }

        return beanDefinitions;
    }

    private MapperFactoryBean<?> mapperFactoryBean = new MapperFactoryBean<Object>();

    //将接口形式的BeanDefinition转成MapperFactoryBean形式的
    private void processBeanDefinitions(Set<BeanDefinitionHolder> beanDefinitions) {
        GenericBeanDefinition definition;
        for (BeanDefinitionHolder holder : beanDefinitions) {
            definition = (GenericBeanDefinition) holder.getBeanDefinition();
            
            //会调用有参构造
            definition.getConstructorArgumentValues().addGenericArgumentValue(definition.getBeanClassName()); // issue #59
            //实际生成的Bean类型
            definition.setBeanClass(this.mapperFactoryBean.getClass());
            //设置属性值
            definition.getPropertyValues().add("addToConfig", this.addToConfig);

            boolean explicitFactoryUsed = false;
            if (StringUtils.hasText(this.sqlSessionFactoryBeanName)) {
                definition.getPropertyValues().add("sqlSessionFactory", new RuntimeBeanReference(this.sqlSessionFactoryBeanName));
                explicitFactoryUsed = true;
            } else if (this.sqlSessionFactory != null) {
                definition.getPropertyValues().add("sqlSessionFactory", this.sqlSessionFactory);
                explicitFactoryUsed = true;
            }

            if (StringUtils.hasText(this.sqlSessionTemplateBeanName)) {
                if (explicitFactoryUsed) {
                logger.warn("Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
                }
                definition.getPropertyValues().add("sqlSessionTemplate", new RuntimeBeanReference(this.sqlSessionTemplateBeanName));
                explicitFactoryUsed = true;
            } else if (this.sqlSessionTemplate != null) {
                if (explicitFactoryUsed) {
                logger.warn("Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
                }
                definition.getPropertyValues().add("sqlSessionTemplate", this.sqlSessionTemplate);
                explicitFactoryUsed = true;
            }

            if (!explicitFactoryUsed) {
                if (logger.isDebugEnabled()) {
                logger.debug("Enabling autowire by type for MapperFactoryBean with name '" + holder.getBeanName() + "'.");
                }
                definition.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
            }
        }
    }
}


public class MapperScannerRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware {
    // ResourceLoaderAware 注入
    private ResourceLoader resourceLoader;

    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        //读取的是 Application 上的 MapperScan 注解
        AnnotationAttributes annoAttrs = AnnotationAttributes.fromMap(
            importingClassMetadata.getAnnotationAttributes(MapperScan.class.getName())
        );
        //创建ClassPathMapperScanner与上面的类连起来了
        ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
    }
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(MapperScannerRegistrar.class)
public @interface MapperScan {
}

@MapperScan(value = "com.xxx.dao")
public class Application {
}
```





```java
@Configuration
@Slf4j
public class MybatisConfig {
    @Bean
    ConfigurationCustomizer mybatisConfigurationCustomizer() {
        log.info("add mybatisConfigurationCustomizer!");
        return new ConfigurationCustomizer() {
            @Override
            public void customize(org.apache.ibatis.session.Configuration configuration) {
                configuration.addInterceptor(new DynamicDataSourceInterceptor());
            }
        };
    }
}


@Intercepts({
        @Signature(type = Executor.class, method = "queryCursor", args = { MappedStatement.class, Object.class,
                RowBounds.class }),
        @Signature(type = StatementHandler.class, method = "prepare", args = { Connection.class, Integer.class }),
        @Signature(type = Executor.class, method = "update", args = { MappedStatement.class, Object.class }),
        @Signature(type = Executor.class, method = "query", args = { MappedStatement.class, Object.class,
                RowBounds.class, ResultHandler.class, CacheKey.class, BoundSql.class }),
        @Signature(type = Executor.class, method = "query", args = { MappedStatement.class, Object.class,
                RowBounds.class, ResultHandler.class }), })
@Slf4j
public class DynamicDataSourceInterceptor implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object targetObject = invocation.getTarget();
        if (targetObject instanceof Executor) {
            MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
            Object parameterObject = invocation.getArgs()[1];
            // 获取Dao执行的方法信息。 例如：com.a.b.UserDao.addUser
            String methodInfo = mappedStatement.getId();
            // 获取Dao层面的目标执行方法。
            int splitIndex = methodInfo.lastIndexOf(".");
            String className = methodInfo.substring(0, splitIndex);
            Class<?> classObject = Class.forName(className);
            TargetDataSource targetDataSource = classObject.getAnnotation(TargetDataSource.class);
            if (null != targetDataSource) {
                DataSourceLocalKeys.CURRENT_VDS_KEY.set(targetDataSource.value());
                DataSourceLocalKeys.CURRENT_DS_GROUP_KEY.set(targetDataSource.dbkey());
            }
            // log.info("DynamicDataSourceInterceptor current data source is {}.",
            // DataSourceLocalKeys.CURRENT_VDS_KEY.get());
        }
        try {
            return invocation.proceed();
        } finally {
            DataSourceLocalKeys.CURRENT_VDS_KEY.remove();
            DataSourceLocalKeys.CURRENT_DS_GROUP_KEY.remove();
        }
    }

    @Override
    public Object plugin(Object target) {
        if (target instanceof StatementHandler) {
            return Plugin.wrap(target, this);
        } else if (target instanceof Executor) {
            return Plugin.wrap(target, this);
        } else {
            return target;
        }
    }

    @Override
    public void setProperties(Properties properties) {
    }
}
```