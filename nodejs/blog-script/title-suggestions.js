const readline = require("node:readline/promises");
const { spawnSync } = require("node:child_process");

const FRONTMATTER_PATTERN = /^---(\r?\n)([\s\S]*?)^---(?=\r?\n|$)/m;
const TITLE_PATTERN = /^([ \t]*title[ \t]*:)[ \t]*(.*)$/im;

const isEmptyTitle = (value) => {
  const normalized = value.trim().toLowerCase();
  return ["", "''", '""', "null", "~"].includes(normalized) || normalized.startsWith("#");
};

const needsTitle = (content) => {
  const frontmatter = content.match(FRONTMATTER_PATTERN);
  if (!frontmatter) return true;

  const title = frontmatter[2].match(TITLE_PATTERN);
  return !title || isEmptyTitle(title[2]);
};

const parseSuggestions = (output) => {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("Pi did not return title suggestions as JSON");

  const suggestions = JSON.parse(output.slice(start, end + 1));
  if (
    !Array.isArray(suggestions) ||
    suggestions.length !== 3 ||
    suggestions.some((title) => typeof title !== "string" || !title.trim())
  ) {
    throw new Error("Pi did not return exactly three title suggestions");
  }

  return suggestions.map((title) => title.trim());
};

const suggestTitles = (content) => {
  const prompt = `Read the blog post supplied through stdin and suggest exactly three concise, specific titles.
Base every suggestion only on the post content.
Return only a JSON array containing three strings. Do not use Markdown or add commentary.`;

  const result = spawnSync("pi", ["-p", "--no-tools", "--no-session", "--no-context-files", prompt], {
    input: content,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || "Pi title suggestion failed");

  return parseSuggestions(result.stdout.trim());
};

const chooseTitle = async (file, suggestions) => {
  console.log(`\n${file} has no title. Pi suggests:`);
  suggestions.forEach((title, index) => console.log(`${index + 1}. ${title}`));

  const input = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const answer = (await input.question("Choose a title [1-3]: ")).trim();
      if (["1", "2", "3"].includes(answer)) return suggestions[Number(answer) - 1];
      console.log("Enter 1, 2, or 3.");
    }
  } finally {
    input.close();
  }
};

const addTitle = (content, title) => {
  const yamlTitle = JSON.stringify(title);
  const frontmatter = content.match(FRONTMATTER_PATTERN);

  if (!frontmatter) return `---\ntitle: ${yamlTitle}\n---\n${content}`;

  const fields = frontmatter[2];
  const updatedFields = TITLE_PATTERN.test(fields)
    ? fields.replace(TITLE_PATTERN, (_line, prefix) => `${prefix} ${yamlTitle}`)
    : `title: ${yamlTitle}${frontmatter[1]}${fields}`;

  return content.replace(FRONTMATTER_PATTERN, () => `---${frontmatter[1]}${updatedFields}---`);
};

const addSuggestedTitle = async (content, file) => {
  if (!needsTitle(content)) return content;

  const suggestions = suggestTitles(content);
  const title = await chooseTitle(file, suggestions);
  return addTitle(content, title);
};

module.exports = { addSuggestedTitle, addTitle, needsTitle, parseSuggestions };
