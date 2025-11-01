import scrapeLuma from "./luma.ts";

(async function () {
  console.log(await scrapeLuma("https://luma.com/symposiumai"));
})();
