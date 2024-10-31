---
outline: deep
---

https://github.com/tiantiangao/guava-study/blob/master/doc/collections-utility-classes.md


## 集合基础
### ‌LinkedHashSet与TreeSet的区别？
‌LinkedHashSet 能保证元素的插入顺序
TreeSet 能保证元素按照定义的比较器排序

### ‌LinkedHashMap与TreeMap的区别？
‌LinkedHashMap 能保证key的插入顺序，至于value是随机的。
TreeMap 能保证key的插入按照定义的比较器排序，value和key是一组所以也是随机的。



## 集合工具类
### Lists
```java
// 创建 ArrayList
Lists.newArrayList();  
Lists.newArrayList(1, 2, 3);  
Lists.newArrayList(Sets.newHashSet(1, 2, 3));  
Lists.newArrayListWithCapacity(10);  
Lists.newArrayListWithExpectedSize(10);
// 创建 LinkedList
Lists.newLinkedList();
Lists.newLinkedList(Sets.newHashSet(1, 2, 3));

// 集合分区 
Lists.partition(Lists.newArrayList(1, 2, 3, 4, 5), 2);

Lists.reverse(Lists.newArrayList(1, 2, 3, 4, 5));
```

### Sets
```java
// 创建 HashSet
Sets.newHashSet();  
Sets.newHashSet(1, 2, 3);  
Sets.newHashSetWithExpectedSize(10);  
Sets.newHashSet(Lists.newArrayList(1, 2, 3));  
// 创建 LinkedHashSet
Sets.newLinkedHashSet();  
Sets.newLinkedHashSetWithExpectedSize(10);  
Sets.newLinkedHashSet(Lists.newArrayList(1, 2, 3));  
// 创建 TreeSet
Sets.newTreeSet();  
Sets.newTreeSet(Lists.newArrayList(1, 2, 3));  
Sets.newTreeSet(Ordering.natural());  

// 集合运算(返回SetView)  
Sets.union(Sets.newHashSet(1, 2, 3), Sets.newHashSet(4, 5, 6)); // 取并集[1,2,3,4,5,6]  
Sets.intersection(Sets.newHashSet(1, 2, 3), Sets.newHashSet(3, 4, 5)); // 取交集[3]  
Sets.difference(Sets.newHashSet(1, 2, 3), Sets.newHashSet(3, 4, 5)); // 只在set1, 不在set2[1,2]  
Sets.symmetricDifference(Sets.newHashSet(1, 2, 3), Sets.newHashSet(3, 4, 5)); // 交集取反[1,2,4,5]  

// 其他工具方法  
Sets.cartesianProduct(
    Lists.newArrayList(Sets.newHashSet(1, 2), Sets.newHashSet(3, 4))
); // 返回所有集合的笛卡尔积

Sets.powerSet(Sets.newHashSet(1, 2, 3)); // 返回给定集合的所有子集
```

### Maps
#### uniqueIndex
索引对应的值要求唯一
```java
ImmutableMap<Integer, String> stringsByIndex = Maps.uniqueIndex(strings, new Function<String, Integer> () {
    public Integer apply(String string) {
        return string.length();
    }
});
```
#### difference
```java
Map<String, Integer> left = ImmutableMap.of("a", 1, "b", 2, "c", 3);
Map<String, Integer> right = ImmutableMap.of("b", 2, "c", 4, "d", 5);
MapDifference<String, Integer> diff = Maps.difference(left, right);

diff.entriesInCommon(); // {"b" => 2}, 两个Map中都有的映射项，包括键与值
diff.entriesDiffering(); // {"c" => (3, 4)}, 键相同但是值不同的映射项。  
diff.entriesOnlyOnLeft(); // {"a" => 1}, 键只存在于左边Map的映射项
diff.entriesOnlyOnRight(); // {"d" => 5}, 键只存在于右边Map的映射项
```


### Multisets

```java
containsOccurrences(Multiset sup, Multiset sub); //对任意o，如果sub.count(o)<=super.count(o)，返回true  
removeOccurrences(Multiset removeFrom, Multiset toRemove); //对toRemove中的重复元素，仅在removeFrom中删除相同个数  
retainOccurrences(Multiset removeFrom, Multiset toRetain); //修改removeFrom，以保证任意o都符合removeFrom.count(o)<=toRetain.count(o)  
intersection(Multiset, Multiset); //返回两个multiset的交集  
copyHighestCountFirst(Multiset); //返回Multiset的不可变拷贝，并将元素按重复出现的次数做降序排列  
unmodifiableMultiset(Multiset); //返回Multiset的只读视图  
unmodifiableSortedMultiset(SortedMultiset); //返回SortedMultiset的只读视图  
```

### Multimaps
#### index
作为Maps.uniqueIndex的兄弟方法，Multimaps.index(Iterable, Function)通常针对的场景是：有一组对象，它们有共同的特定属性，我们希望按照这个属性的值查询对象，但属性值不一定是独一无二的。

```java

```

#### invertFrom
鉴于Multimap可以把多个键映射到同一个值，也可以把一个键映射到多个值，反转Multimap也会很有用。Guava 提供了invertFrom(Multimap toInvert, Multimap dest)做这个操作，并且你可以自由选择反转后的Multimap实现。

```java
TreeMultimap<Integer, String> inverse = Multimaps.invertFrom(multimap, TreeMultimap<String, Integer>.create());
```

#### forMap
forMap方法把Map包装成SetMultimap, 与Multimaps.invertFrom结合使用，可以把多对一的Map反转为一对多的Multimap。
```java
Map<String, Integer> map = ImmutableMap.of("a", 1, "b", 1, "c", 2);  
SetMultimap<String, Integer> multimap = Multimaps.forMap(map);  
// multimap maps ["a" => {1}, "b" => {1}, "c" => {2}]  
Multimap<Integer, String> inverse = Multimaps.invertFrom(multimap, HashMultimap.<Integer, String> create());  
// inverse maps [1 => {"a", "b"}, 2 => {"c"}]
```

### Tables
::: danger
‌Guava的Tables是一种特殊的数据结构，它允许使用两个键（行键和列键）来映射一个值，可以视为一个二维的Map‌。
‌实现类‌：Guava提供了几种Tables的实现类，包括HashBasedTable、TreeBasedTable和ImmutableTable，每种都有其特定的用途和性能特点。
‌使用方式‌：可以通过创建Tables实例、向其添加数据、检索数据、修改数据、遍历数据等方式来使用Guava Tables。
:::

```java
import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Table;

public class TablesExample {
    public static void main(String[] args) {
        // 创建一个HashBasedTable实例
        Table<String, String, Integer> scores = HashBasedTable.create();

        // 向表中添加数据
        scores.put("Alice", "Math", 90);
        scores.put("Alice", "English", 85);
        scores.put("Bob", "Math", 88);
        scores.put("Bob", "English", 92);

        // 从表中检索数据
        System.out.println("Alice's Math score: " + scores.get("Alice", "Math"));
        System.out.println("Bob's English score: " + scores.get("Bob", "English"));

        // 遍历表中的所有数据
        for (Table.Cell<String, String, Integer> cell : scores.cellSet()) {
            System.out.println(cell.getRowKey() + " " + cell.getColumnKey() + ": " + cell.getValue());
        }

        // 遍历某一行的所有数据
        for (Integer score : scores.row("Alice").values()) {
            System.out.println("Alice's score: " + score);
        }

        // 遍历某一列的所有数据
        for (Integer score : scores.column("English").values()) {
            System.out.println("English score: " + score);
        }

        // 交换行键和列键
        Table<String, String, Integer> transposedScores = Tables.transpose(scores);

        // 输出交换后的表
        for (Table.Cell<String, String, Integer> cell : transposedScores.cellSet()) {
            System.out.println(cell.getRowKey() + " " + cell.getColumnKey() + ": " + cell.getValue());
        }
    }
}
```

#### customTable
Tables.newCustomTable(Map, Supplier)允许你指定Table用什么样的map实现行和列。
```java
// use LinkedHashMaps instead of HashMaps
Table<String, Character, Integer> table = Tables.newCustomTable(
    Maps.<String, Map<Character, Integer>>newLinkedHashMap(),
    new Supplier<Map<Character, Integer>> () {
        public Map<Character, Integer> get() {
            return Maps.newLinkedHashMap();
        }
    }
);

public static <R, C, V> Table<R, C, V> newCustomTable(
    Map<R, Map<C, V>> backingMap, 
    org.apache.curator.shaded.com.google.common.base.Supplier<? extends Map<C, V>> factory
) 
    
```

#### transpose
```java
transpose(Table<R, C, V>)方法允许你把Table<C, R, V>转置成Table<R, C, V>。例如，如果你在用Table构建加权有向图，这个方法就可以把有向图反转。

```



## Throwables
String getStackTraceAsString(Throwable)  


## Ordering
Ordering是Guava类库提供的一个犀利强大的比较器工具，Guava的Ordering和JDK Comparator相比功能更强。它非常容易扩展，可以轻松构造复杂的comparator，然后用在容器的比较、排序等操作中。

```java
Ordering.natural();                  // 使用Comparable类型的自然顺序， 例如：整数从小到大，字符串是按字典顺序;  
Ordering.usingToString();            // 使用toString()返回的字符串按字典顺序进行排序；
Ordering.from(Comparator);           // 将Comparator转换为Ordering
new Ordering<T>(){                   // 或者直接构建一个Ordering对象，并实现compare方法
	public int compare(T left, T right){}
}
```
实例方法(支持链式)
com.google.common.collect.Ordering

```java
reverse();                            //返回与当前Ordering相反的排序   
nullsFirst();                         //返回一个将null放在non-null元素之前的Ordering，其他的和原始的Ordering一样  
nullsLast();                          //返回一个将null放在non-null元素之后的Ordering，其他的和原始的Ordering一样  
compound(Comparator);                 //返回一个使用Comparator的Ordering，Comparator作为第二排序元素  
lexicographical();                    //返回一个按照字典元素迭代的Ordering  
onResultOf(Function);                 //将function应用在各个元素上之后, 在使用原始ordering进行排序  
greatestOf(Iterable iterable, int k); //返回指定的前k个可迭代的最大的元素，按照当前Ordering从最大到最小的顺序  
leastOf(Iterable iterable, int k);    //返回指定的前k个可迭代的最小的元素，按照当前Ordering从最小到最大的顺序  
isOrdered(Iterable);                  //是否有序(前面的元素可以大于或等于后面的元素)，Iterable不能少于2个元素
isStrictlyOrdered(Iterable);          //是否严格有序(前面的元素必须大于后面的元素)，Iterable不能少于两个元素  
sortedCopy(Iterable);                 //返回指定的元素作为一个列表的排序副本

        // 将Ordering转换为Comparator
        Comparator<String> comparator = ordering.comparator();
```