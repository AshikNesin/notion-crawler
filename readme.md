# notion-crawler

> Easily crawl your public notion pages

## Install

```sh
npm install notion-crawler
```

## Usage

```js
import notionCrawler from "notion-crawler";

const { pageBlocks, notionPageIdToSlugMapper, pageMap } = await notionCrawler(
  rootNotionPageId,
  spaceId,
  config
);
```

## API

### notionCrawler(rootNotionPageId, spaceId?, config?)

#### rootNotionPageId

Type: `string`

You can find it in at the end of your notion public url

For example, in case of https://ashiknesin.notion.site/AshikNesin-com-d95d7c8c5eaf40e1a7ae629f4aba0000

`d95d7c8c5eaf40e1a7ae629f4aba0000` is rootNotionPageId.

#### spaceId

Type: `string`

##### config

Type: `object`
Default: `{}`

## Credits

This module is heavily based on [nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit) by [Travis Fischer](https://transitivebullsh.it)
