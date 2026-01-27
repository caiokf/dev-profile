<template>
  <div class="tech-radar-home">
    <!-- Hero + CTA Section -->
    <section class="hero" aria-label="Tech Radar introduction">
      <h1 class="page-title">tech radar</h1>
      <p class="hero-description">
        Inspired by
        <a href="https://www.thoughtworks.com/radar" target="_blank" rel="noopener" title="ThoughtWorks Technology Radar (opens in new tab)">ThoughtWorks</a
        >, this is my personal assessment of technologies based on hands-on experience—what works,
        what I'm testing, and what to avoid.
      </p>

      <div class="cta-wrapper">
        <router-link
          :to="latestVersionUrl"
          class="primary-cta"
          :class="{ 'is-loading': loading }"
          :tabindex="loading ? -1 : 0"
          :aria-busy="loading"
          :aria-disabled="loading"
          @click="createRipple"
        >
          <span class="cta-text">explore the radar</span>
          <span class="cta-version" :class="{ 'is-loading': loading }">
            <template v-if="loading">&nbsp;&nbsp;&nbsp;&nbsp;</template>
            <template v-else>{{ versions[0]?.name ?? '—' }}</template>
          </span>
          <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- Arrow (default state) -->
            <path class="icon-arrow" d="M5 12h14M12 5l7 7-7 7" />
            <!-- Radar sweep (hover state) -->
            <g class="icon-radar">
              <circle cx="12" cy="12" r="10" opacity="0.3" />
              <circle cx="12" cy="12" r="6" opacity="0.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
              <path
                d="M12 12 L12 2 A10 10 0 0 1 22 12 Z"
                fill="currentColor"
                stroke="none"
                opacity="0.6"
              />
            </g>
          </svg>
        </router-link>
        <div v-if="error" class="error-state">
          <span class="error-text">{{ error }}</span>
        </div>
        <span v-if="!loading && versions.length > 1" class="other-versions">
            or view
            <button
              class="versions-toggle"
              :aria-expanded="showOtherVersions"
              @click="showOtherVersions = !showOtherVersions"
            >
              previous versions
              <svg
                class="toggle-icon"
                :class="{ expanded: showOtherVersions }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <span v-if="showOtherVersions" class="versions-list">
              <router-link
                v-for="version in versions.slice(1)"
                :key="version.id"
                :to="`/tech-radar/${encodeURIComponent(version.id)}`"
                class="version-link"
              >
                {{ version.name }}
              </router-link>
            </span>
          </span>
      </div>
    </section>

    <!-- Radar Overview - 2 Column Layout -->
    <section class="radar-overview">
      <!-- Quadrants Column -->
      <div class="quadrants-column">
        <h2 class="column-title">quadrants</h2>
        <div class="quadrants-list">
          <article class="quadrant-item quadrant-ai">
            <span class="quadrant-name">ai</span>
            <span class="quadrant-desc">llms, ml frameworks, ai-assisted development</span>
          </article>
          <article class="quadrant-item quadrant-techniques">
            <span class="quadrant-name">techniques</span>
            <span class="quadrant-desc">patterns, architecture, testing strategies</span>
          </article>
          <article class="quadrant-item quadrant-tools">
            <span class="quadrant-name">tools</span>
            <span class="quadrant-desc">ide, cli utilities, productivity enhancers</span>
          </article>
          <article class="quadrant-item quadrant-techstack">
            <span class="quadrant-name">tech-stack</span>
            <span class="quadrant-desc">languages, frameworks, libraries, platforms</span>
          </article>
        </div>
      </div>

      <!-- Radar Visualization -->
      <div
        class="radar-visual"
        :data-quadrant="hoveredQuadrant"
        :data-ring="hoveredRing"
        @mousemove="handleRadarHover"
        @mouseleave="clearRadarHover"
      >
        <svg class="radar-svg" viewBox="0 0 400 400" aria-label="Tech Radar visualization">
          <!-- Rings -->
          <circle cx="200" cy="200" r="190" class="ring ring-avoid" />
          <circle cx="200" cy="200" r="145" class="ring ring-learning" />
          <circle cx="200" cy="200" r="100" class="ring ring-experimental" />
          <circle cx="200" cy="200" r="55" class="ring ring-proven" />

          <!-- Quadrant dividers -->
          <line x1="200" y1="10" x2="200" y2="390" class="divider" />
          <line x1="10" y1="200" x2="390" y2="200" class="divider" />


          <!-- Decorative blips - NW quadrant (ai) -->
          <circle cx="175" cy="168" r="4" class="blip blip-nw" />
          <circle cx="152" cy="185" r="4" class="blip blip-nw" />
          <circle cx="118" cy="142" r="4" class="blip blip-nw" />
          <circle cx="165" cy="115" r="4" class="blip blip-nw" />
          <circle cx="72" cy="168" r="4" class="blip blip-nw" />
          <circle cx="98" cy="92" r="4" class="blip blip-nw" />

          <!-- Decorative blips - NE quadrant (techniques) -->
          <circle cx="232" cy="175" r="4" class="blip blip-ne" />
          <circle cx="218" cy="142" r="4" class="blip blip-ne" />
          <circle cx="268" cy="162" r="4" class="blip blip-ne" />
          <circle cx="242" cy="98" r="4" class="blip blip-ne" />
          <circle cx="312" cy="118" r="4" class="blip blip-ne" />
          <circle cx="285" cy="72" r="4" class="blip blip-ne" />

          <!-- Decorative blips - SW quadrant (tools) -->
          <circle cx="168" cy="232" r="4" class="blip blip-sw" />
          <circle cx="185" cy="258" r="4" class="blip blip-sw" />
          <circle cx="132" cy="218" r="4" class="blip blip-sw" />
          <circle cx="115" cy="272" r="4" class="blip blip-sw" />
          <circle cx="78" cy="235" r="4" class="blip blip-sw" />
          <circle cx="52" cy="298" r="4" class="blip blip-sw" />

          <!-- Decorative blips - SE quadrant (tech-stack) -->
          <circle cx="228" cy="218" r="4" class="blip blip-se" />
          <circle cx="255" cy="242" r="4" class="blip blip-se" />
          <circle cx="218" cy="268" r="4" class="blip blip-se" />
          <circle cx="295" cy="215" r="4" class="blip blip-se" />
          <circle cx="272" cy="298" r="4" class="blip blip-se" />
          <circle cx="332" cy="255" r="4" class="blip blip-se" />
        </svg>

      </div>

      <!-- Rings Column -->
      <div class="rings-column">
        <h2 class="column-title">rings</h2>
        <div class="rings-list">
          <article class="ring-item ring-proven">
            <span class="ring-dot"></span>
            <div class="ring-text">
              <span class="ring-name">proven</span>
              <span class="ring-desc">battle-tested in production, confident recommendations</span>
            </div>
          </article>
          <article class="ring-item ring-experimental">
            <span class="ring-dot"></span>
            <div class="ring-text">
              <span class="ring-name">experimental</span>
              <span class="ring-desc"
                >testing in production for smaller, non-critical features</span
              >
            </div>
          </article>
          <article class="ring-item ring-learning">
            <span class="ring-dot"></span>
            <div class="ring-text">
              <span class="ring-name">learning</span>
              <span class="ring-desc">personal projects and exploration, not production-ready</span>
            </div>
          </article>
          <article class="ring-item ring-avoid">
            <span class="ring-dot"></span>
            <div class="ring-text">
              <span class="ring-name">avoid</span>
              <span class="ring-desc">seen to fail or don't fit personal preference</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { DataProviderGoogleSheets } from "../domain/radar/data-providers/data-provider-google-sheets";
  import { DataProviderNotion } from "../domain/radar/data-providers/data-provider-notion";
  import { DataProviderSample } from "../domain/radar/data-providers/data-provider-sample";
  import type {
    TechRadarDataProvider,
    RadarVersion,
  } from "../domain/radar/data-providers/data-provider";
  import { RADAR_SHEET_ID, GOOGLE_API_KEY, NOTION_PAGE_ID, NOTION_WORKER_URL } from "../domain/radar/constants";

  const versions = ref<RadarVersion[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showOtherVersions = ref(false);

  const latestVersionUrl = computed(() => {
    if (versions.value.length === 0) return "#";
    return `/tech-radar/${encodeURIComponent(versions.value[0].id)}`;
  });

  // Data provider - use Notion if configured, then Google Sheets, then fallback to sample data
  const dataProvider: TechRadarDataProvider =
    NOTION_PAGE_ID && NOTION_WORKER_URL
      ? new DataProviderNotion({ pageId: NOTION_PAGE_ID, workerUrl: NOTION_WORKER_URL })
      : RADAR_SHEET_ID && GOOGLE_API_KEY
        ? new DataProviderGoogleSheets({ sheetId: RADAR_SHEET_ID, apiKey: GOOGLE_API_KEY })
        : new DataProviderSample();

  onMounted(async () => {
    try {
      versions.value = await dataProvider.listVersions();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load versions";
    } finally {
      loading.value = false;
    }
  });

  // Radar hover detection for quadrant/ring highlighting
  const hoveredQuadrant = ref<string | null>(null);
  const hoveredRing = ref<string | null>(null);

  const handleRadarHover = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Convert to SVG coordinates (400x400 viewBox)
    const x = ((event.clientX - rect.left) / rect.width) * 400;
    const y = ((event.clientY - rect.top) / rect.height) * 400;

    // Center is at (200, 200)
    const dx = x - 200;
    const dy = y - 200;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Determine quadrant
    if (distance <= 190) {
      if (dx <= 0 && dy <= 0) hoveredQuadrant.value = "nw";
      else if (dx > 0 && dy <= 0) hoveredQuadrant.value = "ne";
      else if (dx <= 0 && dy > 0) hoveredQuadrant.value = "sw";
      else hoveredQuadrant.value = "se";
    } else {
      hoveredQuadrant.value = null;
    }

    // Determine ring
    if (distance <= 55) hoveredRing.value = "proven";
    else if (distance <= 100) hoveredRing.value = "experimental";
    else if (distance <= 145) hoveredRing.value = "learning";
    else if (distance <= 190) hoveredRing.value = "avoid";
    else hoveredRing.value = null;
  };

  const clearRadarHover = () => {
    hoveredQuadrant.value = null;
    hoveredRing.value = null;
  };

  // Radar-sweep ripple effect on click
  const createRipple = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Calculate click position relative to button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create ripple element
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    // Remove ripple after animation completes
    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  };
</script>

<style scoped>
  .tech-radar-home {
    min-height: calc(100vh - 112px);
    padding: var(--space-8);
  }

  /* Hero Section */
  .hero {
    max-width: var(--content-max-width);
    margin: 0 auto var(--space-8) auto;
    text-align: center;
  }

  .page-title {
    margin-bottom: var(--space-2);
  }

  .hero-description {
    font-family: var(--font-sans);
    font-size: var(--text-md);
    line-height: var(--leading-relaxed);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-6) 0;
  }

  .hero-description a {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  /* CTA Wrapper */
  .cta-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  /* Radar Overview - 3 Column Layout */
  .radar-overview {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-6);
    max-width: 1100px;
    margin: 0 auto var(--space-8) auto;
    align-items: center;
    position: relative;
  }

  .column-title {
    display: none;
  }

  /* Quadrants Column */
  .quadrants-column {
    justify-self: end;
    position: relative;
    z-index: 1;
  }

  .quadrants-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .quadrant-item {
    text-align: right;
  }

  .quadrant-name {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    text-transform: lowercase;
  }

  .quadrant-ai .quadrant-name {
    color: var(--quadrant-NW);
  }

  .quadrant-techniques .quadrant-name {
    color: var(--quadrant-NE);
  }

  .quadrant-tools .quadrant-name {
    color: var(--quadrant-SW);
  }

  .quadrant-techstack .quadrant-name {
    color: var(--quadrant-SE);
  }

  .quadrant-desc {
    display: block;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-normal);
  }

  /* Radar Visualization */
  .radar-visual {
    width: 320px;
    aspect-ratio: 1;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .radar-svg {
    width: 100%;
    height: 100%;
  }

  .ring {
    fill: none;
    stroke: var(--color-border);
    stroke-width: 1;
  }

  .ring-proven {
    fill: var(--ring-0);
  }

  .ring-experimental {
    fill: var(--ring-1);
  }

  .ring-learning {
    fill: var(--ring-2);
  }

  .ring-avoid {
    fill: var(--ring-3);
  }

  .divider {
    stroke: var(--color-background);
    stroke-width: 4;
  }

  .blip {
    opacity: 0.8;
    transition:
      opacity 0.2s ease,
      filter 0.2s ease;
  }

  .blip-nw {
    fill: var(--quadrant-NW);
  }

  .blip-ne {
    fill: var(--quadrant-NE);
  }

  .blip-sw {
    fill: var(--quadrant-SW);
  }

  .blip-se {
    fill: var(--quadrant-SE);
  }

  /* Radar hover cursor */
  .radar-visual {
    cursor: pointer;
  }

  /* Highlight quadrant items in left column on radar hover */
  .quadrant-item {
    transition: opacity 0.2s ease;
  }

  .radar-overview:has([data-quadrant]) .quadrant-item {
    opacity: 0.4;
  }

  .radar-overview:has([data-quadrant="nw"]) .quadrant-item.quadrant-ai,
  .radar-overview:has([data-quadrant="ne"]) .quadrant-item.quadrant-techniques,
  .radar-overview:has([data-quadrant="sw"]) .quadrant-item.quadrant-tools,
  .radar-overview:has([data-quadrant="se"]) .quadrant-item.quadrant-techstack {
    opacity: 1;
  }

  /* Highlight ring items in right column on radar hover */
  .ring-item {
    transition: opacity 0.2s ease;
  }

  .radar-overview:has([data-ring]) .ring-item {
    opacity: 0.4;
  }

  .radar-overview:has([data-ring="proven"]) .ring-item.ring-proven,
  .radar-overview:has([data-ring="experimental"]) .ring-item.ring-experimental,
  .radar-overview:has([data-ring="learning"]) .ring-item.ring-learning,
  .radar-overview:has([data-ring="avoid"]) .ring-item.ring-avoid {
    opacity: 1;
  }

  /* Rings Column */
  .rings-column {
    justify-self: start;
    position: relative;
    z-index: 1;
  }

  .rings-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .ring-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .ring-dot {
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    border: 5px solid;
    flex-shrink: 0;
    background: transparent;
  }

  .ring-proven .ring-dot {
    border-color: var(--ring-0);
    background: var(--ring-0);
  }

  .ring-experimental .ring-dot {
    border-color: var(--ring-1);
  }

  .ring-learning .ring-dot {
    border-color: var(--ring-2);
  }

  .ring-avoid .ring-dot {
    border-color: var(--ring-3);
  }

  .ring-text {
    display: flex;
    flex-direction: column;
  }

  .ring-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    color: var(--color-text-primary);
    text-transform: lowercase;
  }

  .ring-desc {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-normal);
  }

  /* Primary CTA */
  .primary-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    background: var(--color-primary);
    color: var(--color-text-inverse);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      background-color var(--transition-fast);
    position: relative;
    overflow: hidden;
  }

  /* Radar-sweep ripple effect */
  .primary-cta :deep(.ripple) {
    position: absolute;
    width: 200px;
    height: 200px;
    margin-left: -100px;
    margin-top: -100px;
    border-radius: 50%;
    pointer-events: none;
    animation: radarRipple 0.6s ease-out forwards;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(255, 255, 255, 0.4) 30deg,
      transparent 90deg
    );
  }

  .primary-cta :deep(.ripple)::before,
  .primary-cta :deep(.ripple)::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    animation: rippleRing 0.6s ease-out forwards;
  }

  .primary-cta :deep(.ripple)::after {
    animation-delay: 0.1s;
    border-width: 1px;
    opacity: 0.5;
  }

  @keyframes radarRipple {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: scale(2) rotate(180deg);
      opacity: 0;
    }
  }

  @keyframes rippleRing {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .primary-cta.is-loading {
    pointer-events: none;
  }

  .primary-cta:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: var(--color-primary-hover);
    color: var(--color-text-inverse);
  }

  .cta-text {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    text-transform: lowercase;
  }

  .cta-version {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    opacity: 0.85;
    padding: 2px var(--space-2);
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-sm);
    transition: opacity 0.3s ease;
  }

  .cta-version.is-loading {
    opacity: 0;
  }

  .cta-icon {
    width: 24px;
    height: 24px;
    position: relative;
  }

  .icon-arrow {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .icon-radar {
    opacity: 0;
    transform: scale(0.5) rotate(-90deg);
    transform-origin: center;
    transition:
      opacity 0.3s ease,
      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .primary-cta:hover .icon-arrow {
    opacity: 0;
    transform: translateX(8px);
  }

  .primary-cta:hover .icon-radar {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  /* Other Versions - Inline */
  .other-versions {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .versions-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color var(--transition-fast);
  }

  .versions-toggle:hover {
    color: var(--color-primary);
  }

  .toggle-icon {
    width: 14px;
    height: 14px;
    transition: transform var(--transition-fast);
  }

  .toggle-icon.expanded {
    transform: rotate(180deg);
  }

  .versions-list {
    display: inline;
    margin-left: var(--space-1);
  }

  .version-link {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-primary);
    text-decoration: none;
    padding: var(--space-1) var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    margin-left: var(--space-1);
    transition: background var(--transition-fast), border-color var(--transition-fast);
  }

  .version-link:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-primary);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }

  .error-state {
    margin-top: var(--space-2);
  }

  .error-text {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-error);
    text-transform: lowercase;
  }

  /* Responsive - Tablet */
  @media (--lg) {
    .radar-overview {
      grid-template-columns: 1fr;
      gap: var(--space-8);
      max-width: 500px;
    }

    .quadrants-column {
      justify-self: center;
      order: 2;
    }

    .quadrants-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .quadrant-item {
      text-align: center;
    }

    .radar-visual {
      order: 1;
      justify-self: center;
    }

    .rings-column {
      justify-self: center;
      order: 3;
    }

    .rings-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .quadrant-item {
      text-align: left;
      padding-left: var(--space-3);
      border-left: 3px solid;
    }

    .quadrant-ai {
      border-color: var(--quadrant-NW);
    }

    .quadrant-techniques {
      border-color: var(--quadrant-NE);
    }

    .quadrant-tools {
      border-color: var(--quadrant-SW);
    }

    .quadrant-techstack {
      border-color: var(--quadrant-SE);
    }

    .ring-item {
      padding-left: var(--space-3);
    }

    .ring-dot {
      width: 12px;
      height: 12px;
      border-width: 3px;
      margin-top: 4px;
    }

    .column-title {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--text-md);
      font-weight: var(--font-semibold);
      color: var(--color-text-muted);
      text-transform: lowercase;
      text-align: center;
      margin: 0 0 var(--space-4) 0;
    }
  }

  /* Responsive - Mobile */
  @media (--md) {
    .tech-radar-home {
      padding: var(--space-6);
    }

    .hero {
      margin-bottom: var(--space-6);
    }

    .hero-description {
      font-size: var(--text-base);
    }

    .radar-overview {
      gap: var(--space-6);
    }

    .radar-visual {
      width: 280px;
    }

    .primary-cta {
      padding: var(--space-3) var(--space-5);
    }

    .cta-text {
      font-size: var(--text-md);
    }

    .other-versions {
      display: block;
      margin-top: var(--space-2);
    }
  }

  @media (--sm) {
    .primary-cta {
      padding: var(--space-3) var(--space-4);
    }

    .cta-icon {
      display: none;
    }

    .cta-text {
      font-size: var(--text-base);
    }

    .quadrants-list,
    .rings-list {
      grid-template-columns: 1fr;
    }

    .radar-visual {
      width: 240px;
    }
  }
</style>
