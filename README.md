# Techtribes

## Overview

This is a site listing tech community events worldwide. Only active communities with events in the past year are included. The events are updated automatically once a day.

## Add a community

To add or update a community listing, create a pull request with changes to [this file](data/communities.yml). The communities are listed in alphabetical order by name, so make sure to add it in the correct place or run `npm run sort` before committing.

A sample entry looks like this:

```yaml
- name: HelsinkiJS
  location: Helsinki, Finland
  tags:
    - JavaScript
    - TypeScript
    - Node.js
  events: https://www.meetabit.com/communities/helsinkijs
  logo: https://helsinkijs.org/assets/icon.180.png
```

- `location` should be the city name and country (Finland), separated by a comma
- `tags` should reuse existing ones if possible and keep their spelling consistent
- `events` should be the URL of the community's homepage on [Meetabit](https://www.meetabit.com/) or [Meetup.com](https://www.meetup.com/) (if you'd like to add another site, you will need send a PR for that scraper first)
- `site` is an optional URL of the community's homepage, such as `https://helsinkijs.org` - if it is not provided, the events URL will be used
- `logo` should be the URL of the community's logo, ideally 128x128 pixels in PNG format; rather than hotlinking, you can also include the image in the pull request in the `site/assets/logos` directory with the filename being the slug of the community name and the value set to it, e.g. `logo: helsinkijs.png`

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
