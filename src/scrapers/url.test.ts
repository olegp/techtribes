import scrapeUrl from "./url";

/**
 * Test the URL scraper with a sample GitHub gist URL
 */
(async function () {
  console.log(
    await scrapeUrl(
      "https://gist.githubusercontent.com/olegp/f34469b65286c057964414c4aaf5bf47/raw"
    )
  );
})();
