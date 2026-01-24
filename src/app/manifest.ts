import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: '小章鱼存档地',
        short_name: '存档地',
        description: '产出整理站 + 匿名树洞',
        start_url: '/',
        display: 'standalone',
        background_color: '#fffaf5',
        theme_color: '#8B4513',
        icons: [
            {
                src: '/logo_2.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo_2.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}