




```java
public class RpcConsumerPostProcessor implements Ordered,
    BeanClassLoaderAware, BeanFactoryPostProcessor {

    protected final Logger logger = LoggerFactory.getLogger(getClass());
    
    protected ClassLoader classLoader;
    
    protected int order = Ordered.LOWEST_PRECEDENCE;
    
    /**
     * key: referenceKey用来唯一标识一个Reference(目前暂时未包括version/group信息) {@link #generateReferenceKey(Field)}
     * value: beanName
     * 用来防止同一个Reference重复注册, 如果已经有相同的referenceKey则只需要注册别名给spring即可
     * */
    protected final Map<String, List<String>> referenceKeyToBeanNameMap = new HashMap<>();
    
    /**
     * key: beanName(实际上等于带{@link RpcConsumer}注解的字段名)
     * */
    protected final Map<String, BeanDefinition> beanDefinitions = new LinkedHashMap<>();
    
    /**
     * key: beanName(实际上等于带{@link RpcConsumer}注解的字段名)
     * value: 带{@link RpcConsumer}注解的字段
     * */
    protected final Map<String, Field> rpcConsumerFields = new LinkedHashMap<>();

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        String[] beanNames = beanFactory.getBeanDefinitionNames();
        // 先遍历所有spring扫描到的bean
        for (String beanName : beanNames) {
            Class<?> beanType;
            if (beanFactory.isFactoryBean(beanName)){
                BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName);
                // RpcConsumerFactoryBean内肯定不会出现带@RpcConsumer注解的字段, 直接跳过
                if (isRpcConsumerFactoryBean(beanDefinition)) {
                    continue;
                }
                // 工厂类不能直接beanFactory.getType否则返回RpcConsumerFactoryBean而非com.example.Person
                String beanClassName = beanDefinition.getBeanClassName();
                beanType = ClassUtils.resolveClass(beanClassName, classLoader);
            } else {
                beanType = beanFactory.getType(beanName);
            }
            //返回的是要创建的Bean类型，若是工厂FactoryBean则是内部的生产类
            if (beanType != null) {
                // 扫描已存在bean中带@RpcConsumer注解的字段, 收集成待注册BeanDefinition
                try {
                    ReflectionUtils.doWithFields(beanType, new FieldCallback() {
                        @Override
                        public void doWith(Field field) throws IllegalArgumentException, IllegalAccessException {
                            //遍历Class对象的每个Field，然后回调该方法
                            RpcConsumerPostProcessor.this.parseField(field);
                        }
                    });
                } catch (Throwable e) {
                    String msg = String.format("beanName: %s, beanType: %s. 尝试通过反射解析字段异常", beanName, beanType.getCanonicalName());
                    throw new FatalBeanException(msg, e);
                }
            }
        }
        
        // 此时已经遍历完使用普通方式注册/扫描到spring中的bean(不考虑还有后置BeanFactoryPostProcessor再往里追加bean的情况)
        // 开始注册RpcConsumerFactoryBean
        registerRpcConsumerFactoryBean(beanFactory);
    }

    /**
     * 注册{@link RpcConsumerFactoryBean}
     * */
    protected void registerRpcConsumerFactoryBean(ConfigurableListableBeanFactory beanFactory) {
        beanDefinitions.forEach((beanName, beanDefinition) -> {
            Field field = rpcConsumerFields.get(beanName);
            String referenceKey = generateReferenceKey(field);
            List<String> beanNames = referenceKeyToBeanNameMap.get(referenceKey);
            if (beanNames == null) {
                beanNames = new ArrayList<>();
                referenceKeyToBeanNameMap.put(referenceKey, beanNames);
                BeanDefinitionRegistry beanDefinitionRegistry = (BeanDefinitionRegistry) beanFactory;
                beanDefinitionRegistry.registerBeanDefinition(beanName, beanDefinition);
                logger.info("referenceKey: {}, 注册beanName: {}", referenceKey, beanName);
            } else {
                // 已经有相同的bean则只注册别名
                String existed = beanNames.get(0);
                beanFactory.registerAlias(existed, beanName);
                logger.info("referenceKey: {}, 增加beanName别名映射{} -> {}", referenceKey, beanName, existed);
            }
            beanNames.add(beanName);
        });
    }
    
    protected void parseField(Field field) {
        RpcConsumer annotation = AnnotationUtils.getAnnotation(field, RpcConsumer.class);
        if (annotation == null) {
            return;
        }
        
        // 使用字段名作为bean名称
        String beanName = field.getName();
        
        Field existedField;
        if ((existedField = rpcConsumerFields.get(beanName)) != null) {
            logger.info("通过 {} 注册RpcConsumer: {}, 跳过 {} 注册", field, beanName, existedField);
        }
        this.rpcConsumerFields.put(beanName, field);
        
        // 直接注册给Spring的BeanDefinition是RpcConsumerFactoryBean工厂类
        RootBeanDefinition beanDefinition = new RootBeanDefinition();
        beanDefinition.setBeanClass(RpcConsumerFactoryBean.class);
        // 工厂类中指定实际的接口类
        Class<?> serviceClass = field.getType();
        // 设置字段值
        beanDefinition.getPropertyValues().add(RpcConsumerFactoryBean.ATTRIBUTE_INTERFACE_NAME, serviceClass.getName());
        beanDefinition.getPropertyValues().add(RpcConsumerFactoryBean.ATTRIBUTE_INTERFACE_CLASS, serviceClass);
        beanDefinition.getPropertyValues().add(RpcConsumerFactoryBean.ATTRIBUTE_INIT_ANNOTATION, annotation);
        
        // 注册给spring的RpcConsumerFactoryBean是个工厂类, 如果spring中有其他BeanFactoryPostProcessor尝试获取真正bean类型时(比如通过beanFactory.getType(beanName))
        // 可能会提早调用RpcConsumerFactoryBean#getObjectType()方法, 如果此时上方的class设置没有执行完成会导致返回null
        // 在此设置一个装饰用的BeanDefinition来辅助返回bean类型, 避免过早调用getObjectType()带来的问题
        GenericBeanDefinition targetDefinition = new GenericBeanDefinition();
        targetDefinition.setBeanClass(serviceClass);
        beanDefinition.setDecoratedDefinition(new BeanDefinitionHolder(targetDefinition, beanName+"_decorated"));
        
        this.beanDefinitions.put(beanName, beanDefinition);
    }
    
    protected String generateReferenceKey(Field field) {
        return field.getType().getCanonicalName();
    }

    @Override
    public void setBeanClassLoader(ClassLoader classLoader) {
        this.classLoader = classLoader;
    }

    @Override
    public int getOrder() {
        return order;
    }
    
    private boolean isRpcConsumerFactoryBean(BeanDefinition beanDefinition) {
        return RpcConsumerFactoryBean.class.getName().equals(beanDefinition.getBeanClassName());
    }

    public void setOrder(int order) {
        this.order = order;
    }
}
```





```java
public class RpcConsumerFactoryBean<T> implements FactoryBean<T>, InitializingBean,
    EnvironmentAware, BeanNameAware {
    
    // 以下几个ATTRIBUTE常量对应的是要动态设置的几个字段名, 如果修改字段名务必保证一并修改对应的ATTRIBUTE常量
    public static final String ATTRIBUTE_INTERFACE_NAME = "interfaceName";
    public static final String ATTRIBUTE_INTERFACE_CLASS = "interfaceClass";
    public static final String ATTRIBUTE_INIT_ANNOTATION = "initAnnotation";
    
    /**
     * 接口类名
     * */
    private String interfaceName;
    /**
     * 接口类
     * */
    private Class<T> interfaceClass;
    
    /**
     * 初始化时加载到的注解
     * */
    private RpcConsumer initAnnotation;
    
    private String interfaceVersion;
    
    private String interfaceKey;
    /**
     * reference实例
     * */
    private T instance;

    private RpcClientConfig<T> rpcClientConfig;
    /**
     * rpc容器, setter方法负责注入
     * */
    private RpcContainerHolder rpcContainerHolder;
    /**
     * rpc配置项, setter方法负责注入    
     * */
    private RpcStarterProperties rpcStarterProperties;
    
    private String interfaceRegistry;

    private Environment environment;
    
    private String beanName;
    
    @Override
    public void afterPropertiesSet() throws Exception {
        RpcClientConfig.Builder<T> builder = RpcClientConfig.custom();
        
        builder.interfaceClass(interfaceClass);
        
        final Reference reference = rpcStarterProperties.getReference();
        reference.passNonNullValue(interfaceName, Client::getConnections, builder::connections);
        
        final ReferenceInterface referenceInterface = reference.getReferenceInterface(interfaceName);
        Integer annoTimeout = parseTimeout(this.initAnnotation.timeout());
        // 接口级配置优先级: 配置文件接口配置 > 注解接口配置 > 配置文件全局配置 > wukong-rpc-framework默认配置
        Integer interfaceTimeout = null;
        if (referenceInterface != null) {
            // 配置文件接口配置
            interfaceTimeout = referenceInterface.getTimeout();
        }
        if (interfaceTimeout == null && annoTimeout != null) {
            // 注解接口配置
            interfaceTimeout = annoTimeout;
        }
        if (interfaceTimeout == null) {
            // 配置文件全局配置
            interfaceTimeout = reference.getTimeout();
        }
        if (interfaceTimeout != null) {
            builder.timeout(interfaceTimeout);
        }
        
        reference.passNonNullValue(interfaceName, Client::getRetries, builder::retries);
        reference.passNonNullValue(interfaceName, Client::isCheck, builder::check);
        
        // interface的负载均衡策略，优先级: 配置文件 > 注解
        if (referenceInterface != null && referenceInterface.getLoadbalance() != null) {
            builder.loadbalance(referenceInterface.getLoadbalance());
        } else {
            builder.loadbalance(this.initAnnotation.loadbalance());
        }
        
        if (referenceInterface != null && referenceInterface.getLoadbalanceDownsize() != null) {
            builder.loadbalanceDownsize(referenceInterface.getLoadbalanceDownsize());
        } else if (this.initAnnotation.loadbalanceDownsize() > 0){
            builder.loadbalanceDownsize(this.initAnnotation.loadbalanceDownsize());
        }
        
        interfaceVersion = reference.getInterfaceVersion(interfaceName);
        if (StringUtils.isEmpty(interfaceVersion)) {
            interfaceVersion = this.initAnnotation.version();
        }
        
        interfaceVersion = this.environment.resolvePlaceholders(interfaceVersion);
        
        interfaceRegistry = reference.getInterfaceRegistry(interfaceName);
        interfaceKey = interfaceName;
        if (interfaceVersion != null) {
            builder.version(interfaceVersion);
            interfaceKey += ":" + interfaceVersion;
        }
        
        // 全局异步标识
        if (reference.getAsync() != null) {
            builder.async(reference.getAsync());    
        }
        
        // 方法级超时配置: 配置文件 > 注解
        RpcMethod[] annoMethods = initAnnotation.methods();
        if (annoMethods != null && annoMethods.length > 0) {
            for (RpcMethod annoMethod : annoMethods) {
                // 先设置注解配置, 若配置文件有相同配置后续会被覆盖
                if (StringUtils.isEmpty(annoMethod.name())) {
                    continue;
                }
                builder.methodConfig(annoMethod.name(), parseTimeout(annoMethod.timeout()), 
                        annoMethod.retries(), annoMethod.async(), annoMethod.loadbalance());
            }
        }
        
        // 接口级异步标识
        if (referenceInterface != null && referenceInterface.getAsync() != null) {
            builder.async(referenceInterface.getAsync());    
        } else {
            builder.async(initAnnotation.async());
        }
        
        if (referenceInterface != null && referenceInterface.getMethods() != null &&
                !referenceInterface.getMethods().isEmpty()) {
            List<ReferenceMethod> methods = referenceInterface.getMethods();
            for (ReferenceMethod method : methods) {
                if (StringUtils.isEmpty(method.getName())) {
                    continue;
                } else {
                    builder.methodConfig(method.getName(), method.getTimeout(), 
                            method.getRetries(), method.getAsync(), method.getLoadbalance());
                }
            }
        }
        
        this.rpcClientConfig = builder.build();
        this.instance = rpcContainerHolder.createClient(rpcClientConfig, interfaceRegistry);
    }
    
    @Override
    public T getObject() throws Exception {
        return instance;
    }

    @Override
    public Class<?> getObjectType() {
        return interfaceClass;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

    public String getInterfaceName() {
        return interfaceName;
    }

    /**
     * 在{@link RpcConsumerPostProcessor}中指定设置, 相当于new出对象后直接设置值, 还未到执行spring注入的阶段
     * @see RpcConsumerPostProcessor#parseField(java.lang.reflect.Field)
     * @see #ATTRIBUTE_INTERFACE_NAME
     * */
    public void setInterfaceName(String interfaceName) {
        this.interfaceName = interfaceName;
    }

    public RpcStarterProperties getRpcStarterProperties() {
        return rpcStarterProperties;
    }

    @Autowired
    public void setRpcStarterProperties(RpcStarterProperties rpcStarterProperties) {
        this.rpcStarterProperties = rpcStarterProperties;
    }

    @Override
    public String toString() {
        return "RpcConsumerFactoryBean[" + interfaceKey + "]";
    }

    public Class<T> getInterfaceClass() {
        return interfaceClass;
    }

    public void setInterfaceClass(Class<T> interfaceClass) {
        this.interfaceClass = interfaceClass;
    }

    public RpcContainerHolder getRpcContainerHolder() {
        return rpcContainerHolder;
    }

    @Autowired
    public void setRpcContainerHolder(RpcContainerHolder rpcContainerHolder) {
        this.rpcContainerHolder = rpcContainerHolder;
    }

    public RpcConsumer getInitAnnotation() {
        return initAnnotation;
    }

    public void setInitAnnotation(RpcConsumer initAnnotation) {
        this.initAnnotation = initAnnotation;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }
    
    private Integer parseTimeout(String timeout) {
        final String sourceStr = timeout;
        if (StringUtils.isEmpty(timeout)) {
            return null;
        } else {
            String resolved = this.environment.resolvePlaceholders(timeout);
            if (StringUtils.isEmpty(resolved)) {
                return null;
            } else {
                try {
                    return Integer.parseInt(resolved);
                } catch (NumberFormatException e) {
                    throw new BeanCreationException(beanName, "超时配置解析失败: " + sourceStr, e);
                }
            }
        }
    }

    @Override
    public void setBeanName(String name) {
        this.beanName = name;
    }
    
    public String getInterfaceVersion() {
        return interfaceVersion;
    }
}
```




```java
public class ClassUtils {
    public static final String ARRAY_SUFFIX = "[]";
    public static final Set<Class<?>> SIMPLE_TYPES = ofSet(
            Void.class,
            Boolean.class,
            Character.class,
            Byte.class,
            Short.class,
            Integer.class,
            Long.class,
            Float.class,
            Double.class,
            String.class,
            BigDecimal.class,
            BigInteger.class,
            Date.class,
            Object.class
    );
    
    //Separator char for package
    private static final char PACKAGE_SEPARATOR_CHAR = '.';
    //Prefix for internal array class names: "[L"
    private static final String INTERNAL_ARRAY_PREFIX = "[L";
    //"int" -> "int. class".
    private static final Map<String, Class<?>> PRIMITIVE_TYPE_NAME_MAP = new HashMap<>(32);
    //Integer. class -> int. class.
    private static final Map<Class<?>, Class<?>> PRIMITIVE_WRAPPER_TYPE_MAP = new HashMap<>(16);

    static {
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Boolean.class, boolean.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Byte.class, byte.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Character.class, char.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Double.class, double.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Float.class, float.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Integer.class, int.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Long.class, long.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Short.class, short.class);
        PRIMITIVE_WRAPPER_TYPE_MAP.put(Void.class, void.class);
        //基础类型的集合
        Set<Class<?>> primitiveTypeNames = new HashSet<>(32);
        primitiveTypeNames.addAll(PRIMITIVE_WRAPPER_TYPE_MAP.values());
        primitiveTypeNames.addAll(Arrays
                .asList(boolean[].class, byte[].class, char[].class, double[].class,
                        float[].class, int[].class, long[].class, short[].class));
        for (Class<?> primitiveTypeName : primitiveTypeNames) {
            PRIMITIVE_TYPE_NAME_MAP.put(primitiveTypeName.getName(), primitiveTypeName);
        }
    }
    //必需前面先执行后面才能反转
    private static final Map<Class<?>, Class<?>> WRAPPER_PRIMITIVE_TYPE_MAP = flip(PRIMITIVE_WRAPPER_TYPE_MAP);

    public static Class<?> resolveClass(String className, ClassLoader classLoader) {
        Class<?> targetClass = null;
        try {
            targetClass = forName(className, classLoader);
        } catch (Exception ignored) { // Ignored
        }
        return targetClass;
    }
}

```




```java
public class CollectionUtils {

    // 反转Map但是要求value必需唯一
    public static <K, V> Map<V, K> flip(Map<K, V> map) {
        if (isEmptyMap(map)) {
            return (Map<V, K>) map;
        }
        Set<V> set = map.values().stream().collect(Collectors.toSet());
        if (set.size() != map.size()) {
            throw new IllegalArgumentException("The map value must be unique.");
        }
        return map.entrySet()
                .stream()
                .collect(Collectors.toMap(Map.Entry::getValue, Map.Entry::getKey));
    }

}
```
