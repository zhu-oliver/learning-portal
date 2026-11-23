import { fill, highlight, pairs, search, sequence, sort, type ActivityBank } from "./builders";

export const readingActivities: ActivityBank = {
  "listening-and-language-listening-and-speaking": [
    sequence("Order a respectful response to an unclear instruction.", ["Listen to the whole instruction.", "Ask which part you do not understand.", "Restate it to check your understanding."], "Listening and clarification help both speakers understand."),
    fill("Restating someone's idea in your own words is", "paraphrasing", "Paraphrasing checks meaning without simply repeating every word."),
    sort("Sort conversation behaviours.", ["Supports the conversation", "Interrupts understanding"], [["Ask a relevant question", 0], ["Talk over the speaker", 1], ["Give the other person time to answer", 0]], "Turn-taking and relevant responses support communication."),
  ],
  "listening-and-language-word-knowledge-and-fluency": [
    pairs("Match word parts to their meanings.", [["re-", "Again"], ["un-", "Not"], ["-ful", "Full of"]], "Word parts can help explain unfamiliar words."),
    fill("In reread, the prefix re- means", "again", "Reread means read again."),
    search(["READ", "WORD", "PAUSE"], "Readers use word knowledge and meaningful pauses; finding words alone does not assess fluent reading."),
  ],
  "listening-and-language-sentence-grammar": [
    sort("Sort the words by their role.", ["Noun", "Verb"], [["Garden", 0], ["Run", 1], ["Teacher", 0], ["Listen", 1]], "Nouns name; these verbs describe actions."),
    fill("In 'The bird sings', the word describing the action is", "sings", "Sings is the verb in this sentence."),
    pairs("Match sentences to their type.", [["Please close the gate.", "Command"], ["Where is the gate?", "Question"], ["The gate is blue.", "Statement"]], "Purpose and punctuation help identify sentence types."),
  ],
  "listening-and-language-precise-conventions": [
    highlight("Highlight misspelled words.", ["The", "freind", "brought", "a", "pencel", "."], [1, 4], "Friend and pencil are the correct spellings."),
    fill("The punctuation at the end of 'Where are you' is a question", "mark", "A direct question ends with a question mark."),
    sort("Sort these sentence openings.", ["Correct capitalization", "Needs a capital"], [["Maya reads.", 0], ["maya reads.", 1], ["We read.", 0]], "Names and sentence beginnings take capital letters."),
  ],
  "text-explorers-text-features": [
    pairs("Match text features to their use.", [["Heading", "Introduces a section"], ["Caption", "Explains an image"], ["Glossary", "Defines topic words"]], "Text features help locate and understand information."),
    fill("A list showing topics and their page numbers is a table of", "contents", "A table of contents helps you find sections."),
    sort("Sort places to look.", ["Find the meaning of a topic word", "Find a chapter's starting page"], [["Glossary", 0], ["Table of contents", 1], ["Definition box", 0]], "Different features answer different reading questions."),
  ],
  "text-explorers-inference-and-monitoring": [
    pairs("Match clues to supported inferences.", [["A child shivers and puts on a coat.", "The child may be cold."], ["A child smiles after receiving good news.", "The child may feel pleased."]], "A supported inference connects an actual clue to a plausible idea."),
    fill("A detail used to support an inference is", "evidence", "Evidence links an interpretation to the text."),
    sequence("Order a reading repair strategy.", ["Notice that a sentence is unclear.", "Reread and check nearby clues.", "Revise your understanding."], "Monitoring helps detect and repair confusion."),
  ],
  "text-explorers-summary-and-synthesis": [
    sort("Sort details for a summary of a child learning to ride a bicycle.", ["Main event", "Minor detail"], [["The child practises and learns to balance.", 0], ["The bicycle has a small sticker.", 1], ["The child succeeds after several tries.", 0]], "A summary focuses on important events rather than every detail."),
    fill("A short account of the main ideas is a", "summary", "A summary uses your own words to capture key ideas."),
    pairs("Match reading actions.", [["Summarize", "State the main ideas briefly"], ["Synthesize", "Combine ideas into a new understanding"], ["Quote", "Use the source's exact words with credit"]], "These are different ways to use information from texts."),
  ],
  "text-explorers-literary-devices": [
    pairs("Match each example to a device.", [["As quiet as a mouse", "Simile"], ["The wind whispered", "Personification"], ["Bright, bold birds", "Alliteration"]], "Devices use comparison, human qualities, or repeated sounds."),
    fill("A comparison using 'like' or 'as' is a", "simile", "A simile explicitly compares unlike things."),
    sort("Sort descriptions.", ["Literal", "Figurative"], [["The room is two metres wide.", 0], ["The room is a sea of books.", 1], ["There are five books on the desk.", 0]], "Figurative language suggests an image beyond the literal wording."),
  ],
  "critical-media-citizens-persuasion": [
    sort("Sort advertising statements.", ["Verifiable fact", "Opinion"], [["The package contains ten pencils.", 0], ["These are the world's best pencils.", 1], ["The pencil is 15 cm long.", 0]], "Facts can be checked; opinions express judgments."),
    fill("The people a message is meant to reach are its", "audience", "Creators choose words and images for a particular audience."),
    pairs("Match persuasive choices to their effect.", [["Urgent slogan", "Encourages quick action"], ["Emotional image", "Appeals to feelings"], ["Evidence", "Supports a claim that can be checked"]], "Persuasive effects do not automatically prove a claim."),
  ],
  "critical-media-citizens-sources-and-privacy": [
    sort("Sort details for public sharing.", ["Usually safe general information", "Private personal information"], [["A favourite fictional book title", 0], ["A home address", 1], ["An account password", 1]], "Do not publish information that could expose someone's identity or account."),
    fill("Naming where information came from identifies the", "source", "Sources help readers check claims and credit creators."),
    sequence("Order a careful response to an online claim.", ["Identify who published it.", "Check relevant reliable evidence.", "Decide what the evidence supports."], "Verify a claim before treating it as true."),
  ],
  "critical-media-citizens-accessible-media": [
    pairs("Match accessibility supports.", [["Captions", "Written representation of speech and relevant sounds"], ["Alternative text", "Text describing an image's purpose"], ["Readable contrast", "Text distinguishable from its background"]], "Different supports help people access different information."),
    fill("A text description for a meaningful image is alternative", "text", "Alternative text communicates the image's useful information."),
    sort("Sort design choices.", ["Adds an alternative way to understand", "Relies only on one cue"], [["Label a correct answer with text and colour", 0], ["Show only green or red with no explanation", 1], ["Provide a transcript for spoken information", 0]], "Do not rely on colour or sound alone."),
  ],
  "authors-workshop-planning-writing": [
    sequence("Order planning before drafting.", ["Choose a purpose and audience.", "Collect relevant ideas.", "Organize the ideas into a plan."], "A plan should serve the purpose and reader."),
    fill("The person or group who will read your text is the", "audience", "Think about the reader when choosing details."),
    pairs("Match writing purposes to useful forms.", [["Thank someone", "Thank-you note"], ["Explain how to do something", "Procedure"], ["Tell events about a character", "Story"]], "Choose a form that supports the purpose."),
  ],
  "authors-workshop-drafting": [
    sort("Sort sentences for a paragraph about growing a seed.", ["Fits the paragraph", "Changes the topic"], [["The seed needs water.", 0], ["A shoot appears after several days.", 0], ["My bicycle has a new bell.", 1]], "Relevant details keep a draft focused."),
    fill("A first version of a piece of writing is a", "draft", "A draft can be changed as ideas become clearer."),
    sequence("Order events in a short draft.", ["I chose a seed.", "I planted it in soil.", "I watered it.", "I watched for a shoot."], "A chronological account follows the order of events."),
  ],
  "authors-workshop-revision-and-publishing": [
    pairs("Match writing stages.", [["Revise", "Improve meaning and organization"], ["Proofread", "Check spelling and punctuation"], ["Publish", "Prepare and share a finished text"]], "Improve meaning before checking the final conventions."),
    fill("Adding a missing detail to clarify meaning is", "revision", "Revision changes the content, not just the spelling."),
    highlight("Highlight misspelled words in this draft.", ["Our", "class", "made", "a", "beutiful", "postar", "."], [4, 5], "Beautiful and poster are the correct spellings."),
  ],
  "identity-and-connections-literacy-connections": [
    pairs("Match reading connections.", [["Text-to-self", "Connect to your own experience"], ["Text-to-text", "Compare with another text"], ["Text-to-world", "Connect to a wider situation"]], "A useful connection helps explain the text."),
    fill("A relevant connection should help you understand the", "text", "A connection is useful when it deepens understanding rather than changing the topic."),
    sort("Sort connections to a story about helping a new classmate.", ["Relevant connection", "Unrelated detail"], [["I remember welcoming a new child.", 0], ["Another story shows someone feeling left out.", 0], ["My shoes are green.", 1]], "Relevant connections relate to the story's ideas."),
  ],
  "identity-and-connections-identity-and-perspectives": [
    sort("Sort statements about people and communities.", ["Respects a specific perspective", "Generalizes unfairly"], [["This author describes her own experience.", 0], ["Everyone in that community thinks the same way.", 1], ["Other voices may offer different experiences.", 0]], "One person's voice does not represent every person in a community."),
    fill("A person's way of viewing an issue is their", "perspective", "Different experiences can lead to different perspectives."),
    pairs("Match respectful reading practices.", [["Context", "Consider who speaks and in what situation"], ["Attribution", "Name the creator"], ["Comparison", "Notice similarities and differences without stereotypes"]], "Read community-authored material with context and respect."),
  ],
  "word-building-workshop-word-parts": [
    search(["PREFIX", "ROOT", "SUFFIX"], "Prefixes go before a base; suffixes go after it."),
    fill("In unhappy, un- is a", "prefix", "Un- comes before the base happy."),
    pairs("Match words to their word-part meanings.", [["Rewrite", "Write again"], ["Careless", "Without care"], ["Helpful", "Full of help or giving help"]], "Word parts provide clues to meaning."),
  ],
  "word-building-workshop-spelling-patterns": [
    highlight("Highlight misspelled words.", ["She", "carries", "two", "boxs", "and", "three", "babys", "."], [3, 6], "Boxes adds -es; babies changes consonant-y to -ies."),
    fill("The plural of 'city' is", "cities", "For consonant-y, change y to i and add -es."),
    sort("Sort plural spellings.", ["Correct", "Needs correction"], [["foxes", 0], ["dishs", 1], ["berries", 0]], "Dishes needs -es; berries uses the consonant-y pattern."),
  ],
  "word-building-workshop-vocabulary-application": [
    pairs("Match words to their meanings.", [["Obstacle", "Something in the way"], ["Patient", "Able to wait calmly"], ["Companion", "Someone who spends time with you"]], "Choose a meaning that fits the word and context."),
    fill("A person who walks along a road is a", "pedestrian", "Pedestrian refers to someone travelling on foot."),
    sort("Sort uses of 'brittle'.", ["Fits the meaning", "Does not fit the meaning"], [["The dry twig snapped easily because it was brittle.", 0], ["The soft cushion was brittle because it bent easily.", 1], ["The thin cracker was brittle.", 0]], "Brittle means easily broken or snapped."),
  ],
  "read-between-the-lines": [
    sequence("Order Maya's story.", ["Maya plants a seed.", "She checks the pot.", "A shoot appears.", "She shares the news."], "The story follows waiting, growth and celebration."),
    fill("Maya grins and runs to share the news. These clues suggest she feels", ["excited", "happy", "pleased"], "Her actions support an inference about excitement or happiness."),
    sort("Sort details for a summary of Maya's seed story.", ["Main event", "Minor setting detail"], [["Maya waits for the seed to grow.", 0], ["The pot sits on a windowsill.", 1], ["Maya celebrates the shoot.", 0]], "A summary focuses on the important events."),
  ],
};
