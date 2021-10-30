# Doctolib Pregnancy Scraper

In this repository, you'll be able to scrape Doctolib for availabilities. Defaut values in this script target a "Pregnancy checks" in a hospital in Saint-Maurice.

To run it:

```bash
# install deps
npm install
# run the script
node script.js
```

By default, the script uses today's date to check for availabilities in the following 7 days.

You can also use a custom `date` to check as a CLI argument like the following example:
```bash
# format of the date is always yyyy-mm-dd
node script.js 2021-12-06
```
