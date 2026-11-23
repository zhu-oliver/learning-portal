import type { Question } from "../types";

type Check = readonly [prompt: string, options: readonly string[], answerIndex: number, explanation: string];
type Assessment = readonly (readonly Check[])[];

const assessments: Readonly<Record<string, Assessment>> = {
  "listening-and-language": [
    [
      ["After a partner explains a game, which response shows active listening?", ["Repeat the main steps in your own words and check an unclear rule", "Talk over them about another game", "Pretend to understand every rule"], 0, "Paraphrasing and a relevant clarification check understanding."],
      ["You explain a process to a younger child. Which choice best supports that audience?", ["Unexplained technical words", "Clear steps, familiar words, and a suitable pace", "Speak as fast as possible"], 1, "Communication strategies should fit the listener and purpose."],
    ],
    [
      ["What does the prefix in repaint suggest?", ["Never paint", "Paint quietly", "Paint again"], 2, "Re- often means again, so repaint means paint again."],
      ["A reader rushes and misses punctuation. What would better support meaning?", ["Accurate reading with natural phrases and expression", "Only greater speed", "Skipping unfamiliar words"], 0, "Fluency combines accuracy, pace, and expression, not speed alone."],
    ],
    [
      ["Which sentence keeps the subject and verb in agreement?", ["The dogs runs outside.", "The dog runs outside.", "The dog run outside."], 1, "The singular subject dog takes runs."],
      ["In 'Nora brought a hat because the sun was strong', what does because show?", ["A list", "A greeting", "A reason"], 2, "Because connects an action with its cause or reason."],
    ],
    [
      ["Which sentence correctly capitalizes a proper adjective?", ["We read a Canadian story.", "We read a canadian story.", "We Read a canadian Story."], 0, "Canadian comes from the proper name Canada and takes a capital."],
      ["Which command correctly addresses Mina?", ["Mina please, wait.", "Mina, please wait.", "mina please wait"], 1, "A direct-address comma separates the person named from the request."],
    ],
  ],
  "text-explorers": [
    [
      ["An article describes items from left to right across a room. Which organization is used?", ["Time sequence", "Only a problem and solution", "Spatial order"], 2, "Spatial order organizes information by location."],
      ["A narrator says 'I opened the door.' What is a limitation of this viewpoint?", ["The narrator may not know other characters' private thoughts", "It cannot describe its own actions", "It must know everything happening everywhere"], 0, "First person presents one narrator's experience and knowledge."],
    ],
    [
      ["Original passage: 'Ari checked the clock, tied her shoes, and hurried out before breakfast.' Which inference has evidence?", ["Ari dislikes shoes", "Ari may be worried about being late", "Ari has no clock"], 1, "Checking time and hurrying support a possible concern about lateness."],
      ["Your prediction conflicts with later details. What should you do?", ["Keep the prediction regardless", "Ignore later details", "Revise the prediction using the new evidence"], 2, "Predictions should be checked and changed as the text supplies information."],
    ],
    [
      ["Original text: 'Trees give shade. Their roots help hold soil. They also provide homes for animals.' Which main idea fits?", ["Trees support their surroundings in several ways", "Trees provide only shade", "Animals never use trees"], 0, "The main idea connects the three benefits rather than selecting just one."],
      ["A summary should include...", ["Every minor detail", "The central idea and key supporting details in a shorter form", "Only the reader's unrelated opinion"], 1, "A summary keeps important meaning while reducing length."],
    ],
    [
      ["Original sentence: 'The tired door groaned as it opened.' What effect does this device create?", ["It proves the door is a person", "It states a shopping price", "It gives the door human-like qualities to create mood"], 2, "Personification describes a non-human object through human qualities."],
      ["Original events: 'Tess planted seeds. Rain washed some away. Jo helped her replant.' What caused the replanting?", ["The rain washed seeds away", "Jo forgot the garden", "The seeds had already grown"], 0, "The lost seeds explain why Tess and Jo replanted."],
    ],
  ],
  "critical-media-citizens": [
    [
      ["An ad says 'Buy before midnight or miss out!' Which technique is it using?", ["A balanced scientific comparison", "Urgency to influence a purchase", "A neutral source list"], 1, "A deadline can pressure an audience to act quickly."],
      ["A review praises an item but hides that its writer sells it. What should a critical reader consider?", ["The review must be complete", "The item has no features", "The writer's interest may bias the message"], 2, "A financial interest can affect which evidence and perspectives are presented."],
    ],
    [
      ["Two websites disagree about a fact. What is the most useful next step?", ["Check their creators, evidence, dates, and another reliable source", "Choose the prettier site", "Believe the one with more capital letters"], 0, "Source evaluation and corroboration are better than visual appearance."],
      ["You want to include a classmate's photo in an online post. What should you do?", ["Post it without asking", "Seek appropriate permission and adult guidance first", "Add their address too"], 1, "Sharing someone else's information requires respect for privacy and permission."],
    ],
    [
      ["A warning poster uses colour alone to show danger. How can it become more accessible?", ["Make the text smaller", "Remove all symbols", "Add readable words and a clear symbol"], 2, "Multiple cues convey meaning to people who cannot distinguish the colours."],
      ["Readers misunderstand your poster's action. What design step should follow?", ["Revise the message using their feedback", "Blame the readers and keep it", "Remove its audience"], 0, "Testing and revision help the design communicate its intended purpose."],
    ],
  ],
  "authors-workshop": [
    [
      ["You want to explain how to care for a plant. What planning choice fits best?", ["An unrelated personal message", "An instructional text with ordered steps", "A price-only list"], 1, "The form and sequence suit an explanation of a process."],
      ["You find useful research for your report. How should you record it?", ["Copy without credit", "Hide the source", "Use your own notes and record the source"], 2, "Original notes and source tracking support accurate, responsible writing."],
    ],
    [
      ["You draft a message for young readers. Which voice best supports the audience?", ["Clear, welcoming wording with explained unfamiliar terms", "Unexplained specialist language throughout", "Insults aimed at the reader"], 0, "Tone and word choice should help the intended audience understand."],
      ["Your draft claims everyone agrees with you, but you asked only one friend. What needs attention?", ["Only the font size", "The unsupported viewpoint and possible bias", "Nothing because it is your draft"], 1, "Writers should examine perspective and unsupported generalizations in their own texts."],
    ],
    [
      ["Your paragraph's ideas are out of order. Which action improves it most?", ["Fix only one spelling error", "Add decorative borders", "Reorganize ideas and add clear transitions"], 2, "Revision improves organization and meaning, not just conventions."],
      ["You prepare a final slide from your revised draft. What should you check before sharing?", ["Accuracy, readable design, source credit, and privacy", "Only how many colours it has", "Whether you removed all evidence"], 0, "A responsible final presentation combines clear communication with safe sharing."],
    ],
  ],
  "identity-and-connections": [
    [
      ["A science explanation includes labelled observations and a clear conclusion. Which skills connect?", ["Only decoration", "Literacy communication and scientific reasoning", "Neither literacy nor science"], 1, "Clear language communicates the evidence and reasoning of science."],
      ["After feedback, which next goal is specific and useful?", ["Become perfect immediately", "Never ask for help", "Explain one conclusion with two supporting observations"], 2, "A specific strategy gives an observable way to improve."],
    ],
    [
      ["You read one author's account of a community. Which conclusion is fair?", ["It offers that author's perspective in a particular context", "It proves every community member has the same experience", "It describes all cultures identically"], 0, "One account should not be generalized to all people."],
      ["How can a reader respectfully learn from Indigenous creators' texts?", ["Invent cultural details to fill gaps", "Name the creator and community, use evidence, and follow sharing guidance", "Treat all Indigenous peoples as interchangeable"], 1, "Specific attribution and respectful engagement recognize distinct contexts."],
    ],
  ],
  "word-building-workshop": [
    [
      ["Which word uses a prefix meaning again?", ["Careful", "Replay", "Kindness"], 1, "Replay adds re- to play, meaning play again."],
      ["A reader sees the new word joyful. Which clue helps its meaning?", ["Its number of letters only", "Its first letter only", "The base joy and suffix -ful"], 2, "Meaningful parts connect joyful with being full of joy."],
    ],
    [
      ["Which plural follows the consonant-plus-y pattern?", ["Babies", "Babys", "Babyes"], 0, "In baby, a consonant precedes y, which changes to i before es."],
      ["Which is the standard plural of key?", ["Keies", "Keys", "Keyes"], 1, "A vowel precedes y, so y stays and s is added."],
    ],
    [
      ["In 'The bat flew out of the cave', what does bat mean?", ["Sports equipment", "A paint tool", "A flying mammal"], 2, "Flew and cave provide context for the animal meaning."],
      ["Which task shows vocabulary applied beyond a recognition quiz?", ["Use a word accurately in an original sentence", "Count its letters only", "Choose it randomly from a list"], 0, "Original use demonstrates how meaning fits a new context."],
    ],
  ],
  "habitat-investigators": [
    [
      ["A pond has enough nesting spaces for only a small number of birds. What does this illustrate?", ["An unlimited population", "A habitat resource limiting population size", "Birds needing no shelter"], 1, "Limited resources contribute to a habitat's carrying capacity."],
      ["Which feature is a structural adaptation for swimming?", ["A bird liking blue", "A habitat's name", "Webbed feet"], 2, "Webbing helps move water and supports swimming in that habitat."],
    ],
    [
      ["In algae → small fish → heron, which organism receives energy directly from the algae?", ["Small fish", "Heron", "Algae itself only"], 0, "The arrow shows energy passing from algae to the fish that eats it."],
      ["An animal eats both seeds and insects. How is its diet classified?", ["Herbivore", "Omnivore", "Carnivore only"], 1, "Omnivores eat both plant and animal material."],
    ],
    [
      ["A species disappears from a food web. Why may several other species be affected?", ["Every species is independent", "Only the water's colour matters", "Feeding relationships connect their resources"], 2, "Connected food chains can spread the effects of depletion or extinction."],
      ["A community considers paving a wetland. What would a balanced assessment include?", ["Benefits to people and costs to habitats from multiple perspectives", "Only the shortest construction time", "Ignoring wildlife and residents"], 0, "Habitat decisions can have several positive and negative consequences."],
    ],
  ],
  "light-and-sound-lab": [
    [
      ["A book blocks a flashlight and creates a dark patch behind it. What explains the patch?", ["The book emits darkness", "The opaque book blocks the light path", "Sound bends around the book"], 1, "A shadow forms where an object prevents light from reaching a surface."],
      ["A polished metal surface sends light back toward you. Which process is involved?", ["Refraction", "Vibration", "Reflection"], 2, "Reflection redirects light at a surface."],
    ],
    [
      ["A guitar string stops vibrating. What happens to the sound it produces?", ["It dies away as the vibration stops", "It grows forever", "It no longer needs a medium"], 0, "Sound production depends on vibrations transferring energy to the surrounding material."],
      ["Soft furnishings reduce an echo mainly by...", ["Creating empty space", "Absorbing some sound energy", "Making every sound louder"], 1, "Absorbing material reduces reflected sound."],
    ],
    [
      ["Outdoor lighting disturbs nearby nocturnal animals. Which change reduces the impact while keeping useful lighting?", ["Point more light into the habitat", "Leave every light on all day", "Shield and time the lights for needed areas"], 2, "Targeted lighting limits unnecessary exposure while retaining its purpose."],
      ["A review of a hearing device should consider...", ["Its access benefits and limitations for users", "Only its colour", "Only whether it is the newest model"], 0, "Societal effects include how a device meets different people's needs."],
    ],
  ],
  "mechanism-makers": [
    [
      ["A pulley changes a downward pull into an upward movement of a load. What has it changed?", ["The load into energy", "The direction of force", "The need for any input"], 1, "A pulley can redirect an applied force without creating energy."],
      ["In a lever, why is identifying the fulcrum useful?", ["It is always the load", "It makes the lever weightless", "It shows the point around which the lever turns"], 2, "The fulcrum is the pivot, helping explain the lever's movement and force."],
    ],
    [
      ["A 30-tooth gear drives a 10-tooth gear. How many turns does the small gear make per large-gear turn?", ["Three", "One", "Ten"], 0, "Thirty teeth passing produce three groups of ten."],
      ["A crank and linkage make a slider move back and forth. What is the mechanism doing?", ["Stopping all motion", "Transforming rotary motion into back-and-forth motion", "Creating energy from nothing"], 1, "Mechanisms can change the form of motion while transmitting it."],
    ],
    [
      ["Your design must use only cardboard and string. What kind of requirement is this?", ["A completed test result", "A performance success", "A material constraint"], 2, "Constraints limit how a design can be made."],
      ["Two devices do the same job. Which comparison best considers environmental impact?", ["Compare materials, energy use, waste, and noise", "Compare only their names", "Assume all devices have identical effects"], 0, "Environmental effects can differ across materials, operation, and disposal."],
    ],
  ],
  "rock-detectives": [
    [
      ["Two rock samples share a colour but have different grains and layers. What should classification use?", ["Colour alone", "Several stated physical properties", "The owner's favourite name"], 1, "Consistent multiple criteria provide stronger classification evidence."],
      ["A building stone contains several different mineral grains. What is it?", ["Necessarily one pure mineral", "A human-made animal", "A rock composed of minerals"], 2, "A rock may contain multiple minerals."],
    ],
    [
      ["Molten material cools and solidifies. Which rock type forms?", ["Igneous", "Sedimentary", "Metamorphic without melting"], 0, "Igneous rocks form through cooling molten material."],
      ["Sediment buries an organism's trace and preserves it as rock forms. What may result?", ["A sound wave", "A fossil providing evidence about past life", "An electrical circuit"], 1, "Preserved remains or traces can record past organisms and environments."],
    ],
    [
      ["Why include manufacturing and disposal when assessing a mineral product?", ["Only mining has any effect", "Disposal erases every earlier effect", "Impacts can occur throughout the product's lifecycle"], 2, "Extraction, processing, use, recycling, and disposal all can affect people and environments."],
      ["You study a community's choice of stone for a tool. Which explanation is strongest?", ["Connect the stone's useful properties with a named community's public account", "Invent a tradition for every community", "Describe colour without checking its use"], 0, "Geological knowledge involves material properties, purpose, and accurately attributed context."],
    ],
  ],
  "stem-and-code": [
    [
      ["You compare flashlight transmission through materials. Which plan best tests material effects?", ["Change the lamp, distance, and material together", "Keep lamp and distance alike and change the material", "Record only a guess"], 1, "Changing one factor while controlling conditions supports a fair experiment."],
      ["Three trials disagree. What should your report do?", ["Hide two trials", "Declare certainty without evidence", "Record all results and discuss uncertainty"], 2, "Honest reporting includes variation and the limits of the evidence."],
    ],
    [
      ["A program starts with resource = 10 and subtracts 2 in each of four repeats. What remains?", ["2", "4", "8"], 0, "10 - 2 - 2 - 2 - 2 = 2."],
      ["A simulation leaves out weather and disease. How should its output be interpreted?", ["As perfect proof about every habitat", "As a model with stated limitations", "As unrelated to its assumptions"], 1, "Missing real-world factors limit what the simulation can predict."],
    ],
    [
      ["A project combines water measurements, mapping, and community interviews. What does it demonstrate?", ["Science isolated from every other subject", "Only one occupation can help", "Cross-subject knowledge addressing a real problem"], 2, "Scientific work can connect data, geography, communication, and community knowledge."],
      ["How should you describe a contributor's work?", ["Use reliable sources and name the people or community accurately", "Invent an achievement", "Assume all communities made the same contribution"], 0, "Accurate attribution respects diverse contributions and their contexts."],
    ],
  ],
  "bonjour-les-animaux": [
    [
      ["You hear an unfamiliar animal word beside several pictures. Which listening plan helps?", ["Ignore the pictures", "Use the context, listen again, and ask for help if needed", "Assume it is always a cat"], 1, "Visual context and clarification support understanding rather than guessing."],
      ["Which request asks someone to speak more slowly?", ["Au revoir !", "Merci !", "Plus lentement, s'il vous plaît."], 2, "Plus lentement means more slowly."],
    ],
    [
      ["A partner asks Quel animal aimes-tu ? Which answer fits?", ["J'aime le chien.", "Au revoir le livre.", "Deux pommes."], 0, "The question asks which animal you like; the answer says you like the dog."],
      ["What makes a rehearsed exchange a real interaction?", ["Ignoring every response", "Listening and adapting your reply to your partner", "Reciting unrelated lines"], 1, "Interaction involves meaningful responses to another person's message."],
    ],
    [
      ["Read: 'Bonjour ! Je m'appelle Zoé. J'aime le chien et le cheval.' Which pair does Zoé like?", ["Cat and rabbit", "Apple and bread", "Dog and horse"], 2, "Le chien is the dog and le cheval is the horse."],
      ["You draft an introduction from a French model. Which step improves the final text?", ["Check articles and accents, then revise after feedback", "Remove the audience", "Copy an unrelated text without understanding"], 0, "Checking basic conventions and clarity supports the writing process."],
    ],
    [
      ["A French audio comes from an Ontario community creator. What should you identify when discussing its culture?", ["Assume it represents every French speaker", "The creator, community, context, and a supported detail", "Only its duration"], 1, "Specific context avoids stereotyping and supports intercultural understanding."],
      ["A postcard to share that learning should use...", ["No recipient or purpose", "An invented fact about all cultures", "An appropriate greeting, supported message, and closing"], 2, "Purposeful form and accurate cultural information support a respectful written message."],
    ],
  ],
  "au-marche": [
    [
      ["A request says deux bananes. How many bananas are requested?", ["Two", "Three", "One"], 0, "Deux means two and bananes means bananas."],
      ["You recognize the food word but miss the number. What is a useful response?", ["Choose any quantity", "Ask to hear the quantity again and confirm it", "Ignore the whole interaction"], 1, "Clarifying key details improves listening accuracy."],
    ],
    [
      ["Which response politely acknowledges receiving a requested item?", ["Qu'est-ce que c'est ?", "Plus lentement.", "Merci !"], 2, "Merci expresses thanks in the exchange."],
      ["A partner changes their order during the pretend market. What should you do?", ["Listen to the change and respond to the new item", "Continue the old order regardless", "Stop listening entirely"], 0, "Purposeful interaction requires adapting to the speaker's message."],
    ],
    [
      ["Read the new list: 'une poire; deux bananes; du pain'. Which item has quantity two?", ["The pear", "The bananas", "The bread"], 1, "Deux bananes names two bananas."],
      ["How does a menu's organization help a reader?", ["It hides every available food", "It replaces all words with unrelated drawings", "It groups available items and may show prices"], 2, "A menu's features serve its practical purpose."],
    ],
    [
      ["You compare a named Ontario Francophone menu with a familiar one. Which conclusion is respectful?", ["Describe specific similarities and differences without generalizing", "Claim every French-speaking family eats identically", "Rank whole cultures by one menu"], 0, "A contextual comparison does not turn one text into a stereotype."],
      ["Which reflection identifies a practical speaking goal?", ["I will never need practice", "I will pronounce my next food request more clearly after listening to a model", "I will avoid all conversation"], 1, "The goal connects an observable skill with a useful practice strategy."],
    ],
  ],
  "dans-mon-sac": [
    [
      ["You hear Voici un crayon. Which object is introduced?", ["A book", "A banana", "A pencil"], 2, "Un crayon is a pencil; voici introduces it."],
      ["Why set a purpose before listening to a message?", ["It helps you focus on the details you need", "It guarantees every word is familiar", "It replaces listening"], 0, "A listening purpose directs attention without removing the need to check meaning."],
    ],
    [
      ["You show a book and answer C'est un livre. What function does your answer serve?", ["A goodbye", "Identifying the object", "Requesting a quantity"], 1, "C'est introduces what something is."],
      ["Which practice helps a short French presentation be understandable?", ["Race through unfamiliar words", "Use no support or feedback", "Prepare familiar words and practise pace and pronunciation"], 2, "Preparation and modelled pronunciation support clear speech."],
    ],
    [
      ["Read: 'Bonjour Lina ! Voici un crayon. Merci ! Jules.' Who receives the note?", ["Lina", "Jules", "The pencil"], 0, "The greeting addresses Lina; Jules is the sender's signature."],
      ["After an adult points out an unclear part in your French note, what should you do?", ["Publish without checking", "Revise using the model and check the message again", "Replace it with random words"], 1, "Feedback, revision, and basic conventions improve clarity."],
    ],
    [
      ["A French notice is for an Ontario community event. Which reading question helps understand it?", ["How can I ignore its audience?", "Does one notice describe every culture?", "Who created it, for whom, and for what purpose?"], 2, "Creator, audience, and purpose help establish cultural and text context."],
      ["When sharing a discovery from a community text, what matters?", ["Accurate source credit and a respectful, model-supported message", "Inventing details to make it exciting", "Avoiding any context"], 0, "Accurate attribution and suitable oral or written conventions support respectful communication."],
    ],
  ],
  "number-builders": [
    [
      ["A library has 8,063 books. Which expanded form matches?", ["8,000 + 600 + 3", "8,000 + 60 + 3", "800 + 60 + 3"], 1, "The 6 is in the tens place, so it contributes 60."],
      ["A crowd estimate rounds 7,682 to the nearest thousand. What should it report?", ["7,000", "7,700", "8,000"], 2, "7,682 is nearer to 8,000 than to 7,000."],
    ],
    [
      ["Equal pizzas are shared equally: one among five children, another among ten. Who gets the larger individual share?", ["A child in the five-person group", "A child in the ten-person group", "Both shares are equal"], 0, "One fifth of the same-sized whole is larger than one tenth."],
      ["You take eight steps of one quarter on a number line starting at zero. Where do you finish?", ["1", "2", "8"], 1, "Eight quarters make two wholes: 8 × 1/4 = 2."],
    ],
    [
      ["A ribbon is 6/10 of a metre long. Which decimal records its length?", ["0.06 m", "6.0 m", "0.6 m"], 2, "Six tenths is written 0.6."],
      ["Which length is greatest?", ["0.7 m", "0.4 m", "0.6 m"], 0, "Seven tenths is greater than six tenths and four tenths."],
    ],
  ],
  "operation-strategies": [
    [
      ["Which mental strategy correctly finds 9 × 6?", ["10 × 6 + 6", "10 × 6 - 6", "10 × 6 - 9"], 1, "Nine groups of six are one group of six fewer than ten groups."],
      ["A machine makes 35 pieces per batch. What are 100 batches worth?", ["350 pieces", "35,000 pieces", "3,500 pieces"], 2, "35 × 100 is 3,500: each unit of 35 is scaled by one hundred."],
    ],
    [
      ["A trail is 5.8 km long and a connecting path adds 1.5 km. What is the total?", ["7.3 km", "6.13 km", "7.13 km"], 0, "5.8 + 1.5 = 7.3, exchanging thirteen tenths for one whole and three tenths."],
      ["A store starts with 8,420 cards and sells 2,185. How many remain?", ["6,345", "6,235", "10,605"], 1, "8,420 - 2,185 = 6,235; adding 2,185 back checks the result."],
    ],
    [
      ["There are 124 stickers on each of six sheets. How many stickers are there?", ["624", "734", "744"], 2, "6 × (100 + 20 + 4) = 600 + 120 + 24 = 744."],
      ["Three children share 98 metres of divisible ribbon equally. What length does each receive?", ["32 2/3 m", "32 1/3 m", "33 m"], 0, "98 ÷ 3 gives 32 remainder 2; the two remaining metres split into thirds."],
    ],
    [
      ["Four cups each hold 1/6 litre. How much do they hold together?", ["4/24 litre", "4/6 litre", "5/6 litre"], 1, "Repeated addition of one sixth four times is 4 × 1/6 = 4/6."],
      ["Each bracelet needs five beads. How many beads are needed for nine bracelets?", ["14", "40", "45"], 2, "The constant rate is five beads per bracelet: 9 × 5 = 45."],
    ],
  ],
  "patterns-and-code": [
    [
      ["A tile pattern has 5, 9, 13, 17 tiles. Using a constant increase, how many are in the fifth stage?", ["21", "20", "34"], 0, "Each stage adds four tiles, so 17 + 4 = 21."],
      ["A table lists positions 1, 2, 3 with values 0.3, 0.6, 0.9. Which rule fits?", ["Add 0.1 at each step", "Multiply the position by 0.3", "Multiply the position by 3"], 1, "The value is three tenths times its position."],
    ],
    [
      ["A box plus 16 marbles makes 39 marbles. What number belongs in the box?", ["55", "16", "23"], 2, "39 - 16 = 23, and 23 + 16 verifies 39."],
      ["Which whole number satisfies n + 5 < 9?", ["3", "4", "5"], 0, "3 + 5 = 8, less than 9; 4 gives equality and 5 is greater."],
    ],
    [
      ["Code repeats twice; inside each repeat it moves five steps three times. How many steps altogether?", ["10", "30", "15"], 1, "Nested repetition produces 2 × 3 × 5 = 30 steps."],
      ["Two characters must move at the same time. Which event arrangement fits?", ["Sequential only", "No events", "Concurrent"], 2, "Concurrent events run together rather than one after the other."],
    ],
    [
      ["You model transport for 34 people in six-seat vehicles. What is the minimum number of vehicles?", ["6", "5", "34"], 0, "Five carry 30; a sixth is needed for the remaining four."],
      ["A seating model assumes every seat is usable. You learn two seats are broken. What next?", ["Ignore the broken seats", "Revise the capacity assumption and recalculate", "Erase the attendance data"], 1, "A real-world model must be checked against changed constraints."],
    ],
  ],
  "data-and-chance": [
    [
      ["A stem-and-leaf key says 2 | 4 = 24. What values does 3 | 1 5 represent?", ["31 and 35", "3 and 15", "13 and 53"], 0, "The stem holds the tens and each leaf the ones."],
      ["You compare two groups' votes for the same three activities. Which display directly compares each category?", ["An unlabelled picture", "A multiple-bar graph with a legend", "A single number with no categories"], 1, "Grouped bars with a legend distinguish both groups within each activity."],
    ],
    [
      ["For the values 1, 4, 4, 7, what are mean, median, and mode?", ["All 7", "All 1", "All 4"], 2, "The total is 16, mean 4; middle values are 4, and 4 is most frequent."],
      ["A graph shows 14 votes for cycling and 8 for walking. Which argument is supported?", ["Cycling received six more votes in this data set", "Every person everywhere prefers cycling", "Walking had no votes"], 0, "14 - 8 = 6; the sample does not support claims about everybody."],
    ],
    [
      ["An equal-section spinner has eight green sections and two orange. Which describes green?", ["Impossible", "Likely, but not certain", "Certain"], 1, "Eight of ten outcomes are green, but orange is still possible."],
      ["Where does a certain event belong on a probability line?", ["At 0", "At 1/2", "At 1"], 2, "Probability 1 represents certainty; 0 represents impossibility."],
    ],
    [
      ["Group A records 1, 1, 4 and Group B records 2, 2, 2. Which measure matches?", ["Mean only", "Median only", "All three measures"], 0, "Both means are 2, but A's median and mode are 1 while B's are 2."],
      ["Before comparing averages for two populations, what makes the task a prediction test?", ["Change data until they match", "Predict likelihood with a reason, then calculate and compare", "Look at the answer first and claim you predicted it"], 1, "A prediction precedes testing; calculation supplies evidence for the comparison."],
    ],
  ],
  "shape-and-measure": [
    [
      ["Which pair of sides of a rectangle is perpendicular?", ["Opposite sides", "Any sides that never meet", "Adjacent sides meeting at a corner"], 2, "Adjacent sides meet at a right angle and are perpendicular."],
      ["An angle is 120 degrees. How is it classified?", ["Obtuse", "Acute", "Right"], 0, "120 degrees is greater than 90 and less than 180."],
    ],
    [
      ["A point moves from (1, 4) to (4, 4). What translation occurred?", ["Three units up", "Three units right", "Three units left"], 1, "The x-coordinate increases by three; the y-coordinate stays the same."],
      ["A shape is reflected across a grid line. What stays unchanged?", ["Its position always", "Its orientation always", "Its size and shape"], 2, "Reflection flips orientation but preserves the figure's dimensions."],
    ],
    [
      ["A jug contains 1,500 mL. Which equivalent capacity is correct?", ["1.5 L", "15 L", "150 L"], 0, "1,000 mL is one litre, leaving half a litre."],
      ["A workshop runs from 10:50 to 12:15. How long does it last?", ["75 minutes", "85 minutes", "125 minutes"], 1, "Ten minutes to 11:00, sixty to 12:00, and fifteen more total 85."],
    ],
    [
      ["A rectangular garden has area 35 m² and width 5 m. What is its length?", ["30 m", "175 m", "7 m"], 2, "Length is area divided by width: 35 ÷ 5 = 7."],
      ["Why does multiplying rectangle length by width give area?", ["It counts equal square units in rows and columns", "It adds the distances around the edge", "It measures only the corners"], 0, "An array has length-many units in each of width-many rows."],
    ],
  ],
  "money-decisions": [
    [
      ["Items cost $14, $8, and $7, without tax. What change comes from $50?", ["$29", "$21", "$19"], 1, "The total is $29, so $50 - $29 = $21."],
      ["Which payment normally uses money already in a bank account rather than borrowing?", ["Credit", "A loan", "Debit"], 2, "Debit generally draws from account funds; credit is borrowing."],
    ],
    [
      ["Two comparable packs cost $10 for five pencils or $9 for three. Which has better unit-price value?", ["Five for $10", "Three for $9", "Both cost the same per pencil"], 0, "The first is $2 per pencil and the second is $3."],
      ["You keep some earnings for later and give some to a community cause. What are these actions?", ["Borrowing and spending", "Saving and donating", "Investing and borrowing"], 1, "Saving keeps money for later; donating gives money to support a cause."],
    ],
  ],
  "mathematical-thinking": [
    [
      ["A learner feels overwhelmed by a long problem. Which next step supports learning?", ["Work without breaks even when distressed", "Hide the problem forever", "Pause, try a smaller example, and seek focused help"], 2, "Coping actions and a manageable strategy help the learner continue constructively."],
      ["Your calculation differs from your estimate. What should you do?", ["Check the steps with another method", "Assume the calculation is always correct", "Remove the estimate without thinking"], 0, "Comparing methods can reveal an error or show why the estimate differed."],
    ],
    [
      ["A partner gets the right answer by another method. Which response helps collaboration?", ["Demand they use your method", "Ask them to show why it works", "Ignore their explanation"], 1, "Listening to reasoning helps compare and connect valid strategies."],
      ["Which explanation gives mathematical evidence?", ["It feels right", "I wrote a long answer", "My array has six rows of four, so it represents 6 × 4"], 2, "The representation explains the relationship instead of just asserting an answer."],
    ],
  ],
};

export function getAssessmentQuestions(slug: string, sectionCount: number): readonly Question[] {
  const assessment = Object.hasOwn(assessments, slug) ? assessments[slug] : undefined;
  if (!assessment || assessment.length !== sectionCount || assessment.some((checks) => checks.length < 2)) {
    throw new Error(`A complete independent end-of-lesson assessment is required for ${slug}.`);
  }
  return assessment.flatMap((checks, sectionIndex) =>
    checks.map(([prompt, options, answerIndex, explanation], index) => ({
      id: `final-${sectionIndex}-${index}`, sectionIndex, prompt, options, answerIndex, explanation,
    })),
  );
}
