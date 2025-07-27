const express = require('express');
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;



async function scrape(searchTerm) {
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(`https://www.linkedin.com/jobs/search?keywords=${searchTerm}`);
    
    await page.setViewport({width: 1080, height: 1024});
    
    await page.locator('aria/Dismiss').click();
    
    const h1Text = await page.$eval('h1', element => element.textContent.trim());

    console.log('The title of this blog post is "%s".', h1Text);

    let jobLinks = await page.$$eval(
        '[data-tracking-control-name="public_jobs_jserp-result_search-card"]',
        nodes => nodes.map(node => node.getAttribute("href"))
    
    );
    let jobInfo = await page.$$eval(
        '.base-search-card__info',
        nodes => nodes.map(node => {
            const title = node.querySelector('h3')?.innerText || '';
            const company = node.querySelector('h4')?.innerText || '';
            const location = node.querySelector('.job-search-card__location')?.innerText || '';
            const timePosted = node.querySelector('.job-search-card__listdate')?.innerText || '';
            
            return { title, company, location, timePosted };
        })
    );

    let jobs = jobInfo.map(job=>{
        const index = jobInfo.indexOf(job)
        const link = jobLinks.at(index)
        const title = job.title
        const company = job.company
        const location = job.location
        const timePosted = job.timePosted
        return { title,link, company, location, timePosted }
    });



    console.log(jobs);

    await browser.close();
    return jobs;
}

async function getJobDetails(url){
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    
    await page.goto(url);
    
    await page.setViewport({width: 1080, height: 1024});

    await page.locator('aria/Dismiss').click();

    const numberOfApplicants = await page.$eval(
        ".num-applicants__caption",
        element => element.textContent.trim()
    );
    

    // const payRange = await page.$eval(
    //     "div.salary",
    //     element => element.textContent.replaceAll("\n","").replaceAll("\t","").trim()
    // ) || "No pay range was specified";
    const payRangeEl = await page.$('div.salary');

    let payRange = "No pay range was specified";

    if (payRangeEl) {
    payRange = await page.evaluate(el =>
        el.textContent.replace(/\n|\t/g, '').trim(),
        payRangeEl
    );
    }

    await page.$eval(
        "button.show-more-less-html__button",
        element => element.click()
    )
    
    const details = await page.$eval(
        'div.show-more-less-html__markup.relative.overflow-hidden',
        element => element.textContent.trim()
    
    );

    const jobCriteria = await page.$$eval(
        ".description__job-criteria-item",
        nodes => nodes.map(node =>{
            
            const criteria = node.querySelector("h3").textContent.trim()
            const prioity = node.querySelector("span").textContent.trim()
            return {criteria,prioity}
        })
    );
    let jobDetails = {
        "numberOfApplicants": numberOfApplicants,
        "payRange": payRange,
        "details": details,
        "criteria": jobCriteria
    }
    
    console.log(jobDetails)
    await browser.close();
    return jobDetails;
    
}


app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm) return res.status(400).json({ error: 'Missing Search Term/Keyword ' });

  try {
   
    let linkedinJobs = await scrape(encodeURI(searchTerm));
    res.json({ Linkedin_Jobs: linkedinJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

app.post('/details', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'Missing Search Term/Keyword ' });

  try {
   
    let jobDetails = await getJobDetails(url);
    res.json({ Job_Details: jobDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`Scraper API running on ${PORT}`);
});
