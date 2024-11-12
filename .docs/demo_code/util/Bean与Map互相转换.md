

## 反射
### 原生反射
```java
public static Map<String, Object> bean2Map2(Object object) {
    Map<String, Object> map = new HashMap<>();
    Class<?> clazz = object.getClass();
    Field[] fields = clazz.getDeclaredFields();
    for (Field field : fields) {
        field.setAccessible(true);
        try {
            Object value = field.get(object);
            if (value != null) {
                map.put(field.getName(), value);
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException("Error accessing field: " + field.getName(), e);
        }
    }
    return map;
}

public static <T> T map2Bean2(Map<String, Object> map, Class<T> clazz) throws IllegalAccessException, InstantiationException {
    T instance = clazz.newInstance();
    Field[] fields = clazz.getDeclaredFields();
    for (Field field : fields) {
        field.setAccessible(true);
        if (map.containsKey(field.getName())) {
            field.set(instance, map.get(field.getName()));
        }
    }
    return instance;
}
```

### ReflectionUtils
```java
public static Map<String, Object> bean2Map(Object object) {
    Map<String, Object> map = new HashMap<>();
    ReflectionUtils.doWithFields(object.getClass(), field -> {
        field.setAccessible(true);
        Object value = ReflectionUtils.getField(field, object);
        if (value != null) {
            map.put(field.getName(), value);
        }
    });
    return map;
}


public static <T> T map2Bean(Map<String, Object> map, Class<T> clazz) throws IllegalAccessException, InstantiationException {
    T instance = clazz.newInstance();
    ReflectionUtils.doWithFields(clazz, field -> {
        field.setAccessible(true);
        if (map.containsKey(field.getName())) {
            ReflectionUtils.setField(field, instance, map.get(field.getName()));
        }
    });
    return instance;
}
```


## Jackson

```java
public static Map<String, Object> bean2Map(Object object) {
        ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(object, new TypeReference<Map<String, Object>>() {
    });
}

public static <T> T map2Bean(Map<String, Object> map, Class<T> clazz){
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.convertValue(map, clazz);
}
```

## fastjson

```java
Map<String,Object> map = JSONObject.parseObject(JSONObject.toJSONString(person))

Person person = JSONObject.parseObject(JSONObject.toJSONString(map), Person.class)
```


## lang3下BeanUtils
```java
public static Map<String, String> bean2Map(Object object) {
    try {
        return BeanUtils.describe(object);
    } catch (Exception e) {
        throw new RuntimeException("Error converting object to map: " + e.getMessage(), e);
    }
}

public static <T> T map2Bean(Map<String, ?> map, Class<T> clazz) {
    try {
        T instance = clazz.newInstance();
        BeanUtils.populate(instance, map);
        return instance;
    } catch (Exception e) {
        throw new RuntimeException("Error converting map to object: " + e.getMessage(), e);
    }
}
```
