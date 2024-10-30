

## 如何定义组件？
当使用构建步骤时，我们一般会将 Vue 组件定义在一个单独的 .vue 文件中，这被叫做单文件组件 (简称 SFC)：
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">You clicked me {{ count }} times.</button>
</template>
```
当不使用构建步骤时，一个 Vue 组件以一个包含 Vue 特定选项的 JavaScript 对象来定义：
```javascript
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `
    <button @click="count++">
      You clicked me {{ count }} times.
    </button>`
  // 也可以针对一个 DOM 内联模板：
  // template: '#my-template-element'
}
```


## 如何使用组件？
### 局部注册
要使用一个子组件，我们需要在父组件中导入它。假设我们把计数器组件放在了一个叫做 ButtonCounter.vue 的文件中，这个组件将会以默认导出的形式被暴露给外部。
```vue
<script setup>
import ButtonCounter from './ButtonCounter.vue'
</script>

<template>
  <h1>Here is a child component!</h1>
  <ButtonCounter />
</template>
```
如果没有使用 <script setup>，则需要使用 components 选项来显式注册：
对于每个 components 对象里的属性，它们的 key 名就是注册的组件名，而值就是相应组件的实现。上面的例子中使用的是 ES2015 的缩写语法，等价于：
```vue
import ComponentA from './ComponentA.js'

export default {
  components: {
    ComponentA
    //ComponentA: ComponentA
  },
  setup() {
    // ...
  }
}
```
通过 <script setup>，导入的组件都在模板中直接可用。
当然，你也可以全局地注册一个组件，使得它在当前应用中的任何组件上都可以使用，而不需要额外再导入。

### 全局注册

#### 定义组件加注册
```vue
import { createApp } from 'vue'

const app = createApp({})

app.component(
  // 注册的名字
  'MyComponent',
  // 组件的实现
  {
    /* ... */
  }
)
```
#### 注册已经定义好的组件
```vue
import MyComponent from './App.vue'

app.component('MyComponent', MyComponent)

// 支持链式调用
app
  .component('ComponentA', ComponentA)
  .component('ComponentB', ComponentB)
  .component('ComponentC', ComponentC)
```

## 组件使用
### 如何给组件传值？
#### 通过attribute
“透传 attribute”指的是传递给一个组件，却没有被该组件声明为 props 或 emits 的 attribute 或者 v-on 事件监听器。最常见的例子就是 class、style 和 id。


举例来说，假如我们有一个 <MyButton> 组件，它的模板长这样：
```
<!-- <MyButton> 的模板 -->
<button>Click Me</button>
```
一个父组件使用了这个组件，并且传入了 class：
```
<MyButton class="large" />
```
最后渲染出的 DOM 结果是：
```
<button class="large">Click Me</button>
```
这里，<MyButton> 并没有将 class 声明为一个它所接受的 prop，所以 class 被视作透传 attribute，自动透传到了 <MyButton> 的根元素上。

##### 对 class 和 style 的合并
如果一个子组件的根元素已经有了 class 或 style attribute，它会和从父组件上继承的值合并。如果我们将之前的 <MyButton> 组件的模板改成这样：
```
<!-- <MyButton> 的模板 -->
<button class="btn">Click Me</button>
```
则最后渲染出的 DOM 结果会变成：
```
<button class="btn large">Click Me</button>
```
##### v-on 监听器继承

```
<MyButton @click="onClick" />
```
click 监听器会被添加到 <MyButton> 的根元素，即那个原生的 <button> 元素之上。当原生的 <button> 被点击，会触发父组件的 onClick 方法。同样的，如果原生 button 元素自身也通过 v-on 绑定了一个事件监听器，则这个监听器和从父组件继承的监听器都会被触发。







#### 通过props
##### 组件定义props
使用setup方式定义props
```vue
<script setup>
const props = defineProps(['foo'])

console.log(props.foo)
</script>
```
使用普通方式定义props
```vue
export default {
  props: ['foo'],
  setup(props) {
    // setup() 接收 props 作为第一个参数
    console.log(props.foo)
  }
}
```

#### 给组件传值
```vue
<BlogPost title="My journey with Vue" />
<!-- 根据一个变量的值动态传入 -->
<BlogPost :title="post.title" />
<!-- 根据一个更复杂表达式的值动态传入 -->
<BlogPost :title="post.title + ' by ' + post.author.name" />

<BlogPost :likes="42" />
<!-- 仅写上 prop 但不传值，会隐式转换为 `true` -->
<BlogPost is-published />
<BlogPost :comment-ids="[234, 266, 273]" />
<BlogPost
  :author="{
    name: 'Veronica',
    company: 'Veridian Dynamics'
  }"
/>
const post = {
  id: 1,
  title: 'My Journey with Vue'
}
<BlogPost v-bind="post" />
<BlogPost :id="post.id" :title="post.title" />
```


如何一次生成多个组件列表？
组件内部采用循环的方式处理

