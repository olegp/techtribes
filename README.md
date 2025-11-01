# Techtribes

## Overview

A site listing active tech community events in Finland. Events are updated automatically once a day. Supports Meetabit, Meetup.com and Luma.

## Add community

First, install dependencies:

```bash
npm install
```

```bash
npm run add <url> [tags]
```

Example: `npm run add https://www.meetabit.com/communities/helsinkijs "JavaScript,TypeScript"`

Once done, create a pull request with the changes.

## Development

```bash
bundle install
```

```bash
npm run scrape
npm run images
npm start
```

### Data file

Communities are defined in [data/communities.yml](data/communities.yml):

```yaml
- name: HelsinkiJS
  location: Helsinki, Finland
  tags:
    - JavaScript
  events: https://www.meetabit.com/communities/helsinkijs
  logo: helsinkijs.png
  site: https://helsinkijs.org # optional
```

### CSS optimization

```bash
npm run css
npm run purgecss
```
