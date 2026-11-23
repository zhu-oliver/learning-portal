import { french } from "../french";
import type { Lesson } from "../types";
import { course, study } from "./course";

function withPictures(lesson: Lesson, practiceSlug: string): Lesson {
  const words = french.lessons.find((practice) => practice.slug === practiceSlug)?.frenchWords;
  if (!words || words.length !== 10) throw new Error(`Missing ten-word French picture set: ${practiceSlug}`);
  return { ...lesson, frenchWords: words };
}

export const frenchCourses = [
  withPictures(course("french", "bonjour-les-animaux", "Bonjour ! Talking about animals", "A–B · Listening and speaking; C–D · Reading and writing",
    "Learn ten animal words with pictures and French audio, then use them to listen, ask questions, read, and write.", [
      study("Listen for meaning and ask for help", ["A1.1", "A1.2", "A2.1", "A2.2", "A2.3"],
        "Use a picture and a purpose before listening. Listen for familiar words first, then listen again for details; you do not need to understand every word immediately. Bonjour means hello. Voici un chat means here is a cat. Est-ce que tu aimes les animaux ? asks whether you like animals. To ask for repetition, say Répétez, s'il vous plaît. To request slower speech, say Plus lentement, s'il vous plaît. The audio cards below model French nouns; listen, point to the picture, and repeat. This quiz checks strategy knowledge, while actual listening needs an adult observation.",
        "Listen to all ten animal cards without looking at their English meanings. Ask an adult to play three cards while you point to the corresponding images. Use the repetition request when needed and describe a strategy that helped. Adult check: understanding spoken words, appropriate help requests, and reflection; do not score these skills from the written quiz alone.",
        [
          ["Which phrase politely requests repetition?", ["Bonjour !", "Répétez, s'il vous plaît.", "J'aime le chat."], 1, "Répétez, s'il vous plaît means repeat, please."],
          ["Before listening, which strategy helps?", ["Use the context and pictures to predict meaning", "Give up if one word is unfamiliar", "Ignore the purpose"], 0, "Context and visuals support listening comprehension."],
        ]),
      study("Speak and interact", ["B1.1", "B1.2", "B1.3", "B2.1", "B2.2", "B2.3", "B3.2"],
        "Practise a short exchange: Bonjour ! — Bonjour ! Quel animal aimes-tu ? — J'aime le chat. Et toi ? — J'aime le chien. Merci ! Au revoir ! The question asks which animal you like; Et toi ? means and you? Learn an animal's article with its noun rather than choosing it from the English word. Listen to French pronunciation, speak at a comfortable pace, and use gestures or pictures to support meaning. Take turns, respond to what was actually said, and ask for clarification. French is spoken in many communities with different accents; there is not only one way every speaker sounds.",
        "Use the animal cards to perform the model exchange with an adult or partner, changing the animal each time. Listen to the card before speaking and practise pronunciation. Ask and answer an extra question using a model from an adult. Reflect on clarity, turn-taking, and one improvement. Adult check: meaningful responses and understandable speech.",
        [
          ["What does J'aime le chat express?", ["I like the cat", "Where is the cat?", "Please repeat"], 0, "J'aime expresses liking."],
          ["In a conversation, Et toi ? invites...", ["Silence forever", "The other person's response", "A written test only"], 1, "Et toi ? means and you? and invites a turn."],
        ]),
      study("Read with clues and write a message", ["C1.1", "C1.2", "C1.3", "C1.4", "C2.1", "C2.2", "C2.3", "D1.1", "D1.2", "D2.1", "D2.2", "D2.3", "D2.4"],
        "Original mini-text: Bonjour ! Je m'appelle Alex. J'aime le chat et le lapin. Voici mon dessin. The greeting and first-person statements show a short introduction. Je m'appelle means my name is. Use familiar words, images, and related English/French words when useful, then verify rather than assuming every similar word means the same thing. Write from a model: plan your message, draft, check noun articles and accents, and revise for clarity. A dictionary or classroom word wall can help. Explain what the text says and what clues support your interpretation.",
        "Read the mini-text aloud accurately with an adult and identify greeting, name, and liked animals. Set an audience and purpose, brainstorm a four-line introduction, organize it, draft with imaginary names and a drawing, and revise after feedback. Check accents, noun forms, and present-tense model verbs. Reflect on reading/writing strengths and next goals. Adult check: comprehension, fluent reading, full writing process, conventions, and strategies.",
        [
          ["Which animals does Alex like in the mini-text?", ["The dog and fish", "The cat and rabbit", "The horse and bird"], 1, "Le chat is the cat and le lapin is the rabbit."],
          ["What does Je m'appelle introduce?", ["A price", "A location", "A person's name"], 2, "Je m'appelle means my name is."],
        ]),
      study("Francophone communities and respectful comparison", ["A3.1", "A3.2", "B3.1", "B3.2", "C3.1", "C3.2", "D3.1", "D3.2"],
        "French is used in Ontario and in many other communities in Canada and around the world. A Francophone is a French-speaking person; people may use several languages and identify in different ways. A person's culture cannot be guessed from one word or accent. Before listening to or reading a community resource, identify its creator, place, purpose, and audience. Compare a specific greeting, text, or activity respectfully and notice both similarities and differences. Do not generalize one example to every Francophone community.",
        "With an adult, choose a short age-appropriate French text and audio from a named Ontario Francophone creator. Identify familiar words, a cultural detail, and a courtesy convention; compare respectfully with your experience. Share a brief rehearsed oral message and write a model-supported postcard with greeting, closing, and a date following the model's convention. Cite the source. Adult check: all four skills, Ontario community context, conventions, and attribution.",
        [
          ["Francophone usually describes...", ["A person who speaks French", "Only someone born in France", "A person who never uses another language"], 0, "Francophone refers to French-speaking people in many communities."],
          ["A respectful cultural comparison should...", ["Generalize one example to everyone", "Use a specific source and avoid stereotypes", "Rank whole cultures as better or worse"], 1, "Specific context supports a fair comparison."],
        ]),
    ]), "animals"),
  withPictures(course("french", "au-marche", "Au marché : food and polite requests", "A–B · Listening and speaking; C–D · Reading and writing",
    "Study ten food words, listen for an order, read a simple list, and practise a polite exchange and written message.", [
      study("Listen for key details", ["A1.1", "A1.2", "A2.1", "A2.2", "A2.3"],
        "At a market, a listener may need to identify an item and quantity. Listen for familiar nouns and numbers, use pictures, and confirm details. Je voudrais une pomme, s'il vous plaît means I would like an apple, please. Deux pommes means two apples. Merci means thank you. A useful response can confirm the request instead of guessing. Say Pardon ? or ask for repetition when needed. Notice tone and gestures, but verify words that matter. After listening, reflect on which strategy helped and what remains uncertain.",
        "Play the food-card audio and identify each picture. With an adult who can model French or an approved audio resource, listen to three short food requests and point to the correct items and quantities. Repeat to confirm and request clarification when needed. Adult check: actual spoken understanding, key details, appropriate response, and reflection.",
        [
          ["What does Je voudrais une pomme request?", ["A pear", "An apple", "A pencil"], 1, "Une pomme is an apple."],
          ["If the quantity is unclear, you should...", ["Guess without checking", "Ignore it", "Ask for repetition or confirmation"], 2, "Clarification helps avoid a mistaken order."],
        ]),
      study("Interact politely for a purpose", ["B1.1", "B1.2", "B1.3", "B2.1", "B2.2", "B2.3", "B3.2"],
        "A model exchange: Bonjour ! — Bonjour ! Je voudrais du pain, s'il vous plaît. — Voici le pain. — Merci ! Au revoir ! The speaker uses a greeting, a request, thanks, and a closing. Du pain refers to some bread; use the supplied model rather than translating every English word separately. Food nouns in the cards include their dictionary articles; phrases can use different determiners depending on context. Prepare key words, practise pronunciation, and adjust when your partner asks a question. A real interaction requires listening as well as memorizing lines.",
        "Create a pretend market with the ten food pictures and no real purchases. Practise requests using an adult-supported model, switch roles, and respond to a changed item. Record on paper what you understood and one speaking goal; no audio recording is required. Adult check: purposeful requests, clear pronunciation, polite conventions, and responsive turn-taking.",
        [
          ["Which phrase makes a request polite?", ["S'il vous plaît", "Buy now in English", "Only a louder voice"], 0, "S'il vous plaît means please."],
          ["Why should you listen while role-playing?", ["The other person's response may change what you say", "Only memorized lines matter", "Listening is unrelated to conversation"], 0, "Interaction requires responding to another speaker."],
        ]),
      study("Read and create functional texts", ["C1.1", "C1.2", "C1.3", "C1.4", "C2.1", "C2.2", "C2.3", "D1.1", "D1.2", "D2.1", "D2.2", "D2.3", "D2.4"],
        "Original shopping list: deux pommes; une banane; du pain. The list is a functional text: brief items help a person remember a purpose. A menu organizes available food and may include prices; a greeting card uses a different form and audience. Use headings, numbers, pictures, and known words as reading clues. Read the whole item, not only the familiar noun. To write a list, identify purpose, select words from a reliable model, draft, check accents and forms, and revise. Share it with a reader and ask whether the meaning is clear.",
        "Read the sample list and explain each item. Write an original list with three food items using adult-supported quantity models, then a short polite note to go with it. Use a word wall or dictionary to verify words. Ask an adult for feedback and revise. Adult check: reading details, suitable text form, legible writing, and an explained revision.",
        [
          ["How many apples are on the sample list?", ["One", "Two", "Three"], 1, "Deux pommes means two apples."],
          ["Which feature suits a shopping list?", ["Brief item entries", "An unrelated long story only", "No identifiable items"], 0, "A list organizes items for a practical purpose."],
        ]),
      study("Culture, context, and self-reflection", ["A3.1", "A3.2", "B3.1", "C3.1", "C3.2", "D3.1", "D3.2"],
        "Food words appear in menus, markets, family stories, and community events, but no single food represents every French-speaking person. Read or listen to a specific Francophone creator's public text and identify its context. Notice how audience and purpose affect polite language and text form. Compare what you learned with a familiar experience and ask a thoughtful question. Reflect separately on listening, speaking, reading, and writing: being able to match a noun to a picture does not show all four skills. Set one practical next goal.",
        "With an adult, explore a short French menu/text and audio from a named Ontario Francophone source. Identify a courtesy expression and contextual detail, compare respectfully, and cite the source. Share one discovery orally and in a short model-supported note with suitable greetings/closing. Set a goal for each language skill. Adult check: actual listening/reading, oral/written cultural messages, conventions, and reflection.",
        [
          ["What does a food-picture matching score demonstrate directly?", ["Every French speaking skill", "Recognition of those word-picture links", "Complete cultural knowledge"], 1, "Matching checks vocabulary recognition, not full language proficiency."],
          ["A useful next goal is...", ["I will use a polite request clearly in my next exchange", "I will know every French word immediately", "I will avoid all feedback"], 0, "A specific goal supports practice and observable progress."],
        ]),
    ]), "food"),
  withPictures(course("french", "dans-mon-sac", "Dans mon sac : objects and everyday messages", "A–B · Listening and speaking; C–D · Reading and writing",
    "Learn ten everyday object words and use them in listening, interaction, short texts, and a revised written message.", [
      study("Listen and follow a message", ["A1.1", "A1.2", "A2.1", "A2.2", "A2.3"],
        "Voici un livre means here is a book. Où est le livre ? asks where the book is. Listen for the object word and use the situation to understand the message. Before listening, set a goal; during listening, note key words; afterward, confirm meaning and reflect. Non-verbal cues can help but do not replace checking unclear information. The object cards below provide French audio and images. Actual listening practice should include identifying words without reading the answer and responding to a short spoken model.",
        "Listen to the ten object cards, then ask an adult to play selected cards while you identify the corresponding pictures. Practise a short question-and-response model supported by a capable speaker or approved audio resource. Ask for clarification and explain your listening strategy. Adult check: spoken-word recognition, relevant responses, and self-reflection.",
        [
          ["What does Où est le livre ? ask?", ["Where is the book?", "Do you like apples?", "What is your name?"], 0, "Où est asks where something is; le livre is the book."],
          ["After listening, a useful step is...", ["Never check meaning", "Confirm what you understood and note uncertainty", "Assume every word was understood"], 1, "Checking supports comprehension and identifies a next step."],
        ]),
      study("Describe and ask questions", ["B1.1", "B1.2", "B1.3", "B2.1", "B2.2", "B2.3", "B3.2"],
        "A model exchange: Qu'est-ce que c'est ? — C'est un livre. — Merci ! Qu'est-ce que c'est ? asks what is it? C'est introduces an identification. Use the correct modelled noun form and a picture to support meaning. You can prepare a simple presentation about items in an imaginary bag, choosing familiar words and clear organization. Speak audibly at a suitable pace, listen to feedback, and revise. Ask and answer in turn rather than reciting unrelated words. Accents and pronunciation take practice; focus on understandable meaning and respectful interaction.",
        "Use pictures of three objects in a pretend bag. Present them in French with an adult-supported model, then answer a partner's question. Switch roles and ask your own question. Use card audio to improve pronunciation and identify a specific speaking goal. Adult check: clear presentation, correct model use, meaningful interaction, and response to feedback.",
        [
          ["Qu'est-ce que c'est ? means...", ["What is it?", "Goodbye", "Please speak faster"], 0, "The question requests an identification."],
          ["C'est un livre identifies...", ["A chair", "A book", "A banana"], 1, "Un livre is a book."],
        ]),
      study("Read, plan, draft, and revise", ["C1.1", "C1.2", "C1.3", "C1.4", "C2.1", "C2.2", "C2.3", "D1.1", "D1.2", "D2.1", "D2.2", "D2.3", "D2.4"],
        "Original note: Bonjour Sam ! Voici un livre et un crayon. Merci ! Alex. The greeting, object words, thanks, and signature make a short note. Use text features and familiar vocabulary to infer purpose, then check the details. Write for an identified audience using a model, but make your message original. Plan what to say, draft, verify spelling and accents, ask for feedback, revise, and prepare a legible final copy. Think about which strategies helped in both reading and writing. A completed process can be shown through drafts and discussion, not only a recognition quiz.",
        "Read the sample note and identify sender, recipient, and objects. Write your own note about two objects using imaginary names, consult a word wall or dictionary, and keep a draft and final copy. Ask an adult whether the message is clear, revise one part, and explain the change. Adult check: comprehension, appropriate form, original composition, conventions, and reflection.",
        [
          ["Who signs the sample note?", ["Sam", "Alex", "The book"], 1, "Alex appears as the signature at the end."],
          ["Which objects are mentioned?", ["A book and pencil", "A chair and bed", "An apple and banana"], 0, "Un livre is a book and un crayon is a pencil."],
        ]),
      study("Read and hear community voices", ["A3.1", "A3.2", "B3.1", "C3.1", "C3.2", "D3.1", "D3.2"],
        "Francophone communities create signs, stories, announcements, and other texts for particular purposes and audiences. A school notice in Ontario and a museum label in another French-speaking region may use some shared words and different contextual details. Identify the specific creator and place rather than assuming all French-speaking communities are alike. Connect spoken and written information, ask about unfamiliar details, and compare respectfully. Use your own words to describe learning and name the source. Understanding culture involves ongoing listening and reading, not a checklist of stereotypes.",
        "With an adult, select an age-appropriate French text and audio from a named Ontario Francophone resource. Identify purpose, familiar words, courtesy conventions, a cultural detail, and a question. Compare respectfully. Share a brief oral discovery and write a note using suitable greeting/closing/date models. Cite the source and reflect on goals. Adult check: community context, comprehension, oral/written sharing, and conventions.",
        [
          ["How should you describe a community text?", ["Name its creator, place, purpose, and evidence", "Assume it represents every French speaker", "Ignore its audience"], 0, "Specific context helps explain meaning without stereotyping."],
          ["An unfamiliar detail should lead you to...", ["Invent an explanation as fact", "Ask or consult an appropriate source", "Reject the whole text"], 1, "Questions and reliable sources support cultural and language understanding."],
        ]),
    ]), "everyday-objects"),
];
