# badge-dashboard

This is a tool to generate a static HTML dashboard for Heroes Badges.

## Prerequisites

* Node.js 12+
* yarn

## Install

```console
yarn
```

## Usage

```console
yarn generate --config config.json
```

### Input

The tool uses the **Heroes Admin** XLS export file, which must contain the following fields: `To: full name`, `From: email`, `Date` and `Badge`.

### Configuration

| Property | Type | Description | Default |
|:---------|:-----|:------------|:--------|
| `input` | `string`<sup>1</sup> | Path/Glob to input Heroes XLSX exports | `{config}/input/**/*.xlsx` |
| `output` | `string`<sup>1</sup> | Path to generate output. | `{config}/output` |
| `profileImages` | `string`<sup>1</sup> | Path to folder, where profile images are located. | `{config}/images/profile` |
| `title` | `string` | Title of the dashboard. | `Badge Dashboard` |
| `header` | `string` | Header text of the dashboard. | `We are proud of...` |
| `theme` | `string` | The theme to use, either path to a CSS file or one of the built-in themes (see below). | `giant_eathal` |
| `template` | `string` | The template to use, either path to an EJS file or one of the build-in templates (see below). | `standalone` |
| `ignoreMissingImages` | `boolean` | Whether missing images should be replaced with placeholder, or error thrown if there is any. | `false` |
| `showUnassignedBadges` | `boolean` | Whether badges which does not have any assignment should be shown. | `false` |
| `showProfileImages` | `boolean` | Whether profile images should be shown or just names. | `true` | 
| `blacklist` | `string[]` | Person names to ignore from assignments. | - |
| `badges` | `BadgeConfig[]` | Configuration of the badges to include on the dashboard. | - |

The available **themes** are:
* Giant Eathal (`giant_eathal`)
* Leto Light (`leto_light`) or Leto Dark (`leto_dark`)
* Odde Light (`odde_light`) or Odde Dark (`odde_dark`)

The available **templates** are:
* **Standalone** (`standalone`), when a full, standalone HTML page is generated.
* **Embedded** (`embedded`), when only a `div`, including all resource, is generated, which can be embedded into other HTML files or on Confluence.

`Badge` configuration is the following:

| Property | Type | Description |
|:---------|:-----|:------------|
| `name` | `string` | Name of the badge. |
| `image` | `string`<sup>1</sup> | Path to the image of the badge. |
| `from` | `string` | If set, only assignment with this "From" field will be considered as match. | - |
| `levels` | `BadgeLevel[]` | Configuration of the badge levels, if it is a multi-level badge, otherwise can be empty. |

`BadgeLevel` configuration is the following:
| Property | Type | Description |
|:---------|:-----|:------------|
| `name` | `string` | Name of the badge level. |
| `image` | `string`<sup>1</sup> | Path to the image of the badge level. |
| `n` | `number` | Number of assignments needed to achieve this level. |

### Note

1. All path can include the `{config}` token, which is the directory of the configuration file set.
