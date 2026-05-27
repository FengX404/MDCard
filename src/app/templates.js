const TEMPLATES = [
    {
        id: 'default',
        name: '默认',
        desc: '均衡排版，适合通用分享场景',
        cssClass: 'mc__card--default',
    },
    {
        id: 'magazine',
        name: '杂志',
        desc: '杂志风格：上下装饰线，图片通栏',
        cssClass: 'mc__card--magazine',
        defaults: {
            pad: 40,
            my: 14,
        },
    },
    {
        id: 'minimal',
        name: '极简',
        desc: '极简留白：细字无框，适合文艺/摘录',
        cssClass: 'mc__card--minimal',
        defaults: {
            pad: 36,
            my: 10,
        },
    },
    {
        id: 'card',
        name: '名片',
        desc: '名片卡片：圆角阴影，适合正式分享',
        cssClass: 'mc__card--card',
        defaults: {
            pad: 32,
            my: 8,
            bw: 2,
            br: 16,
        },
    },
];

export const DEFAULT_TEMPLATE = 'default';

export default TEMPLATES;