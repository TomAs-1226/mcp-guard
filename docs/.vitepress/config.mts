import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'mcp-guard',
  description: 'Security auditing and policy gating for MCP servers',
  base: '/MCP-doctor/',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#101827' }],
    ['meta', { property: 'og:title', content: 'mcp-guard docs' }],
    ['meta', { property: 'og:description', content: 'Security auditing and policy gating for MCP servers' }]
  ],
  themeConfig: {
    logo: '/brand-mark.svg',
    siteTitle: 'mcp-guard',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'CLI', link: '/cli' },
      { text: 'Rules', link: '/rules' },
      { text: 'Security Model', link: '/security-model' },
      { text: 'GitHub Action', link: '/github-action' },
      { text: 'GitHub', link: 'https://github.com/CHANGE_ME/MCP-doctor' },
      { text: 'npm', link: 'https://www.npmjs.com/package/@CHANGE_ME/mcp-guard' }
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'Landing', link: '/' },
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'CLI', link: '/cli' }
        ]
      },
      {
        text: 'Security',
        items: [
          { text: 'Rules', link: '/rules' },
          { text: 'Security Model', link: '/security-model' }
        ]
      },
      {
        text: 'CI/CD',
        items: [
          { text: 'GitHub Action', link: '/github-action' },
          { text: 'Releasing', link: '/releasing' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/CHANGE_ME/MCP-doctor' }],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Built for practical MCP server audits.',
      copyright: 'MIT License'
    }
  }
});
