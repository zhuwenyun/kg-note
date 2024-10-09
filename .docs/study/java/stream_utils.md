

## 基础知识

### Predicate
Predicate 是java提供的函数式接口，入参是待判断对象，返回值是true表示保留。
```java
@FunctionalInterface
public interface Predicate<T> {

    boolean test(T t);

    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }

    default Predicate<T> negate() {
        return (t) -> !test(t);
    }

    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }

    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
}
```

### StreamSupport
StreamSupport 是java提供的创建流的帮助类，主要依赖Spliterator对象，Spliterator可以理解为
一个特殊的集合，它可以用来创建流。如果想将collection中集合转成Spliterator对象，仅需要调用Iterable对象的spliterator()方法可以得到。
```java
public final class StreamSupport {
    // 创建流对象，spliterator创建流对象的元素列表，parallel是否生成并行流
    public static <T> Stream<T> stream(Spliterator<T> spliterator, boolean parallel) {
        Objects.requireNonNull(spliterator);
        return new ReferencePipeline.Head<>(spliterator,
               StreamOpFlag.fromCharacteristics(spliterator),
               parallel);
    }
}
```

### Stream

#### reduce
reduce 操作是 Java Stream API 中的一个非常强大的工具，它主要用于将 Stream 中的元素组合起来，通过对每个元素应用某个操作，将其归约为一个单一的结果。这个过程可以类比为一个累加器，不断地将 Stream 中的元素进行累积，最终得到一个汇总的结果。

```java
import java.util.Arrays;
import java.util.List;

public class ReduceExample {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        int sum = numbers.stream()
                         .reduce(0, (a, b) -> a + b, (x, y) -> x + y);
        System.out.println("Sum: " + sum); // 输出：Sum: 15
    }
}

```


```java
public interface Stream<T> extends BaseStream<T, Stream<T>> {
    public static<T> Stream<T> of(T... values) {
        return Arrays.stream(values);
    }

    Optional<T> reduce(BinaryOperator<T> accumulator);
    T reduce(T identity, BinaryOperator<T> accumulator);
    <U> U reduce(U identity,
                 BiFunction<U, ? super T, U> accumulator,
                 BinaryOperator<U> combiner);
  
}
```




```java
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static com.zwy.Predicates.and;
import static com.zwy.Predicates.or;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

/**
 * The utilities class for {@link Stream}
 *
 */
public interface Streams {

    static <T, S extends Iterable<T>> Stream<T> filterStream(S values, Predicate<T> predicate) {
        return stream(values.spliterator(), false).filter(predicate);
    }

    static <T, S extends Iterable<T>> List<T> filterList(S values, Predicate<T> predicate) {
        return filterStream(values, predicate).collect(toList());
    }

    static <T, S extends Iterable<T>> Set<T> filterSet(S values, Predicate<T> predicate) {
        // new Set with insertion order
        return filterStream(values, predicate).collect(LinkedHashSet::new, Set::add, Set::addAll);
    }

    @SuppressWarnings("unchecked")
    static <T, S extends Iterable<T>> S filter(S values, Predicate<T> predicate) {
        final boolean isSet = Set.class.isAssignableFrom(values.getClass());
        return (S) (isSet ? filterSet(values, predicate) : filterList(values, predicate));
    }

    @SafeVarargs
    static <T, S extends Iterable<T>> S filterAll(S values, Predicate<T>... predicates) {
        return filter(values, and(predicates));
    }

    @SafeVarargs
    static <T, S extends Iterable<T>> S filterAny(S values, Predicate<T>... predicates) {
        return filter(values, or(predicates));
    }

    @SafeVarargs
    static <T> T filterFirst(Iterable<T> values, Predicate<T>... predicates) {
        return stream(values.spliterator(), false)
        .filter(and(predicates))
        .findFirst()
        .orElse(null);
    }
}
```

```java
import java.util.function.Predicate;

import static java.util.stream.Stream.of;

/**
 * The utilities class for Java {@link Predicate}
 */
public interface Predicates {

    Predicate[] EMPTY_ARRAY = new Predicate[0];

    /**
     * {@link Predicate} always return <code>true</code>
     *
     * @param <T> the type to test
     * @return <code>true</code>
     */
    static <T> Predicate<T> alwaysTrue() {
        return e -> true;
    }

    /**
     * {@link Predicate} always return <code>false</code>
     *
     * @param <T> the type to test
     * @return <code>false</code>
     */
    static <T> Predicate<T> alwaysFalse() {
        return e -> false;
    }

    /**
     * a composed predicate that represents a short-circuiting logical AND of {@link Predicate predicates}
     *
     * @param predicates {@link Predicate predicates}
     * @param <T>        the type to test
     * @return non-null
     */
    static <T> Predicate<T> and(Predicate<T>... predicates) {
        return of(predicates).reduce((a, b) -> a.and(b)).orElseGet(Predicates::alwaysTrue);
    }

    /**
     * a composed predicate that represents a short-circuiting logical OR of {@link Predicate predicates}
     *
     * @param predicates {@link Predicate predicates}
     * @param <T>        the detected type
     * @return non-null
     */
    static <T> Predicate<T> or(Predicate<T>... predicates) {
        return of(predicates).reduce((a, b) -> a.or(b)).orElse(e -> true);
    }

}
```

```java
@FunctionalInterface
public interface Predicate<T> {

    boolean test(T t);

    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }

    default Predicate<T> negate() {
        return (t) -> !test(t);
    }

    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }

    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
}
```
