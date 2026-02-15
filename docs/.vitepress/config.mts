import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'mcp-guard',
  description: 'Security auditing and policy gating for MCP servers',
  base: '/MCP-doctor/',
  markdown: {
    config: (md) => {
      md.use;
    }
  },
  themeConfig: {
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
      { text: 'Overview', items: [
        { text: 'Landing', link: '/' },
        { text: 'Quickstart', link: '/quickstart' },
        { text: 'CLI', link: '/cli' }
      ]},
      { text: 'Security', items: [
        { text: 'Rules', link: '/rules' },
        { text: 'Security Model', link: '/security-model' }
      ]},
      { text: 'CI/CD', items: [
        { text: 'GitHub Action', link: '/github-action' },
        { text: 'Releasing', link: '/releasing' }
      ]}
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/CHANGE_ME/MCP-doctor' }]
  }
});
