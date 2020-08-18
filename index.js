require('dotenv').config();
const axios = require('axios');
const program = require('commander');
const fs = require('fs').promises;
const csv = require('csv/lib/sync');
const env = require('env');

program
  .version('0.0.1')
  .option('-d, --dry-run', 'Dry run')
  .parse(process.argv);

const url = `${env.JIRA_URL}/rest/api/3/issue/bulk`;
const headers = {
  Authorization: `Basic ${env.BASIC_AUTH_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
const template = {
  update: {},
  fields: {
    summary: '{{title}}',
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              'text': '{{desc}}',
              'type': 'text',
            },
          ],
        },
      ],
    },
    issuetype: {
      id: `${env.JIRA_ISSUE_TYPE_ID}`,
    },
    components: [],
    project: {
      id: `${env.JIRA_PROJECT_ID}`,
    },
    reporter: {
      id: `${env.REPORTER_USER_ID}`,
    },
    labels: [],
  },
};

async function postIssue(postData) {
  if (program.dryRun) {
    console.log(`request to: ${url}`);
    console.log(JSON.stringify(postData));
    return;
  }
  try {
    const res = await axios.post(url, postData, { headers });
    console.log(`res.status: ${res.status}`);
    console.log(`res.data: ${JSON.stringify(res.data)}`);
  } catch (e) {
    console.error('** Error occurred **');
    if (e.response) {
      console.error(JSON.stringify(e.response.data));
      console.error(e.response.status);
      console.error(JSON.stringify(e.response.headers));
    } else if (e.request) {
      console.error(JSON.stringify(e.request));
    } else {
      console.error(e.message);
    }
    console.error(JSON.stringify(e.config));
  }
}

async function parseCsv() {
  const content = await fs.readFile(`${__dirname}/csv/list.tsv`);
  const records = csv.parse(content, { delimiter: '\t', from: 2 });
  const parsedRecords = records.map(record => {
    return {
      title: `[${record[0]}] ${record[1]}`,
      desc: `${record[2]}`,
      est: `${record[3]}`,
    };
  });
  return parsedRecords;
}

(async () => {
  const postDataList = await parseCsv();
  const issueUpdates = postDataList.map(data => {
    const t = JSON.stringify(template);
    return JSON.parse(
      t.replace('{{title}}', data.title)
        .replace('{{desc}}', data.desc)
        .replace('{{est}}', data.est)
        .replace(/\n/g, '')
    );
  });
  await postIssue({ issueUpdates });
})();
