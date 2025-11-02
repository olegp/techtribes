# Techtribes

## Overview

A site listing active tech community events in Finland. Events are updated automatically once a day. Supports [Meetabit](https://www.meetabit.com/), [Meetup.com](https://www.meetup.com/), [Luma](https://luma.com/) and a [custom JSON format](https://gist.github.com/olegp/f34469b65286c057964414c4aaf5bf47).

## Add community

First, install dependencies:

```bash
npm install
```

Then, add a community by URL:

```bash
npm run add <url> [tags]
```

Example: `npm run add https://www.meetabit.com/communities/helsinkijs "JavaScript,TypeScript"`

Once done, create a pull request with the changes.

## Data file

Communities are defined in [data/communities.yml](data/communities.yml):

```yaml
- name: HelsinkiJS
  location: Helsinki, Finland
  tags:
    - JavaScript
  events: https://www.meetabit.com/communities/helsinkijs
  logo: helsinkijs.png # optional
  site: https://helsinkijs.org # optional
  url: https://example.com/events.json # optional, for custom JSON endpoints
```

The `add` command updates this file and adds a logo to the repo.

## Development

Install Jekyll dependencies in addition to the Node ones:

```bash
bundle install
```

Scrape event data:

```bash
npm run scrape
```

Start the Jekyll dev server:

```bash
npm start
```
