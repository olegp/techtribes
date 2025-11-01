# Techtribes

## Overview

This is a site listing tech community events in Finland. Only active communities with events in the past year are included. The events are updated automatically once a day.

## Add a community

First, install dependencies:

```bash
npm install
```

To add a new community, use the `add` command with the community's event platform URL:

```bash
npm run add <url> [tags]
```

**Supported platforms:**

- [Meetup.com](https://www.meetup.com/): `npm run add https://www.meetup.com/helsinkijs/ "JavaScript,TypeScript"`
- [Meetabit.com](https://www.meetabit.com/): `npm run add https://www.meetabit.com/communities/helsinkijs "JavaScript,TypeScript"`
- [Luma](https://luma.com/): `npm run add https://luma.com/example "JavaScript,TypeScript"`

**What it does:**

- Automatically extracts the community name and logo from the platform
- Sets the location to Helsinki, Finland
- Downloads and processes the logo to `site/assets/logos/`
- Adds the community to `data/communities.yml` in alphabetical order

**Tags:**

- Provide tags as a comma-separated list (e.g., `"JavaScript,TypeScript,Node.js"`)
- Reuse existing tags when possible to keep consistency

After running the command, create a pull request with the changes.

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

### communities.yml structure

Communities are defined in [data/communities.yml](data/communities.yml) with the following structure:

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

- `name` - The community's name
- `location` - City and country format (e.g., Helsinki, Finland)
- `tags` - Array of technology tags
- `events` - URL to the community's event platform page (Meetup.com, Meetabit.com or Luma)
- `site` - (optional) Community homepage URL
- `logo` - Filename in `site/assets/logos/` or URL

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
