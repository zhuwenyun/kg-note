


```java
	private static final TemplateParserContext PARSER_CONTEXT = new TemplateParserContext();

	private static final SpelExpressionParser PARSER = new SpelExpressionParser();

	private final StandardEvaluationContext evaluationContext = new StandardEvaluationContext();

    private BeanFactory beanFactory;

    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		this.beanFactory = beanFactory;
		this.evaluationContext.setBeanResolver(new BeanFactoryResolver(beanFactory));
	}

	private String resolve(String value) {
		if (this.beanFactory != null && this.beanFactory instanceof ConfigurableBeanFactory) {
			return ((ConfigurableBeanFactory) this.beanFactory).resolveEmbeddedValue(value);
		}
		return value;
	}

    maxAttempts = PARSER.parseExpression(
                    resolve(maxAttemptsExpression), 
                    PARSER_CONTEXT
                ).getValue(this.evaluationContext, Integer.class);


```

