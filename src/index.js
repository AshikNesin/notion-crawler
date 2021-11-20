import {
  getAllPagesInSpace,
  getCanonicalPageId,
  uuidToId,
  getBlockTitle,
  getTextContent,
  normalizeTitle,
} from "notion-utils";
import { NotionAPI } from "notion-client";
const notion = new NotionAPI();

export default async function notionCrawler(
  rootNotionPageId,
  spaceId,
  config = {}
) {
  const pageMap = await getAllPagesInSpace(
    rootNotionPageId,
    spaceId,
    notion.getPage.bind(notion),
    {
      traverseCollections: true,
      uuid: true,
      ...config,
    }
  );

  const pageBlocks = Object.keys(pageMap).reduce((map, pageId) => {
    const notionPageId = uuidToId(pageId);
    const recordMap = pageMap[pageId];
    if (!recordMap) {
      throw new Error(`Error loading page "${pageId}"`);
    }

    const canonicalPageId =
      (rootNotionPageId || "").split("-").join("") ===
      (pageId || "").split("-").join("")
        ? "/"
        : getCanonicalPageId(pageId, recordMap, {
            uuid: false,
          });
    const block = pageMap[pageId].block[pageId];
    const blockValue = block.value;
    const title = getBlockTitle(blockValue, recordMap);

    const response = {
      ...map,
      [notionPageId]: {
        id: notionPageId,
        parentId: blockValue.parent_id.split("-").join(""),
        canonicalPageId,
        title,
        rawData: blockValue,
      },
    };

    if (blockValue.parent_table === "collection") {
      const collection = pageMap[pageId].collection[blockValue.parent_id];
      const collectionName = getTextContent(collection.value.name);
      const canonicalPageId = normalizeTitle(collectionName);
      response[notionPageId].collection = {
        name: collectionName,
        canonicalPageId: canonicalPageId,
        rawData: collection,
      };
      response[
        notionPageId
      ].canonicalPageId = `${canonicalPageId}/${response[notionPageId].canonicalPageId}`;
    }

    return response;
  }, {});

  const appendParentSlug = (pageId, previous = "") => {
    const page = pageBlocks[pageId];
    if (!page?.parentId || !pageBlocks[page.parentId]) {
      return previous;
    }
    return appendParentSlug(
      page.parentId,
      `${pageBlocks[page.parentId].canonicalPageId}/${previous}`
    );
  };

  const notionPageIdToSlugMapper = {};

  for (const key in pageBlocks) {
    pageBlocks[key].slug = `${appendParentSlug(
      key,
      pageBlocks[key].canonicalPageId
    )}`;

    // TODO: Temp fix. Refactor this.
    if (pageBlocks[key].slug.startsWith("//")) {
      pageBlocks[key].slug = pageBlocks[key].slug.slice(1);
    }
    if (!pageBlocks[key].slug.startsWith("/")) {
      pageBlocks[key].slug = `/${pageBlocks[key].slug}`;
    }

    notionPageIdToSlugMapper[key] = pageBlocks[key].slug;
  }

  return {
    pageBlocks,
    notionPageIdToSlugMapper,
    pageMap,
  };
}
