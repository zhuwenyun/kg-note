import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
// https://vitepress.dev/zh/reference/site-config
export default withMermaid({
  title: "My Awesome Project",
  description: "A VitePress Site",
  // base: '/kg-note/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      {
        text: 'test',
        items: [
          { text: 'nums', link: '/item-1' },
          { text: 'reasoning', link: '/reasoning/logic_support' },
          { text: 'speech', link: '/speech/sort' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Examples111',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'reasoning',
        collapsed: true,
        items: [
          { text: '逻辑加强', link: '/reasoning/logic_support' },
          { text: '数量论证', link: '/reasoning/logic_num' },
        ]
      },
      {
        text: 'speech',
        collapsed: true,
        items: [
          { text: '语句排序', link: '/speech/sort' },
          { text: '标题拟定', link: '/speech/select_title' },
          { text: '下文推断', link: '/speech/select_next_article' },
        ]
      },
      {
        text: 'Level 1',
        collapsed: true,
        items: [
          {
            text: 'Level 2',
            items: [
              {
                text: 'Level 3',
                items: [
                ]
              }
            ]
          }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    search: {
      provider: 'algolia',
      options: {
        appId: '111',
        apiKey: '111',
        indexName: '111',
        locales: {
          zh: {
            placeholder: '搜索文档',
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                searchBox: {
                  resetButtonTitle: '清除查询条件',
                  resetButtonAriaLabel: '清除查询条件',
                  cancelButtonText: '取消',
                  cancelButtonAriaLabel: '取消'
                },
                startScreen: {
                  recentSearchesTitle: '搜索历史',
                  noRecentSearchesText: '没有搜索历史',
                  saveRecentSearchButtonTitle: '保存至搜索历史',
                  removeRecentSearchButtonTitle: '从搜索历史中移除',
                  favoriteSearchesTitle: '收藏',
                  removeFavoriteSearchButtonTitle: '从收藏中移除'
                },
                errorScreen: {
                  titleText: '无法获取结果',
                  helpText: '你可能需要检查你的网络连接'
                },
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                  searchByText: '搜索提供者'
                },
                noResultsScreen: {
                  noResultsText: '无法找到相关结果',
                  suggestedQueryText: '你可以尝试查询',
                  reportMissingResultsText: '你认为该查询应该有结果？',
                  reportMissingResultsLinkText: '点击反馈'
                }
              }
            }
          }
        }
      }
    }
  },
  
  mermaid: {
  },
  mermaidPlugin: {
  }
})
