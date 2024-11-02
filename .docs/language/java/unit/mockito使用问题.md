
错误1：
When using matchers, all arguments have to be provided by matchers.
原因：
从异常的信息来看，显然违反了一个Mockito框架中的Matchers匹配参数的规则。根据Matchers文档如下，在打桩阶段有一个原则，一个mock对象的方法，如果其若干个参数中，有一个是通过Matchers提供的，则该方法的所有参数都必须通过Matchers提供。而不能是有的参数通过Matchers提供，有的参数直接给出真实的具体值。
解决方法：
将打桩方法都用具体值或者都使用matcher。

错误2：
静态方法打桩：
Mockito.mockStatic(ConfigReader.class);
Mockito.when(ConfigReader.getProperty(“config”, “value”)).thenReturn(“false”);