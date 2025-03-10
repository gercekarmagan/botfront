const version = require('../../package.json').version;


module.exports = {
    permalink: ':slug',
    plugins: [
            ['@vuepress/google-analytics', {
              ga: 'UA-110157233-2'
            }],
            // '@vuepress/plugin-pwa',
            '@vuepress/active-header-links',
            '@vuepress/plugin-medium-zoom',
            '@vuepress/back-to-top'
        ],
    title: 'Documentation',
    themeConfig: {
        algolia: {
            apiKey: '8b60ee4c0486b30ef1cd92220831bc34',
            indexName: 'botfront'
          },
        docsRepo: 'botfront/botfront',
        docsDir: 'botfront/docs',
        docsBranch: 'master',
        editLinks: true,
        editLinkText: '🖊️ Edit this page on Github!',
        lastUpdated: 'Last Updated',
        
        nav: [{ text: 'Guide', link: '/guide/users-guide/quick-start/' }, { text: 'Github', link: 'https://github.com/botfront/botfront' }, { text: 'Botfront website', link: 'https://botfront.io' } ],

        sidebar: [
            {
                title: 'Users guide', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/users-guide/setup',
                    '/guide/users-guide/quick-start',
                    '/guide/users-guide/branching-conversations',
                ],
            },
            {
                title: 'NLU Guide', // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    ['/guide/', 'Intents and Entities'],
                    '/guide/nlu/training_adding_data',
                    '/guide/nlu/training',
                    '/guide/nlu/evaluation',
                ],
            },
            {
                title: 'Deployment Guide',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/deployment/',
                    '/guide/deployment/endpoints',
                    '/guide/deployment/credentials',
                ]
            },
            {
                title: 'Developers Guide',   // required
                // path: '/guide',
                collapsable: false,
                sidebarDepth: 5,
                children: [
                    '/guide/developers-guide/',
                ]
            },
        ],
    },
};
