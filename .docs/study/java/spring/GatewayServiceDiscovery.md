/project/META-INF/spring.factories
```factories
# AutoConfiguration
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.yueyue.springboot.autoconfig.gateway.GatewayAutoConfiguration
```

```java
@Configuration
@EnableConfigurationProperties
@Import(GatewayLogBeanProcessor.class)
public class GatewayAutoConfiguration {
    
    private static final Logger logger = LoggerFactory.getLogger(GatewayAutoConfiguration.class);

    @Bean
    @ConditionalOnMissingBean
    @ConfigurationProperties(prefix = "yueyue.gateway")
    public GatewayProperties gatewayProperties() {
        GatewayProperties gatewayProperties = new GatewayProperties();
        return gatewayProperties;
    }

    @Bean(initMethod = "init")
    @ConditionalOnMissingBean
    public GatewayServiceDiscovery gatewayServiceDiscovery(GatewayProperties gatewayProperties) {
        GatewayCheckedLogData.init(gatewayProperties);
        return new GatewayServiceDiscovery(gatewayProperties);
    }

    @Bean(initMethod = "init")
    @ConditionalOnMissingBean
    public GatewayInvokePipeline gatewayInvokePipeline(
        @Value("${spring.application.name:UNKNOWN}") String applicationName,
        GatewayServiceDiscovery serviceDiscovery, GatewayProperties gatewayProperties) {
        return new GatewayInvokePipeline(applicationName, serviceDiscovery, gatewayProperties);
    }

    @Bean
    @ConditionalOnMissingBean
    public GatewayDispatcher gatewayDispatcher(GatewayInvokePipeline pipeline) {
        return new GatewayDispatcher(pipeline);
    }

    @Bean
    public FilterRegistrationBean eagleEyeFilterRegistration(GatewayServiceDiscovery discovery) {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new TraceFilter());
        registration.addUrlPatterns(discovery.getFilterRootMapping().toArray(new String[0]));
        registration.addInitParameter("useLocalIp", "true");
        registration.setName("eagleEyeFilter");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    public HttpAdminServer httpAdminServer(@Value("${yueyue.gateway.admin.port:0}") int adminPort,
                                           ProbeRequestHandler probeRequestHandler) throws Exception {
        HttpAdminServer httpAdminServer = new HttpAdminServer();
        httpAdminServer.setProbeRequestHandler(probeRequestHandler);
        if (adminPort > 0) {
            httpAdminServer.setPort(adminPort);
        }
        httpAdminServer.start();
        return httpAdminServer;
    }

    @Bean
    public ProbeRequestHandler probeRequestHandler() {
        return new ProbeRequestHandler();
    }

    // url 与 handler 的映射关系
    @Bean
    public HandlerMapping gatewayHandlerMapping(GatewayServiceDiscovery discovery, GatewayDispatcher dispatcher,
                                                ProbeRequestHandler probeRequestHandler) {
        SimpleUrlHandlerMapping urlHandlerMapping = new SimpleUrlHandlerMapping();

        Map<String, Object> handlerMap = new HashMap<>();
        //中转的 HttpRequestHandler
        discovery.getRootMapping().forEach(root -> handlerMap.put(root, dispatcher));
        //初始化探活探针
        handlerMap.put(ProbeRequestHandler.PROBE_PATH, probeRequestHandler);
        urlHandlerMapping.setUrlMap(handlerMap);

        Map<String, CorsConfiguration> corsConfigurationMap = buildCorsConfigrationMap(discovery);
        urlHandlerMapping.setCorsConfigurations(corsConfigurationMap);

        urlHandlerMapping.setOrder(-1);
        return urlHandlerMapping;
    }

    private Map<String, CorsConfiguration> buildCorsConfigrationMap(GatewayServiceDiscovery discovery) {
        Map<String, CorsConfiguration> corsConfigurationMap = new HashMap<>();
        GatewayServiceRouter gatewayServiceRouter = discovery.getGatewayServiceRouter();
        gatewayServiceRouter.getRootPaths().forEach(rootPath -> {
            GatewayServiceGroup gatewayServiceGroup = gatewayServiceRouter.getGatewayServiceGroup(rootPath);
            if (gatewayServiceGroup == null) {
                return;
            }

            Map<String, CorsConfiguration> corsCache = new HashMap<>();
            Collection<GatewayMethodDefinition> methodDefinitions = gatewayServiceGroup.getAllGatewayMethodDefinition();
            methodDefinitions.forEach(methodDefinition -> {
                String allowedOrigins = methodDefinition.getApiConfig().getAllowedOrigins();
                if (StringUtils.isNotEmpty(allowedOrigins)) {
                    allowedOrigins = allowedOrigins.trim();
                    CorsConfiguration cors = corsCache.get(allowedOrigins);
                    if (cors == null) {
                        cors = new CorsConfiguration();
                        cors.addAllowedOrigin(allowedOrigins);
                        cors.addAllowedMethod("*");
                        cors.addAllowedHeader("*");
                        cors.setAllowCredentials(true);
                        cors.setMaxAge(3600L);
                        corsCache.put(allowedOrigins, cors);
                    }
                    for (String path : methodDefinition.getRequestPath()) {
                        corsConfigurationMap.put("/" + methodDefinition.getRootPath() + path, cors);
                    }
                }
            });
        });

        logger.info("The following uri have cors configured: {}.", corsConfigurationMap.keySet());
        return corsConfigurationMap;
    }
}
```



```java
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Service
public @interface GatewayApiService {
    Class<?> serviceInterface();
    String serviceVersion() default "";
    String serviceRootPath() default "api";
}
```

```java
public class GatewayServiceConstant {
    public final static Map<String, Class<? extends Annotation>> ALL_GATEWAY_SERVICE = Maps.newHashMap();
    public final static Set<String> ALL_GATEWAY_SERVICE_NAME = Sets.newHashSet();

    static {
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY", GatewayApiService.class); //整合Service
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_ADMIN", GatewayAdminService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_OPENAPI", GatewayOpenApiService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_ETRAVEL", GatewayEtravelService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_H5", GatewayH5ApiService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_INNER", GatewayInnerService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_TAXIMETERAPI", GatewayTaximeterApiService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_ETRAVEL_SAAS", GatewayEtravelSaasService.class);
        ALL_GATEWAY_SERVICE.put("YUEYUE_GATEWAY_ENT_ADMIN", GatewayEntAdminService.class);

        ALL_GATEWAY_SERVICE.values().forEach(service -> ALL_GATEWAY_SERVICE_NAME.add(service.getSimpleName()));
    }
}
```



```java
@Slf4j
public class GatewayServiceDiscovery implements ApplicationContextAware {

    private final static Map<String, String> GATEWAY_CONFIG_GROUPIDS = Maps.newHashMap();
    private final static List<Class<? extends Annotation>> CANDIDATE =
            Lists.newArrayList(GatewayServiceConstant.ALL_GATEWAY_SERVICE.values());

    static {
        GatewayServiceConstant.ALL_GATEWAY_SERVICE.forEach(
                (groupId, service) -> GATEWAY_CONFIG_GROUPIDS.put(service.getSimpleName(), groupId));

        JsonUtils.registerModule(MultipartFile.class);
        JsonUtils.registerModule(InputStream.class);
        JsonUtils.registerModule(byte[].class);
    }

    private final Set<String> GATEWAY_HANDLE_TYPE = new HashSet<>();

    private ApplicationContext applicationContext;

    private GatewayServiceRouter serviceRouter = new GatewayServiceRouter();

    private GatewayProperties gatewayProperties;

    public GatewayServiceDiscovery(GatewayProperties gatewayProperties) {
        this.gatewayProperties = gatewayProperties;
    }

    public GatewayMethodDefinition getMethodDefinition(String uri) {
        return serviceRouter.getMethodDefinition(uri);
    }

    private void putMethodDefinition(GatewayMethodDefinition definition) {
        serviceRouter.putMethodDefinition(definition);
        FlowControlRuleHolder.addMethodRule(definition);
    }

    public List<String> getRootMapping() {
        return serviceRouter.getRootPaths().stream().map(path -> "/" + path + "/**").collect(Collectors.toList());
    }

    public List<String> getFilterRootMapping() {
        return serviceRouter.getRootPaths().stream().map(path -> "/" + path + "/*").collect(Collectors.toList());
    }

    public boolean matchHandleType(Set<String> handleType) {
        Set<String> tmp = Sets.newHashSet(handleType);
        tmp.retainAll(GATEWAY_HANDLE_TYPE);
        return !tmp.isEmpty();
    }

    public GatewayServiceRouter getGatewayServiceRouter() {
        return serviceRouter;
    }

    private void resolveAndSetVersion(AnnotationInfo info) {
        if(gatewayProperties.getVersions() != null
                && gatewayProperties.getVersions().containsKey(info.getInterfaceName())) {
            info.version = gatewayProperties.getVersions().get(info.getInterfaceName());
        } else if(!StringUtils.isEmpty(gatewayProperties.getVersion())) {
            info.version = gatewayProperties.getVersion();
        }

        if(StringUtils.isEmpty(info.version))
            log.error("[GatewayServiceDiscovery]Gateway Service Config Version Is Empty: {}", info.getInterfaceName());
    }
    // 被指定为了 init 方法
    public void init() {
        //要处理的注解集合
        CANDIDATE.forEach(this::processGatewayServices);
    }

    private <T extends Annotation> void processGatewayServices(Class<T> clazz) {
        Collection<String> beanNames = findGatewayServiceBeanNames(clazz);
        for (String beanName : beanNames) {
            Object bean = applicationContext.getBean(beanName);

            Class<?> userType = ClassUtils.getUserClass(bean.getClass());
            T gatewayService = AnnotationUtils.findAnnotation(userType, clazz);
            AnnotationInfo info = AnnotationHelper.getAnnotationInfo(gatewayService, beanName, clazz);
            
            resolveAndSetVersion(info);

            GatewayServiceConfig serviceConfig = getServiceConfigAndListening(info);
            if(serviceConfig == null) {
                log.error("[GatewayServiceDiscovery]Gateway Service Config Not Found: {}", info.getIdentify());
                continue;
            } else if(!checkServiceConfig(info, serviceConfig)) {
                log.error("[GatewayServiceDiscovery]Gateway Service Config Interface or Version Not Match: {}", info.getIdentify());
                continue;
            }

            Map<String, ApiConfig> methodConfig = serviceConfig.getApiConfigs();
            Set<Method> methods = MethodIntrospector.selectMethods(info.interfaceClazz,
                    (ReflectionUtils.MethodFilter) method ->
                            checkGatewayApiConfig(info, methodConfig, method)
                                    && saveGatewayApiDefinition(info, methodConfig, bean, method, serviceConfig.isRecordResponseBody()));
            if(methods.isEmpty()) {
                log.error("[GatewayServiceDiscovery]Gateway Service No Method Expose: {}", info.getIdentify());
                continue;
            }
            GATEWAY_HANDLE_TYPE.add(info.serviceType);
            FlowControlRuleHolder.addInterfaceRule(serviceConfig);
        }
    }

    private <T extends Annotation> Collection<String> findGatewayServiceBeanNames(Class<T> clazz) {
        String[] beanNames = this.applicationContext.getBeanNamesForAnnotation(clazz);
        return Arrays.asList(beanNames);
    }

    private void updateServiceDefinition(AnnotationInfo info, String conf) {
        GatewayServiceConfig serviceConfig = null;
        try {
            serviceConfig = JsonUtils.readValue(conf, GatewayServiceConfig.class);
            if(!checkServiceConfig(info, serviceConfig)) {
                log.error("[GatewayServiceDiscovery]Gateway Service Config Interface or Version Not Match: {}", info.getIdentify());
                return;
            }
        } catch (Exception e) {
            log.error("[GatewayServiceDiscovery]UpdateServiceDefinitionMap Error", e);
            return;
        }
        validateGatewayServiceConfig(serviceConfig, info);
        try {
            String interfaceName = serviceConfig.getName();
            Class clazz = Class.forName(interfaceName);
            Object bean = this.applicationContext.getBean(info.instanceName);
            Map<String, ApiConfig> methodConfig = serviceConfig.getApiConfigs();
            for(Method method : ReflectionUtils.getAllDeclaredMethods(clazz)) {
                if(checkGatewayApiConfig(info, methodConfig, method))
                    saveGatewayApiDefinition(info, methodConfig, bean, method, serviceConfig.isRecordResponseBody());
            }
            FlowControlRuleHolder.addInterfaceRule(serviceConfig);
            FlowControlRuleHolder.reloadFlowRules();

        } catch (Exception e) {
            log.error("[GatewayServiceDiscovery]UpdateServiceDefinitionMap Error", e);
        }


    }

    private boolean checkGatewayApiConfig(AnnotationInfo info, Map<String, ApiConfig> methodConfig, Method method) {
        if(!methodConfig.containsKey(method.getName())) {
            log.warn("[GatewayServiceDiscovery]Gateway Service Method Config Miss: {}.{}", info.getInterfaceName(), method.getName());
            return false;
        }
        ApiConfig apiConfig = methodConfig.get(method.getName());
        if(apiConfig == null || !apiConfig.isEnable()) {
            log.warn("[GatewayServiceDiscovery]Gateway Service Method Config Disable: {}.{}", info.getInterfaceName(), method.getName());
            return false;
        }

        if(ParameterMappingMode.JSON_BODY.equals(apiConfig.getRequestParameterMappingMode())
                && HttpMethod.GET.equals(apiConfig.getMethod())) {
            log.error("[GatewayServiceDiscovery]Gateway Service Method Config Conflict: {}.{}", info.getInterfaceName(), method.getName());
            return false;
        }

        return true;
    }

    // 重点关注这个方法，它是如何解析注解生成GatewayMethodDefinition
    private boolean saveGatewayApiDefinition(AnnotationInfo info, Map<String, ApiConfig> methodConfig, Object bean,
                                             Method method, boolean recordResponseBody) {
        Method targetMethod = transGatewayMethod(bean, method);
        if (targetMethod == null) {
            log.error("[GatewayServiceDiscovery]Gateway Service Method Implement Error: {}.{}", info.instanceName, method.getName());
            return false;
        } else if(AnnotationUtils.findAnnotation(targetMethod, GatewayMethodIgnore.class) != null) {
            log.warn("[GatewayServiceDiscovery]Gateway Service Method Ignore: {}.{}", info.instanceName, method.getName());
            return false;
        }

        ApiConfig apiConfig = methodConfig.get(targetMethod.getName());
        String rootPath = StringUtils.isEmpty(apiConfig.getCustomRoot()) ? info.rootPath : apiConfig.getCustomRoot();
        GatewayMethodDefinition definition = new GatewayMethodDefinition();
        definition.setIdentify(info.getIdentify());
        definition.setServiceType(info.serviceType);
        definition.setRootPath(rootPath);
        definition.setInvoker(bean);
        definition.setMethod(targetMethod);
        definition.setRecordResponseBody(recordResponseBody);

        GatewayMethodMapping methodMapping = AnnotationUtils.findAnnotation(targetMethod, GatewayMethodMapping.class);
        if (methodMapping != null && methodMapping.path().length > 0) {
            apiConfig.setPath(Arrays.asList(methodMapping.path()));
        }
        definition.setApiConfig(normalizeApiConfigPath(apiConfig));

        putMethodDefinition(definition);
        return true;
    }

    private Method transGatewayMethod(Object bean, Method method) {
        try {
            Class<?> userType = ClassUtils.getUserClass(bean.getClass());
            return userType.getMethod(method.getName(), method.getParameterTypes());
        } catch (NoSuchMethodException e) {
            return null;
        }
    }

    private ApiConfig normalizeApiConfigPath(ApiConfig apiConfig) {
        List<String> paths = new ArrayList<>();
        for(String path : apiConfig.getPath()) {
            if(!StringUtils.isEmpty(path)) {
                if(path.startsWith("/"))
                    paths.add(path);
                else
                    paths.add("/" + path);
            }
        }
        apiConfig.setPath(paths);
        return apiConfig;
    }

    private GatewayServiceConfig getServiceConfigAndListening(AnnotationInfo info) {
        try {
            String dataId = info.getIdentify();
            String config = GatewayConfigManager.getConfigAndListening(dataId, GATEWAY_CONFIG_GROUPIDS.get(info.serviceType), new ConfigManagerListener() {
                @Override
                public void receiveConfigInfo(String config) {
                    updateServiceDefinition(info, config);
                    log.info("[GatewayServiceDiscovery]Gateway Service Config Update Success: {}", info.getIdentify());
                }
            });
            if(StringUtils.isEmpty(config))
                return null;
            GatewayServiceConfig gatewayServiceConfig = JsonUtils.readValue(config, GatewayServiceConfig.class);
            validateGatewayServiceConfig(gatewayServiceConfig, info);
            return gatewayServiceConfig;
        } catch (IOException e) {
            log.error("[GatewayServiceDiscovery]Gateway Service Config Format Error: {}", info.getIdentify());
            return null;
        }
    }

    private static void validateGatewayServiceConfig(GatewayServiceConfig gatewayServiceConfig, AnnotationInfo info) {
        if(gatewayServiceConfig == null || gatewayServiceConfig.getApiConfigs() == null) {
            return;
        }
        for (ApiConfig apiConfig : gatewayServiceConfig.getApiConfigs().values()) {
            if(!CollectionUtils.isEmpty(apiConfig.getExcludeParams())) {
                log.error("[GatewayServiceDiscovery]excludeParams参数必须为空，新版本未实现过滤:{}", info.getIdentify());
                throw new RuntimeException(String.format("[GatewayServiceDiscovery]excludeParams参数必须为空，新版本未实现过滤:%s", info.getIdentify()));
            }
        }
    }

    private boolean checkServiceConfig(AnnotationInfo info, GatewayServiceConfig serviceConfig) {
        return info.getInterfaceName().equals(serviceConfig.getName()) &&  info.version.equals(serviceConfig.getVersion());
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    private static class AnnotationHelper {
        static <T extends Annotation> AnnotationInfo getAnnotationInfo(T annotation, String beanName, Class<T> clazz) {
            AnnotationInfo info = new AnnotationInfo();
            info.serviceType = clazz.getSimpleName();
            info.instanceName = beanName;
            info.interfaceClazz = AnnotationHelper.getServiceInterface(annotation, clazz);
            info.version = AnnotationHelper.getServiceVersion(annotation, clazz);
            info.rootPath = AnnotationHelper.getServiceRootPath(annotation, clazz);
            info.rootPath = info.rootPath.endsWith("/") ? info.rootPath.substring(0, info.rootPath.length() - 2) : info.rootPath;
            return info;
        }

        static <T extends Annotation> String getServiceVersion(T annotation, Class<T> clazz) {
            Method method = ReflectionUtils.findMethod(clazz, "serviceVersion");
            return (String)ReflectionUtils.invokeMethod(method, annotation);
        }

        static <T extends Annotation> Class getServiceInterface(T annotation, Class<T> clazz) {
            Method method = ReflectionUtils.findMethod(clazz, "serviceInterface");
            return (Class)ReflectionUtils.invokeMethod(method, annotation);
        }

        static <T extends Annotation> String getServiceRootPath(T annotation, Class<T> clazz) {
            Method method = ReflectionUtils.findMethod(clazz, "serviceRootPath");
            return (String)ReflectionUtils.invokeMethod(method, annotation);
        }
    }

    private static class AnnotationInfo {
        Class interfaceClazz;
        String instanceName;
        String version;
        String rootPath;
        String serviceType;

        String getInterfaceName() {
            return interfaceClazz.getCanonicalName();
        }

        String getIdentify() {
            return getInterfaceName() + ":" + version;
        }
    }
}
```


```java
@Slf4j
public class GatewayInvokePipeline implements GatewayInvoker, ApplicationContextAware {

    private static final OrderComparator INSTANCE = new OrderComparator();

    private AbstractGatewayContextHandler head;
    private AbstractGatewayContextHandler tail;

    private ApplicationContext context;
    private GatewayServiceDiscovery discovery;
    private GatewayProperties properties;
    private String applicationName;

    public GatewayInvokePipeline(String applicationName, GatewayServiceDiscovery serviceDiscovery, GatewayProperties gatewayProperties) {
        this.discovery = serviceDiscovery;
        this.properties = gatewayProperties;
        this.applicationName = applicationName;
        initBaseContextHandler(applicationName);
    }

    private void initBaseContextHandler(String applicationName) {
        tail = new TailContextHandler(applicationName);
        head = new HeadContextHandler(discovery);

        head.next = tail;
        head.tail = tail;

        tail.prev = head;
    }

    public void init() {
        initSpiContextHandler();
    }

    private void initSpiContextHandler() {
        ServiceLoader<GatewayContextHandler> loader = ServiceLoader.load(GatewayContextHandler.class);
        List<GatewayContextHandler> handlers = Lists.newArrayList(loader).stream()
                .filter(h -> discovery.matchHandleType(h.handleType())).collect(Collectors.toList());
        handlers.stream().filter(h -> h instanceof ApplicationContextAware)
                .forEach(h -> ((ApplicationContextAware)h).setApplicationContext(context));
        handlers.forEach(h -> h.initContextHandler(properties));
        handlers.sort(INSTANCE);
        addLast(handlers);
    }

    private void addLast(AbstractGatewayContextHandler newCtx) {
        AbstractGatewayContextHandler prev = tail.prev;
        newCtx.prev = prev;
        newCtx.next = tail;
        newCtx.tail = tail;
        prev.next = newCtx;
        tail.prev = newCtx;
    }

    private void addLast(List<GatewayContextHandler> newCtxList) {
        for(GatewayContextHandler newCtx : newCtxList) {
            AbstractGatewayContextHandler handler = (AbstractGatewayContextHandler)newCtx;
            addLast(handler);

            if(log.isDebugEnabled())
                log.debug("[GatewayInvokePipeline]Add GatewayContextHandler: {}", handler.name());
        }
    }

    @Override
    public void fireGatewayInvoke(GatewayInvokeContext context) {
        context.setApplicationName(this.applicationName);
        head.fireGatewayInvoke(context);
    }

    @Override
    public void setApplicationContext(ApplicationContext context) throws BeansException {
        this.context = context;
    }
}

```

```java
public class GatewayServiceRouter {

    private Map<String, GatewayServiceGroup> serviceGroupMap = new ConcurrentHashMap<>();

    public GatewayMethodDefinition getMethodDefinition(String uri) {
        String key = uri.split("/")[1];
        if(serviceGroupMap.containsKey(key))
            return serviceGroupMap.get(key).getMethodDefinition(uri);
        return null;
    }

    void putMethodDefinition(GatewayMethodDefinition methodDefinition) {
        String rootPath = methodDefinition.getRootPath();
        if(serviceGroupMap.containsKey(rootPath)) {
            serviceGroupMap.get(rootPath).putMethodDefinition(methodDefinition);
        } else {
            GatewayServiceGroup serviceGroup = new GatewayServiceGroup();
            serviceGroup.putMethodDefinition(methodDefinition);
            serviceGroupMap.put(rootPath, serviceGroup);
        }
    }

    public List<String> getRootPaths() {
        return new ArrayList<>(serviceGroupMap.keySet());
    }

    public GatewayServiceGroup getGatewayServiceGroup(String rootPath) {
        return serviceGroupMap.get(rootPath);
    }
}
```


```java
public class GatewayServiceGroup {

    private Map<String, GatewayMethodDefinition> methodDefinitionMap = new ConcurrentHashMap<>();

    GatewayMethodDefinition getMethodDefinition(String uri) {
        return methodDefinitionMap.get(uri);
    }

    void putMethodDefinition(GatewayMethodDefinition methodDefinition) {
        for(String path : methodDefinition.getRequestPath()) {
            methodDefinitionMap.put("/" + methodDefinition.getRootPath() + path, methodDefinition);
        }
    }

    public Collection<GatewayMethodDefinition> getAllGatewayMethodDefinition() {
        return methodDefinitionMap.values();
    }
}

@Data
public class GatewayMethodDefinition {

    private String identify;
    private String serviceType;
    private String rootPath;
    private ApiConfig apiConfig;
    private Method method;
    private Object invoker;
    private boolean recordResponseBody = false;

    public List<String> getRequestPath() {
        return apiConfig.getPath();
    }

    public String getMDIdentify() {
        return identify + ":" + method.getName();
    }

    public FlowControlRule getFlowControlRule() {
        return apiConfig.getFlowControlRule();
    }
}
```


```java
@Slf4j
public class GatewayDispatcher implements HttpRequestHandler {

    private GatewayInvokePipeline gatewayInvokePipeline;

    public GatewayDispatcher(GatewayInvokePipeline gatewayInvokePipeline) {
        this.gatewayInvokePipeline = gatewayInvokePipeline;
    }

    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            // 强制用BLM-TraceId代替鹰眼的traceId, 前提是traceId满足鹰眼规则
            String blmTraceId = request.getHeader("BLM-TraceId");
            if (org.apache.commons.lang3.StringUtils.isNotEmpty(blmTraceId)) {
                Map<String, String> userDataMap = BlmTrace.getUserDataMap();
                if (userDataMap != null && !userDataMap.isEmpty()) {
                    userDataMap = new HashMap<>(userDataMap);
                }
                BlmTrace.endTrace();
                BlmTrace.startTrace(blmTraceId, "blm-gateway");
                if (userDataMap != null) {
                    userDataMap.forEach(BlmTrace::putUserData);
                }
            }

            String userAgent = request.getHeader("user-agent");
            BlmTrace.putUserData(GatewayCheckedLogData.USER_AGENT_KEY,userAgent);
            gatewayInvokePipeline.fireGatewayInvoke(new GatewayInvokeContext(request, response));
        }finally {

        }
    }
}
```


```java
public class SimpleUrlHandlerMapping extends AbstractUrlHandlerMapping {

	private final Map<String, Object> urlMap = new LinkedHashMap<String, Object>();

	public void setMappings(Properties mappings) {
		CollectionUtils.mergePropertiesIntoMap(mappings, this.urlMap);
	}

	public void setUrlMap(Map<String, ?> urlMap) {
		this.urlMap.putAll(urlMap);
	}

	public Map<String, ?> getUrlMap() {
		return this.urlMap;
	}

	@Override
	public void initApplicationContext() throws BeansException {
		super.initApplicationContext();
		registerHandlers(this.urlMap);
	}

	protected void registerHandlers(Map<String, Object> urlMap) throws BeansException {
		if (urlMap.isEmpty()) {
			logger.warn("Neither 'urlMap' nor 'mappings' set on SimpleUrlHandlerMapping");
		}
		else {
			for (Map.Entry<String, Object> entry : urlMap.entrySet()) {
				String url = entry.getKey();
				Object handler = entry.getValue();
				// Prepend with slash if not already present.
				if (!url.startsWith("/")) {
					url = "/" + url;
				}
				// Remove whitespace from handler bean name.
				if (handler instanceof String) {
					handler = ((String) handler).trim();
				}
				registerHandler(url, handler);
			}
		}
	}

}
```



Spring提供的HttpRequestHandler接口用于用于处理HTTP接口，该接口与HttpServlet等价，其只有一个没有返回值的handleRequest(HttpServletRequest request, HttpServletResponse response)方法；
可以通过与org.springframework.web.context.support.HttpRequestHandlerServlet类来配合使用，使其可以脱离与DispatcherServlet的依赖，配置一个极简的请求处理程序。
可以与DispatcherServlet集成，将HttpRequestHandler接口的具体实现类作为和我们常用的controller同级别的处理程序使用。

HttpRequestHandler

```java
public interface HttpRequestHandler {
	void handleRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException;
}
```

HttpRequestHandlerServlet

```java
public class HttpRequestHandlerServlet extends HttpServlet {

	private HttpRequestHandler target;


	@Override
	public void init() throws ServletException {
		WebApplicationContext wac = WebApplicationContextUtils.getRequiredWebApplicationContext(getServletContext());
		this.target = wac.getBean(getServletName(), HttpRequestHandler.class);
	}


	@Override
	protected void service(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		LocaleContextHolder.setLocale(request.getLocale());
		try {
			this.target.handleRequest(request, response);
		}
		catch (HttpRequestMethodNotSupportedException ex) {
			String[] supportedMethods = ex.getSupportedMethods();
			if (supportedMethods != null) {
				response.setHeader("Allow", StringUtils.arrayToDelimitedString(supportedMethods, ", "));
			}
			response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, ex.getMessage());
		}
		finally {
			LocaleContextHolder.resetLocaleContext();
		}
	}

}
```

```xml
    <!--配置HttpRequestHandlerServlet-->
    <servlet>
	    <!--注意serlvetName必须和Spring容器中的某个HttpRequestHandler的Bean名称一致-->
        <servlet-name>helloWorld</servlet-name>
        <servlet-class>org.springframework.web.context.support.HttpRequestHandlerServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>helloWorld</servlet-name>
        <url-pattern>/helloWorld</url-pattern>
    </servlet-mapping>
    <servlet>
	    <!--注意serlvetName必须和Spring容器中的某个HttpRequestHandler的Bean名称一致-->
        <servlet-name>helloWorld2</servlet-name>
        <servlet-class>org.springframework.web.context.support.HttpRequestHandlerServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>helloWorld2</servlet-name>
        <url-pattern>/helloWorld2</url-pattern>
    </servlet-mapping>
```

参考
https://blog.csdn.net/f641385712/article/details/89845181




```java
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
@Service
public @interface GatewayApiService {
    Class<?> serviceInterface();
    String serviceVersion() default "";
    String serviceRootPath() default "api";
}

private static class AnnotationHelper {
    // T 注解对象
    // Class<T> 注解的Class对象
    static <T extends Annotation> AnnotationInfo getAnnotationInfo(T annotation, String beanName, Class<T> clazz) {
        AnnotationInfo info = new AnnotationInfo();
        info.serviceType = clazz.getSimpleName();
        info.instanceName = beanName;
        info.interfaceClazz = AnnotationHelper.getServiceInterface(annotation, clazz);
        info.version = AnnotationHelper.getServiceVersion(annotation, clazz);
        info.rootPath = AnnotationHelper.getServiceRootPath(annotation, clazz);
        info.rootPath = info.rootPath.endsWith("/") ? info.rootPath.substring(0, info.rootPath.length() - 2) : info.rootPath;
        return info;
    }

    static <T extends Annotation> String getServiceVersion(T annotation, Class<T> clazz) {
        Method method = ReflectionUtils.findMethod(clazz, "serviceVersion");
        return (String)ReflectionUtils.invokeMethod(method, annotation);
    }

    static <T extends Annotation> Class getServiceInterface(T annotation, Class<T> clazz) {
        Method method = ReflectionUtils.findMethod(clazz, "serviceInterface");
        return (Class)ReflectionUtils.invokeMethod(method, annotation);
    }

    static <T extends Annotation> String getServiceRootPath(T annotation, Class<T> clazz) {
        Method method = ReflectionUtils.findMethod(clazz, "serviceRootPath");
        return (String)ReflectionUtils.invokeMethod(method, annotation);
    }
}
```


```java
selectMethods(Class<?> targetType, final ReflectionUtils.MethodFilter methodFilter)
Set<Method> methods = MethodIntrospector.selectMethods(info.interfaceClazz,
    (ReflectionUtils.MethodFilter) 
        method ->   checkGatewayApiConfig(info, methodConfig, method)
                        && saveGatewayApiDefinition(info, methodConfig, bean, method, serviceConfig.isRecordResponseBody()));
根据方法过滤取得到类上所有的方法列表
如果是 CGLIB 生成的子类，则返回原始类的方法对象
    private Method transGatewayMethod(Object bean, Method method) {
        try {
            Class<?> userType = ClassUtils.getUserClass(bean.getClass());
            return userType.getMethod(method.getName(), method.getParameterTypes());
        } catch (NoSuchMethodException e) {
            return null;
        }
    }
```



GatewayServiceDiscovery
1、遍历注解
2、获取标注了注解的beanNames
3、遍历beanNames得到Bean
4、获取Class【代理类但如果是 CGLIB 生成的子类，则返回原始类。getUserClass】
如何获取类上标注的注解对象
    Class<?> userType = ClassUtils.getUserClass(bean.getClass());
    T gatewayService = AnnotationUtils.findAnnotation(userType, clazz);
5、每一个方法对象且带有多个URL的定义
GatewayMethodDefinition definition = new GatewayMethodDefinition();
definition.setIdentify(info.getIdentify());//接口名
definition.setServiceType(info.serviceType);
definition.setRootPath(rootPath);
definition.setInvoker(bean);//因为是复合注解所以可以获取bean
definition.setMethod(targetMethod);
definition.setRecordResponseBody(recordResponseBody);
apiConfig.setPath(Arrays.asList(methodMapping.path()));
definition.setApiConfig(normalizeApiConfigPath(apiConfig));

司机ID和订单ID
driver_road_exam_question_record
driver_road_exam_question_record


YUEYUE_ORDER_ROAD_EXAM_FULL


DISPOSE_TASK_EVENT_TRANSFER