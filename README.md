# Techtribes

## Overview

This is a site listing tech community events in Finland. Only active communities with events in the past year are included. The events are updated automatically once a day.

## Add a community

### Using the add command (recommended)

To add a new community, use the `add` command with the community's event platform URL:

```bash
npm run add <url> [tags]
```

**Supported platforms:**

- [Meetup.com](https://www.meetup.com/): `npm run add https://www.meetup.com/helsinkijs/ "JavaScript,TypeScript"`
- [Meetabit.com](https://www.meetabit.com/): `npm run add https://www.meetabit.com/communities/helsinkijs "JavaScript,TypeScript"`
- [Luma](https://lu.ma/): `npm run add https://lu.ma/example "JavaScript,TypeScript"`

**What it does:**

- Automatically extracts the community name and logo from the platform
- Sets the location to Helsinki, Finland
- Downloads and processes the logo to `site/assets/logos/`
- Adds the community to `data/communities.yml` in alphabetical order

**Tags:**

- Provide tags as a comma-separated list (e.g., `"JavaScript,TypeScript,Node.js"`)
- Reuse existing tags when possible to keep consistency

After running the command, create a pull request with the changes.

### Manual editing (for unsupported platforms)

If the event platform isn't supported, you can manually edit [data/communities.yml](data/communities.yml) and create a pull request with the changes. The communities are listed in alphabetical order by name, so make sure to add it in the correct place or run `npm run sort` before committing.

A sample entry looks like this:

```yaml
- name: HelsinkiJS
  location: Helsinki, Finland
  tags:
    - JavaScript
    - TypeScript
    - Node.js
  events: https://www.meetabit.com/communities/helsinkijs
  logo: helsinkijs.png
```

**Field descriptions:**

- `name` - The community's name (auto-extracted by add command)
- `location` - City and country format (auto-set to Helsinki, Finland by add command)
- `tags` - Array of technology tags (provided as command argument)
- `events` - URL to the community's event platform page
- `site` - (optional) Community homepage URL, like `https://helsinkijs.org`
- `logo` - Filename in `site/assets/logos/` or URL (auto-downloaded and saved by add command; you can also provide a URL and run `npm run images` to download it)

## Development

Install dependencies:

```bash
bundle install
npm install
```

Scrape data:

```bash
npm run scrape
```

Process logo images:

```bash
npm run images
```

This downloads logo images from URLs in `data/communities.yml` and saves them locally to `site/assets/logos/`.

Run development server:

```bash
npm start
```

The pages will now automatically reload whenever you edit any file. Also, you can view the pages from mobile devices connected to the same network.

To download CSS and optimize it, run the command below after the one above:

```bash
npm run css
npm run purgecss
```

## Built with

- [Tabler](https://tabler.io/)
- [Jekyll](https://jekyllrb.com/)
