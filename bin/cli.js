const dotenv = require('dotenv');
dotenv.config();

const { OpenAI } = require('langchain/llms/openai');

async function main () {
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
  });

  const res = await model.call(
    'What would be a good company name a company that makes colorful socks?'
  );

  console.log(res);
}

main();
