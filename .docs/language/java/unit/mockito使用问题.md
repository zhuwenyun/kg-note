
错误1：
When using matchers, all arguments have to be provided by matchers.
原因：
从异常的信息来看，显然违反了一个Mockito框架中的Matchers匹配参数的规则。根据Matchers文档如下，在打桩阶段有一个原则，一个mock对象的方法，如果其若干个参数中，有一个是通过Matchers提供的，则该方法的所有参数都必须通过Matchers提供。而不能是有的参数通过Matchers提供，有的参数直接给出真实的具体值。
解决方法：
将打桩方法都用具体值或者都使用matcher。

错误2：
The used MockMaker SubclassByteBuddyMockMaker does not support the creation of static mocks
Mockito's inline mock maker supports static mocks based on the Instrumentation API.
You can simply enable this mock mode, by placing the 'mockito-inline' artifact where you are currently using 'mockito-core'.
Note that Mockito's inline mock maker is not supported on Android.
在实际工作当中，我们经常会遇到需要对静态方法进行 mock 的情况。在 mockito 2.x 的时代，我们需要借助 powmock 才能实现。当 mockito 进化到了 3.4.0 版本以后，也开始对静态方法 mock 进行了支持（主要是通过 mockito-inline 包）。
org.mockito:mockito-inline:3.7.7

静态方法打桩：
Mockito.mockStatic(ConfigReader.class);
Mockito.when(ConfigReader.getProperty(“config”, “value”)).thenReturn(“false”);


