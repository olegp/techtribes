import scrapeMeetabit from "./meetabit.ts";

(async function () {
  console.log(
    await scrapeMeetabit(
      "https://www.meetabit.com/communities/turku-3-frontend"
    )
  );
})();
