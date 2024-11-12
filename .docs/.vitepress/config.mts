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
        text: '历年真题',
        items: [
          {
            text: '国家',
            items: [
              {
                text: '2008',
                link: '/xingce/zhenti/guojia/2008'
              }
            ]
          }
        ]
      }
    ],

    sidebar: [
      {
        text: '历年',
        collapsed: true,
        items: [
          { 
            text: '国家',
            items:[
              { text: '2008', link: '/xingce/zhenti/guojia/2008' },
              { text: '2009', link: '/xingce/zhenti/guojia/2009' },
              { text: '2010', link: '/xingce/zhenti/guojia/2010' },
              { text: '2011', link: '/xingce/zhenti/guojia/2011' },
              { text: '2012', link: '/xingce/zhenti/guojia/2012' },
              { text: '2013', link: '/xingce/zhenti/guojia/2013' },
              { text: '2014', link: '/xingce/zhenti/guojia/2014' },
              { text: '2015', link: '/xingce/zhenti/guojia/2015' },
              { text: '2016', link: '/xingce/zhenti/guojia/2016' },
              { text: '2017', link: '/xingce/zhenti/guojia/2017' },
              { text: '2018', link: '/xingce/zhenti/guojia/2018' },
              { text: '2019', link: '/xingce/zhenti/guojia/2019' },
              { text: '2020', link: '/xingce/zhenti/guojia/2020' },
              { text: '2021', link: '/xingce/zhenti/guojia/2021' },
              { text: '2022', link: '/xingce/zhenti/guojia/2022' },
              { text: '2023', link: '/xingce/zhenti/guojia/2023' },
              { text: '2024', link: '/xingce/zhenti/guojia/2024' },
            ]
          },
          { 
            text: '湖北',
            items:[
              { text: '2008', link: '/xingce/panduantuili/leibituili/zhenti/2008/test' },
            ]
          },
        ]
      },
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
          { text: '翻译推理', link: '/reasoning/translate' },
          { text: '分析推理', link: '/reasoning/analysis' },
        ]
      },
      {
        text: 'speech',
        collapsed: true,
        items: [
          { text: '语句排序', link: '/speech/sort' },
          { text: '标题拟定', link: '/speech/select_title' },
          { text: '下文推断', link: '/speech/select_next_article' },
          { text: '结构分析', link: '/speech/jiegou' },
          { text: '逻辑填空', link: '/speech/logic_fill_in' },
          { text: '逻辑填空2', link: '/speech/logic_fill_in2' },
        ]
      },
      {
        text: 'nums',
        collapsed: true,
        items: [
          { text: '和差倍比和方程法', link: '/nums/和差倍比和方程法' },
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

  },

  mermaid: {
  },
  mermaidPlugin: {
  },

  markdown:{
    math: true
  }
})
