// Manual integration test for MDCard
import { paginateMarkdown } from '../src/app/paginator.js';
import { FORMATS, LEVELS, DEFAULTS, levelToValue, valueToLevel } from '../src/app/config.js';
import { createDefaults, cloneSettings, applyCardVars, availableHeight } from '../src/app/settings.js';
import { resolveMarkdown, importImages } from '../src/app/image-upload.js';
