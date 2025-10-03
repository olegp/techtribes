import scrapeMeetup from "./meetup.ts";

(async function () {
  console.log(await scrapeMeetup("https://www.meetup.com/helpy-meetups/"));
})();
