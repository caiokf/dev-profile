import type {
  TechRadarDataProvider,
  RadarVersion,
} from "./data-provider";
import type { TechRadarData, TechRadarBlipData } from "./types";
import type { BlipStatus } from "../models/blip";

export type NotionConfig = {
  pageId: string;
  workerUrl: string; // Cloudflare Worker URL that proxies to Notion API
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  child_database?: {
    title: string;
  };
};

type NotionBlocksResponse = {
  results: NotionBlock[];
  has_more: boolean;
  next_cursor: string | null;
};

type NotionAnnotations = {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
};

type NotionRichText = {
  plain_text: string;
  href?: string | null;
  annotations?: NotionAnnotations;
};

type NotionPageProperties = {
  name?: { title: NotionRichText[] };
  ring?: { select: { name: string } | null };
  quadrant?: { select: { name: string } | null };
  "is-new"?: { checkbox: boolean };
  status?: { select: { name: string } | null };
  description?: { rich_text: NotionRichText[] };
};

type NotionPage = {
  properties: NotionPageProperties;
};

type NotionQueryResponse = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

export class DataProviderNotion implements TechRadarDataProvider {
  private pageId: string;
  private workerUrl: string;
  private databases: Map<string, { id: string; name: string }> | null = null;

  constructor(config: NotionConfig) {
    this.pageId = config.pageId;
    // Remove trailing slash if present
    this.workerUrl = config.workerUrl.replace(/\/$/, "");
  }

  async listVersions(): Promise<RadarVersion[]> {
    await this.ensureDatabases();

    if (!this.databases) {
      return [];
    }

    return Array.from(this.databases.values())
      .filter((db) => !db.name.startsWith("_"))
      .map((db) => ({
        id: db.id,
        name: db.name,
      }));
  }

  async fetchVersion(versionId: string): Promise<TechRadarData> {
    await this.ensureDatabases();

    const database = this.databases?.get(versionId);
    const title = database?.name ?? "Tech Radar";

    const blips = await this.queryDatabase(versionId);

    return {
      title,
      blips,
    };
  }

  private async ensureDatabases(): Promise<void> {
    if (this.databases) return;

    this.databases = new Map();
    await this.findDatabasesInBlock(this.pageId);
  }

  private async findDatabasesInBlock(blockId: string): Promise<void> {
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`${this.workerUrl}/v1/blocks/${blockId}/children`);
      if (cursor) {
        url.searchParams.set("start_cursor", cursor);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Notion block children: ${response.status} ${response.statusText}`
        );
      }

      const data: NotionBlocksResponse = await response.json();

      for (const block of data.results) {
        if (block.type === "child_database" && block.child_database) {
          this.databases!.set(block.id, {
            id: block.id,
            name: block.child_database.title,
          });
        } else if (block.has_children) {
          // Recursively search in nested blocks (toggles, columns, etc.)
          await this.findDatabasesInBlock(block.id);
        }
      }

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }
  }

  private async queryDatabase(databaseId: string): Promise<TechRadarBlipData[]> {
    const blips: TechRadarBlipData[] = [];

    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const url = `${this.workerUrl}/v1/databases/${databaseId}/query`;

      const body: { start_cursor?: string } = {};
      if (cursor) {
        body.start_cursor = cursor;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to query Notion database: ${response.status} ${response.statusText}`
        );
      }

      const data: NotionQueryResponse = await response.json();

      for (const page of data.results) {
        const blip = this.parsePageToBlip(page);
        if (blip) {
          blips.push(blip);
        }
      }

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return blips;
  }

  private parsePageToBlip(page: NotionPage): TechRadarBlipData | null {
    const props = page.properties;

    const name = this.getRichTextValue(props.name?.title);
    const ring = props.ring?.select?.name ?? "";
    const quadrant = props.quadrant?.select?.name ?? "";

    // Skip pages without required fields
    if (!name || !ring || !quadrant) {
      return null;
    }

    const isNew = props["is-new"]?.checkbox ?? false;
    const statusValue = props.status?.select?.name ?? "";
    const status = this.normalizeStatus(statusValue, isNew);
    const description = this.richTextToHtml(props.description?.rich_text);

    return {
      name,
      ring: this.normalizeRing(ring),
      quadrant,
      isNew,
      status,
      description,
    };
  }

  private getRichTextValue(richText: NotionRichText[] | undefined): string {
    if (!richText || richText.length === 0) {
      return "";
    }
    return richText.map((t) => t.plain_text).join("");
  }

  private richTextToHtml(richText: NotionRichText[] | undefined): string {
    if (!richText || richText.length === 0) {
      return "";
    }

    const htmlParts = richText.map((segment) => {
      let text = this.escapeHtml(segment.plain_text);
      const annotations = segment.annotations;

      if (annotations) {
        if (annotations.code) {
          text = `<code>${text}</code>`;
        }
        if (annotations.bold) {
          text = `<strong>${text}</strong>`;
        }
        if (annotations.italic) {
          text = `<em>${text}</em>`;
        }
        if (annotations.strikethrough) {
          text = `<s>${text}</s>`;
        }
        if (annotations.underline) {
          text = `<u>${text}</u>`;
        }
      }

      if (segment.href) {
        text = `<a href="${this.escapeHtml(segment.href)}" target="_blank" rel="noopener">${text}</a>`;
      }

      return text;
    });

    // Wrap in paragraph and convert newlines to proper HTML
    const html = htmlParts.join("");
    const paragraphs = html.split("\n\n").filter((p) => p.trim());

    if (paragraphs.length > 1) {
      return paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
    }

    return `<p>${html.replace(/\n/g, "<br>")}</p>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private normalizeStatus(status: string, isNew: boolean): BlipStatus {
    if (isNew) return "new";

    const normalized = status.toLowerCase().replace(/[_-]/g, " ").trim();

    switch (normalized) {
      case "moved in":
        return "moved in";
      case "moved out":
        return "moved out";
      case "no change":
      default:
        return "no change";
    }
  }

  private normalizeRing(ring: string): string {
    // Capitalize first letter of each word
    return ring
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  }
