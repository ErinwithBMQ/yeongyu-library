import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: '小章鱼存档地',
        short_name: '存档地',
        description: '产出整理站 + 匿名树洞',
        start_url: '/',
        display: 'standalone',
        background_color: '#fffaf5',
        theme_color: '#f5d6d6',
        icons: [
            {
                src: '/octopus.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/octopus.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}