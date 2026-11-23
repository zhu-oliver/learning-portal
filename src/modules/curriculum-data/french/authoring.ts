import type { Lesson, Question } from "../../types";
import type { ImmersionLesson } from "../../french-immersion";
import { french } from "../../french";
import { fill, highlight, pairs, search, sequence, sort, type ActivitySet } from "../../activities/builders";
import type { Problem } from "../../problems";
import type { GradeContent } from "../types";
import { expectationInventory, sourceFor } from "./expectations";

export type Check = readonly [prompt: string, answer: string, distractor: string, otherDistractor: string, explanation: string];
export type Scene = readonly [heading: string, text: string, task: string, check: Check];
export type Topic = {
  slug: string;
  title: string;
  scenes: readonly [Scene, Scene, Scene];
  words: readonly [string, string, string];
  links: readonly (readonly [string, string])[];
  gap: readonly [before: string, answer: string, after: string];
  listening?: readonly [passage: string, check: Check];
  pictures?: readonly [string, string, string];
};

const roles = ["instructions", "story-listening", "interaction", "presentation", "story-reading", "functional-reading", "writing", "language", "media", "communities"] as const;
type Role = typeof roles[number];

const mappings: Record<Role, readonly (readonly string[])[]> = {
  instructions: [["A1.1", "A1.2"], ["A1.1", "A1.2"], ["A2.1", "A2.3"]],
  "story-listening": [["A1.1", "A1.2"], ["A1.2", "A2.2"], ["A2.1", "A2.3"]],
  interaction: [["A2.1", "B2.1"], ["A2.2", "B2.2"], ["A2.3", "B2.3"]],
  presentation: [["B1.1", "B1.2"], ["B1.3"], ["B1.1", "B2.3"]],
  "story-reading": [["C1.1", "C1.2"], ["C1.2", "C1.3"], ["C1.4", "C2.3"]],
  "functional-reading": [["C2.1", "C2.2"], ["C1.1", "C1.2", "C1.4"], ["C2.3"]],
  writing: [["D1.1", "D1.2", "D2.1"], ["D2.2"], ["D2.3", "D2.4"]],
  language: [["C1.4", "D2.3"], ["D1.2", "D2.2"], ["D2.3", "D2.4"]],
  media: [["A1.1", "A1.2"], ["C2.1", "C2.2"], ["B1.2", "D1.1", "D1.2"]],
  communities: [["A3.1", "A3.2"], ["B3.1", "B3.2", "C3.1", "C3.2"], ["D3.1", "D3.2"]],
};

// Each role has a distinct teaching method. Authored scenes supply the actual
// grade-specific texts, evidence, language work, and transfer questions.
const methods: Record<Role, readonly [string, string, string]> = {
  instructions: [
    "Choose a listening purpose before the speaker begins: you need actions, locations, or conditions, not a translation of every syllable. Predict from the situation, then listen once for the whole job and again for the details. Sketch a reminder rather than reading an answer while the message is spoken.",
    "Separate action words from order and position words. A drawing can preserve a location; numbered notes can preserve a sequence. Listen to the whole direction before moving materials. When two details appear to conflict, replay the message instead of silently choosing the detail you prefer.",
    "Repair a specific gap with a courteous question and confirm the answer in your own words. Repetition, a slower pace, and an explanation solve different difficulties. After carrying out the instruction, compare the actual result with the spoken message and choose one listening strategy to reuse.",
  ],
  "story-listening": [
    "Listen for people, setting, and a change rather than isolated vocabulary. Imagine events without adding facts that the speaker did not supply. On a second listening, make a short timeline. Retelling the gist should preserve the important relationships even when you use different words.",
    "Distinguish what the speaker states from what you infer. An action, a pause, or a stated reason can support an interpretation, but several feelings may fit the same clue. Explain your evidence and leave room for uncertainty. Listen again to test whether your first explanation still fits.",
    "Compare two interpretations by returning to the heard evidence, not by voting for a favourite answer. Ask a partner what they heard, restate it fairly, and revise when a detail changes your understanding. Name both a successful listening move and a difficulty you will address next time.",
  ],
  interaction: [
    "An exchange has a shared purpose and changes with each response. Prepare useful question starters without memorizing both sides. Face the speaker or use an accessible listening position, wait for a turn, and request a precise clarification when a key word or condition is unclear.",
    "Answer the information actually requested, then extend the exchange with a related question or reason. You may disagree with an idea while respecting its speaker. Reformulate the partner's proposal before proposing another option so that your response demonstrates listening as well as speaking.",
    "Rehearse the language, then repeat the task with an unexpected but reasonable partner response. Notice whether you maintained the topic, repaired confusion, and reached the shared goal. Ask for one specific clarity suggestion; use that feedback in a second exchange and describe the change.",
  ],
  presentation: [
    "Plan for a real listener: decide what they should understand or be able to do afterwards. Select a few relevant ideas, give them a logical order, and use brief cue notes rather than an entire script. A beginning establishes the topic; an ending reminds listeners of the important message.",
    "Understandable speech involves phrasing, pronunciation, pace, and expression, not merely volume. Listen to a capable model and practise difficult sound groups within meaningful phrases. Pause at idea boundaries. Different francophone voices have different accents; clarity does not require imitating one identity.",
    "Try the presentation for a listener who does not already know your plan. Invite a question and check whether your answer addresses it. A peer can report an unclear moment rather than assign a vague score. Rehearse the revised passage, then explain which change made the message easier to follow.",
  ],
  "story-reading": [
    "Preview the title and form, make a tentative prediction, and read to test it. Track who does what and why. A prediction is useful only when it can change after reading. Mark a detail that supports your interpretation and a question the text leaves open rather than inventing a missing fact.",
    "Read a short passage aloud in meaning groups, observing punctuation and dialogue. Resolve an unfamiliar word before practising fluency; fast guessing is not accurate reading. Explain how an event or image develops the message, using the author's actual details rather than only your own experience.",
    "Use nearby words, a related word, and a suitable dictionary or word wall to verify vocabulary. Similar French and English forms can be clues, not guarantees. Compare a first and second reading, identify the strategy that changed your understanding, and choose a specific reading goal.",
  ],
  "functional-reading": [
    "Identify the text form, its audience, and its job. Headings, labels, dates, columns, and numbered steps do different kinds of work. Describe how a feature helps a reader find or use information. A missing feature can matter more than decorative colour when the reader must act on the text.",
    "Read across the whole relevant line or column before making a decision. Conditions, exceptions, and units can change the meaning of a number or instruction. Verify unfamiliar vocabulary with context and a reliable language resource. Point to the exact evidence supporting your response.",
    "Use the information for a small practical task and then check the outcome against the text. Tell a partner how you found the necessary detail and which feature helped. If your first attempt was wrong, locate the overlooked clue and change the reading strategy rather than simply memorizing an answer.",
  ],
  writing: [
    "Choose a reader and a communicative purpose, then gather and organize the necessary ideas. A plan may be a drawing, a list, or a paragraph outline. Select a suitable form and consult a model for its conventions without copying its personal content. Leave out private identifying information.",
    "Draft for meaning before polishing every accent. Ask whether the intended reader has enough information and can follow the order. Feedback should name a specific gap or unclear relationship. Revision can add, remove, or reorganize ideas; editing alone cannot repair missing content.",
    "Edit using a short, relevant checklist, then proofread the revised text and prepare a legible final version. Compare drafts and explain a meaning change separately from a spelling correction. Keep evidence of planning and revision; a recognition quiz cannot demonstrate the full writing process.",
  ],
  language: [
    "Examine a meaningful sentence before naming its language pattern. Check how the chosen words connect to the person, object, action, or time described. A model and a dictionary can help verify forms; neither should replace thinking about the intended message. Read the corrected sentence for sense.",
    "Choose words and sentence links that communicate the intended relationship. Precision may require replacing a vague word, distinguishing a cause from an order, or varying repeated language. Explain what the new wording changes for the reader instead of treating a longer sentence as automatically better.",
    "Apply a focused language check to your own draft, not only to an isolated exercise. Verify spelling, agreement, sentence order, and punctuation relevant to the model you used. Read aloud to locate confusion, ask for feedback, and record a before-and-after example that explains your editing choice.",
  ],
  media: [
    "A media message has a creator, an audience, and a purpose. Listen to its words and notice how pace, sound, and emphasis attract attention. Enjoying a message does not make every claim reliable. Separate a factual statement from a preference or invitation and ask what evidence would support it.",
    "Read the words together with layout and images. Ask what the message highlights and what useful information it leaves out. Compare the presentation with its intended audience and purpose. Explain a response using a specific feature rather than claiming that all advertisements or all pictures work alike.",
    "Create an original small media message with a clearly named audience and purpose. Make deliberate choices about words, sound, and layout. Include the information the audience needs and avoid unsupported claims. Ask a listener or reader to explain what they understood; revise the message after that feedback.",
  ],
  communities: [
    "Choose an adult-approved public resource made by a named francophone community member or organization in the required region. Record creator, place, date, purpose, and audience. Listen to an actual excerpt in French; do not substitute an invented account for a community voice or infer identity from an accent.",
    "Read a related community-authored text and locate its community on a map. Describe only details the resource supports, compare one specific connection with your experience, and ask a respectful open question. Observe greetings, forms of address, and register in their context rather than prescribing one universal custom.",
    "Write a short response or introduction that credits the real source and respects its audience. Practise presenting the information orally, using the source's context and suitable social language. Separate a quotation from your own paraphrase. State what remains unknown and how another community source could help.",
  ],
};

const frenchMethods: Record<Role, readonly [string, string, string]> = {
  instructions: [
    "Avant l'écoute, choisis ton but : trouver une action, un endroit ou une condition. Imagine la situation, puis écoute une première fois pour comprendre la tâche entière. À la deuxième écoute, repère les détails utiles. Un petit dessin peut garder une idée sans montrer les mots que l'adulte prononce.",
    "Les verbes indiquent les actions. Les mots de position indiquent où agir; les mots d'ordre indiquent quand agir. Écoute toute la consigne avant de déplacer les objets. Tu peux numéroter tes dessins. Si deux détails semblent différents, demande une nouvelle écoute au lieu de choisir au hasard.",
    "Une question précise aide à réparer une difficulté. Tu peux demander de répéter, de parler moins vite ou d'expliquer un mot. Redis ensuite ce que tu as compris. Vérifie ton travail avec le message oral. Nomme une stratégie utile et choisis une petite amélioration pour la prochaine écoute.",
  ],
  "story-listening": [
    "Écoute pour trouver les personnages, le lieu et le changement important. Imagine les événements sans ajouter des faits absents du récit. Une deuxième écoute aide à placer les moments dans l'ordre. Un résumé garde les idées essentielles, même si tu utilises des mots différents de ceux du narrateur.",
    "Distingue une information entendue d'une idée que tu déduis. Un geste, une parole ou une raison peut soutenir ton interprétation. Plusieurs émotions restent parfois possibles. Explique l'indice qui t'aide et dis ce que tu ne sais pas encore. Réécoute pour vérifier si ton idée convient toujours.",
    "Compare ton interprétation avec celle d'un partenaire. Demande ce qu'il a entendu et redis son idée avec respect. Retournez aux mots du récit pour vérifier vos raisons. Tu peux changer d'avis grâce à un détail. Nomme une réussite d'écoute et un obstacle; choisis une stratégie pour cet obstacle.",
  ],
  interaction: [
    "Une conversation sert à faire quelque chose ensemble. Prépare des questions utiles, mais ne décide pas de toutes les réponses de ton partenaire. Attends ton tour et montre que tu écoutes. Si une information importante est incertaine, pose une question précise avant de poursuivre l'échange.",
    "Réponds à la question réellement posée, puis ajoute une raison ou une question liée au sujet. Tu peux proposer une autre idée sans manquer de respect. Redis d'abord la proposition de ton partenaire. Ta réponse montre alors que tu as compris son idée, même si vous ne choisissez pas la même solution.",
    "Essaie l'échange, puis recommence avec une réponse nouvelle de ton partenaire. Vérifie si vous avez gardé le sujet, clarifié une difficulté et atteint votre but. Demande un conseil précis sur la clarté. Utilise ce conseil dans un deuxième essai et explique ce qui a changé dans ta façon de parler.",
  ],
  presentation: [
    "Pense aux personnes qui vont t'écouter. Que doivent-elles comprendre ou pouvoir faire après ton message? Choisis quelques idées utiles et place-les dans un ordre clair. Un dessin ou de courtes notes peuvent te guider. Présente ton sujet au début et rappelle l'idée importante à la fin.",
    "Pour être compris, travaille les groupes de mots, la prononciation, le débit et l'expression. Parler très fort ne remplace pas un message clair. Écoute un modèle compétent et répète une phrase difficile avec son sens. Fais une pause entre les idées. Les accents francophones sont variés.",
    "Présente ton message à une personne qui ne connaît pas ton plan. Invite une question et réponds à ce qu'elle demande. Le partenaire peut nommer un passage difficile à suivre. Modifie ce passage, essaie encore et explique comment ton changement aide le public à comprendre le message.",
  ],
  "story-reading": [
    "Observe le titre et la forme du texte. Fais une prédiction, puis lis pour la vérifier. Cherche qui agit, ce qui change et pourquoi. Une prédiction peut changer après la lecture. Trouve un détail qui soutient ton idée et une question laissée ouverte; n'invente pas un fait pour remplir le vide.",
    "Lis un court passage à voix haute par groupes de sens. La ponctuation et les paroles des personnages guident les pauses et l'expression. Vérifie un mot inconnu avant de chercher la fluidité. Lire vite en devinant n'est pas lire avec précision. Explique ton interprétation avec un détail du texte.",
    "Pour comprendre un mot, regarde les mots voisins, cherche un mot de la même famille et consulte une ressource adaptée. Un mot qui ressemble à l'anglais donne parfois un indice, mais il faut vérifier. Compare deux lectures, nomme une stratégie utile et choisis un prochain objectif précis.",
  ],
  "functional-reading": [
    "Cherche la forme du texte, son public et son but. Un titre, une date, une étiquette et une étape numérotée ne jouent pas le même rôle. Explique comment un élément aide le lecteur à trouver ou à utiliser l'information. Une information manquante peut être plus importante qu'une jolie décoration.",
    "Lis toute la ligne ou la colonne utile avant de prendre une décision. Une condition, une exception ou une unité peut changer le sens d'un nombre. Vérifie les mots inconnus avec le contexte et une ressource fiable. Montre le détail exact qui soutient ta réponse au lieu de deviner.",
    "Utilise le texte pour réaliser une petite tâche, puis compare le résultat avec les informations écrites. Explique à un partenaire comment tu as trouvé le détail nécessaire. Si ton premier essai ne convient pas, cherche l'indice oublié et change ta stratégie de lecture pour la prochaine fois.",
  ],
  writing: [
    "Avant d'écrire, choisis ton lecteur et ton but. Rassemble les idées nécessaires, puis organise-les avec un dessin, une liste ou un plan. Observe un modèle pour comprendre la forme du texte, sans copier ses idées personnelles. Utilise des personnages imaginaires et protège les renseignements privés.",
    "Écris une première version pour communiquer ton message. Demande si le lecteur possède assez d'informations et comprend leur ordre. Un conseil utile indique une difficulté précise. Réviser peut vouloir dire ajouter, enlever ou déplacer une idée. Corriger les accents ne remplace pas une information manquante.",
    "Relis avec une courte liste de vérification adaptée à ton texte. Prépare une version finale lisible après les corrections. Compare tes versions et explique un changement de sens ainsi qu'une correction de langue. Garde ton plan et tes essais : un quiz ne montre pas tout le travail d'écriture.",
  ],
  language: [
    "Observe une phrase qui a du sens avant de nommer sa règle. Vérifie comment les mots se rapportent à la personne, à l'objet, à l'action ou au moment décrit. Un modèle et un dictionnaire peuvent aider à confirmer une forme. Relis la phrase corrigée pour vérifier le message, pas seulement les lettres.",
    "Choisis des mots et des liens qui expriment la relation voulue. Un mot précis peut remplacer un mot vague. Un lien de cause ne signifie pas la même chose qu'un lien d'ordre. Explique ce que ton nouveau choix change pour le lecteur; une phrase plus longue n'est pas toujours une phrase plus claire.",
    "Applique une vérification de langue à ton propre texte, et pas seulement à une phrase d'exercice. Observe l'orthographe, les accords, l'ordre des mots et la ponctuation utiles à ton modèle. Lis à voix haute, demande un conseil et garde un exemple avant et après pour expliquer ta correction.",
  ],
  media: [
    "Un message médiatique a un créateur, un public et un but. Écoute les mots et remarque le débit, les sons et l'accent mis sur certaines idées. Un message agréable n'est pas toujours une preuve. Distingue une information, une préférence et une invitation; demande quelle preuve pourrait confirmer une affirmation.",
    "Lis les mots avec les images et la disposition. Demande ce que le message met en valeur et quelle information utile manque. Compare les choix de présentation avec le public et le but. Justifie ta réaction avec un élément précis plutôt que de dire que toutes les affiches fonctionnent de la même façon.",
    "Crée un petit message original pour un public et un but précis. Choisis volontairement les mots, les sons et la présentation. Donne les informations nécessaires sans promettre ce que tu ne peux pas prouver. Demande à une personne ce qu'elle comprend, puis améliore ton message grâce à sa réponse.",
  ],
  communities: [
    "Avec un adulte, choisis une ressource publique créée par une personne ou une organisation francophone de la région étudiée. Note le créateur, le lieu, la date, le public et le but. Écoute un vrai extrait en français. Un récit inventé ne remplace pas la voix d'une communauté; un accent ne révèle pas toute une identité.",
    "Lis un texte de la communauté et situe son lieu sur une carte. Décris seulement les détails soutenus par la ressource. Compare un lien précis avec ton expérience et pose une question ouverte respectueuse. Observe les salutations et les façons de s'adresser aux personnes dans leur contexte particulier.",
    "Écris une courte réponse qui nomme la vraie source et respecte son public. Présente aussi les informations oralement avec un langage adapté. Distingue une citation des mots de ton propre résumé. Explique ce que tu ignores encore et quelle autre ressource de la communauté pourrait t'aider à le comprendre.",
  ],
};

const practice: Record<Role, readonly [Check, Check, Check]> = {
  instructions: [
    ["Before a multi-step instruction, what is useful?", "Choose the information you need", "Translate every syllable first", "Start moving before listening", "A listening purpose directs attention to necessary details."],
    ["Which note keeps the order of directions?", "Numbered action notes", "An unrelated word list", "Only the speaker's name", "Numbering preserves sequence rather than just vocabulary."],
    ["A familiar phrase was spoken too quickly. What helps?", "Request a slower repetition", "Ask for an unrelated story", "Pretend certainty", "Slower repetition addresses a pace difficulty."],
  ],
  "story-listening": [
    ["What belongs in a story's gist?", "The important change", "Every imagined detail", "Only a favourite word", "A gist preserves central relationships and events."],
    ["An interpretation needs...", "A clue from the spoken text", "Only your preference", "A louder voice", "Heard evidence supports an inference."],
    ["A partner heard a different detail. What next?", "Replay and compare evidence", "Vote without checking", "Ignore the detail", "Another listening can resolve a disagreement about evidence."],
  ],
  interaction: [
    ["Why prepare questions rather than both sides?", "The partner's response may change the exchange", "Listening is unnecessary", "All people answer identically", "Real interaction responds to another speaker."],
    ["What helps before disagreeing?", "Restate the partner's idea fairly", "Interrupt every sentence", "Change the subject", "Reformulation checks understanding and respects the speaker."],
    ["Which goal is observable?", "Ask a relevant follow-up question", "Become perfect immediately", "Never need feedback", "A follow-up question is an action a partner can observe."],
  ],
  presentation: [
    ["What should cue notes contain?", "Key ideas in a useful order", "An unrelated dictionary page", "Only private contact details", "Cue notes support an organized message without replacing communication."],
    ["Which improves intelligibility?", "Pauses between meaningful groups", "Maximum speed throughout", "Volume instead of clarity", "Phrasing helps listeners follow ideas."],
    ["A listener cannot follow one transition. What next?", "Revise and rehearse that transition", "Repeat unchanged more loudly", "Remove every idea", "Specific feedback identifies a manageable improvement."],
  ],
  "story-reading": [
    ["What should happen to an unsupported prediction?", "Revise it using the text", "Keep it regardless of evidence", "Treat it as the author's fact", "Predictions are provisional, not facts."],
    ["Accurate expressive reading requires...", "Understanding words and punctuation", "Guessing faster", "Ignoring dialogue marks", "Meaning and punctuation guide fluent phrasing."],
    ["A word resembles English. What should you do?", "Verify its meaning in context", "Assume every meaning is identical", "Skip the whole text", "Look-alike words are clues, not proof."],
  ],
  "functional-reading": [
    ["Why inspect a text's headings?", "They help locate relevant information", "They prove every claim", "They replace all details", "Headings organize information for a purpose."],
    ["A timetable has an exception note. What matters?", "Read it before choosing a time", "Ignore it because it is small", "Use only the largest number", "An exception can change a practical decision."],
    ["A reading reflection should identify...", "A useful feature and next strategy", "Only a quiz score", "A guess unrelated to the text", "Reflection links the reading process to an improvement."],
  ],
  writing: [
    ["What guides a writing plan?", "Purpose and intended reader", "Only page colour", "A desire to copy someone's personal story", "Purpose and audience determine necessary ideas and form."],
    ["Which is a meaning revision?", "Add an explanation the reader needs", "Only enlarge the font", "Only sharpen a pencil", "Revision improves content, clarity, or organization."],
    ["What demonstrates a writing process?", "A plan, drafts, feedback, and final text", "Only a multiple-choice score", "Only copied words", "Actual writing evidence is needed in addition to quiz recognition."],
  ],
  language: [
    ["Why examine meaning before a pattern?", "Forms communicate relationships", "Rules have no connection to messages", "Every form is interchangeable", "Grammar and word choice clarify the intended message."],
    ["A precise word should...", "Fit the idea and context", "Always be the longest available word", "Change the message accidentally", "Precision concerns meaning rather than word length."],
    ["Where should an editing strategy also be used?", "In your own draft", "Only on a quiz answer", "Nowhere after practice", "Transfer to an original text demonstrates use of the strategy."],
  ],
  media: [
    ["Exciting music provides...", "An attention cue, not proof of a claim", "Evidence that every claim is true", "A reason never to check facts", "Presentation affects attention but does not verify information."],
    ["A media response should refer to...", "A specific word, image, or layout choice", "Only a guess about all audiences", "An invented creator quotation", "Specific features support an evaluation."],
    ["Before publishing a media invitation, check...", "Necessary details and truthful claims", "Only its colour", "Whether it exaggerates the most", "Audiences need usable, accurate information."],
  ],
  communities: [
    ["Which source supports community inquiry?", "A named community-authored resource", "An invented tradition", "A guess based on accent", "A contextualized community voice is evidence; invention is not."],
    ["A careful comparison concerns...", "One sourced detail and its context", "Every member of a culture", "A ranking of entire cultures", "Specific comparisons avoid overgeneralization."],
    ["A response to a community resource should...", "Credit the creator and distinguish paraphrase", "Invent a quotation", "Hide the source", "Attribution respects authorship and makes evidence traceable."],
  ],
};

const frenchPractice: Record<Role, readonly [Check, Check, Check]> = {
  instructions: [
    ["Avant une consigne, que choisis-tu?", "L'information à chercher", "Un mot au hasard", "La fin sans écouter", "Un but aide à chercher les détails utiles."],
    ["Qu'est-ce qui garde l'ordre des actions?", "Des notes numérotées", "Un nom sans action", "Une couleur au hasard", "Les nombres gardent la suite des étapes."],
    ["La phrase connue est trop rapide. Que demandes-tu?", "Une répétition plus lente", "Une autre histoire", "La fin de l'activité", "Une répétition plus lente aide à entendre la phrase."],
  ],
  "story-listening": [
    ["Que garde un résumé du récit?", "Le changement important", "Tous les faits inventés", "Un seul mot préféré", "Un résumé garde les idées importantes."],
    ["Une interprétation s'appuie sur quoi?", "Un indice entendu", "Un choix au hasard", "La voix la plus forte", "Un indice du récit soutient l'idée."],
    ["Deux personnes ont entendu des détails différents. Que faire?", "Réécouter et comparer les indices", "Deviner sans vérifier", "Ignorer le récit", "Une nouvelle écoute aide à vérifier les détails."],
  ],
  interaction: [
    ["Pourquoi ne pas préparer les deux côtés de l'échange?", "Le partenaire peut répondre autrement", "Personne ne doit écouter", "Toutes les réponses sont identiques", "La conversation change avec les réponses."],
    ["Avant de proposer une autre idée, que peux-tu faire?", "Redire l'idée du partenaire", "Couper toutes ses phrases", "Changer de sujet", "Redire l'idée montre la compréhension."],
    ["Quel objectif peut-on observer?", "Poser une question liée au sujet", "Être parfait tout de suite", "Ne jamais recevoir de conseil", "Une question pertinente est une action observable."],
  ],
  presentation: [
    ["Que mets-tu dans tes notes?", "Les idées importantes dans l'ordre", "Une page sans lien", "Seulement des détails privés", "Les notes guident un message organisé."],
    ["Qu'est-ce qui aide le public à suivre?", "Des pauses entre les idées", "La vitesse maximale", "Des mots sans sens", "Les pauses soutiennent la compréhension."],
    ["Un passage est peu clair. Que faire?", "Le modifier et l'essayer encore", "Le répéter sans changement", "Ignorer le conseil", "Un conseil précis aide à améliorer le passage."],
  ],
  "story-reading": [
    ["Une prédiction ne convient plus. Que faire?", "La changer avec les indices", "La garder malgré le texte", "La présenter comme un fait", "Une prédiction peut changer après la lecture."],
    ["Lire avec expression demande quoi?", "Comprendre les mots et la ponctuation", "Deviner le plus vite possible", "Ignorer le dialogue", "Le sens et la ponctuation guident la lecture."],
    ["Un mot ressemble à l'anglais. Que faire?", "Vérifier le sens dans le contexte", "Supposer tous les sens identiques", "Abandonner la lecture", "Une ressemblance est un indice à vérifier."],
  ],
  "functional-reading": [
    ["À quoi sert un titre de section?", "À trouver l'information utile", "À prouver toute affirmation", "À remplacer les détails", "Un titre organise les informations."],
    ["Un horaire donne une exception. Que faire?", "La lire avant de choisir", "L'ignorer parce qu'elle est petite", "Choisir le plus grand nombre", "Une exception peut changer la décision."],
    ["Une réflexion sur la lecture nomme quoi?", "Un élément utile et une prochaine stratégie", "Seulement une note de quiz", "Une idée sans lien", "La réflexion relie une stratégie à une amélioration."],
  ],
  writing: [
    ["Qu'est-ce qui guide ton plan?", "Le but et le lecteur", "Seulement la couleur", "L'envie de tout copier", "Le but et le public guident le contenu."],
    ["Quel changement révise le sens?", "Ajouter une explication nécessaire", "Agrandir seulement les lettres", "Changer seulement de crayon", "La révision améliore le contenu ou la clarté."],
    ["Qu'est-ce qui montre le travail d'écriture?", "Un plan, des essais et un texte final", "Seulement un score de quiz", "Seulement des mots copiés", "Les étapes réelles montrent le processus."],
  ],
  language: [
    ["Pourquoi regarder le sens d'une phrase?", "Les formes expriment des relations", "Les mots sont tous interchangeables", "Le sens ne compte pas", "Les choix de langue clarifient le message."],
    ["Un mot précis doit faire quoi?", "Convenir à l'idée et au contexte", "Être toujours le plus long", "Changer l'idée par accident", "La précision concerne le sens."],
    ["Où utiliser aussi une stratégie de correction?", "Dans ton propre texte", "Seulement dans un quiz", "Nulle part après l'exercice", "Ton texte montre le transfert de la stratégie."],
  ],
  media: [
    ["Une musique entraînante donne quoi?", "Un effet d'attention, pas une preuve", "La preuve que tout est vrai", "Une raison de ne rien vérifier", "Un son attire l'attention sans prouver une affirmation."],
    ["Une réaction à une affiche s'appuie sur quoi?", "Un mot, une image ou un choix précis", "Une idée sur tous les publics", "Une citation inventée", "Un élément précis soutient l'évaluation."],
    ["Avant de partager une invitation, que vérifier?", "Les détails utiles et les affirmations", "Seulement les couleurs", "La plus grande exagération", "Le public a besoin d'informations utilisables et exactes."],
  ],
  communities: [
    ["Quelle ressource soutient une enquête culturelle?", "Une ressource créée par une communauté nommée", "Une tradition inventée", "Une supposition sur un accent", "Une vraie voix située dans son contexte sert de source."],
    ["Une comparaison respectueuse concerne quoi?", "Un détail sourcé et son contexte", "Tous les membres d'une culture", "Un classement des cultures", "Une comparaison précise évite les généralisations."],
    ["Que faut-il faire dans une réponse à une ressource?", "Nommer le créateur et distinguer le résumé", "Inventer une citation", "Cacher la source", "L'attribution respecte le travail du créateur."],
  ],
};

const transfers: Record<Role, readonly [Check, Check]> = {
  instructions: [
    ["A direction includes 'si' (if). What must the listener check?", "Whether the condition applies", "Only the last noun", "Nothing beyond the first action", "Si introduces a condition, so the action may depend on the situation."],
    ["Une consigne contient « si ». Que faut-il vérifier?", "Si la condition s'applique", "Seulement le dernier nom", "Rien après la première action", "Si introduit une condition qui peut changer l'action."],
  ],
  "story-listening": [
    ["A narrator says someone waits, but gives no reason. What is justified?", "The person waits; the reason is uncertain", "The person certainly dislikes everyone", "The waiting proves a specific tradition", "Keep stated facts separate from an unsupported explanation."],
    ["Le narrateur dit qu'une personne attend sans expliquer pourquoi. Que sait-on?", "Elle attend; la raison reste incertaine", "Elle déteste certainement tout le monde", "Cela prouve une tradition", "Il faut distinguer le fait entendu d'une raison inventée."],
  ],
  interaction: [
    ["A partner changes the agreed time. What response fits?", "Confirm the new time before continuing", "Repeat the old time without listening", "Answer an unrelated question", "A relevant confirmation repairs the changed information."],
    ["Le partenaire change l'heure prévue. Quelle réponse convient?", "Confirmer la nouvelle heure", "Répéter l'ancienne sans écouter", "Répondre à un autre sujet", "La confirmation vérifie l'information qui a changé."],
  ],
  presentation: [
    ["The audience is new to your topic. What should you add?", "A brief explanation of a necessary term", "More unexplained jargon", "An unsupported claim of expertise", "Audience knowledge determines which terms need explanation."],
    ["Le public découvre ton sujet. Que faut-il ajouter?", "Une explication d'un mot nécessaire", "Plus de mots difficiles sans explication", "Une expertise inventée", "Les connaissances du public guident les explications."],
  ],
  "story-reading": [
    ["A character says one thing but later acts differently. What helps interpretation?", "Compare both details in context", "Ignore the later action", "Invent a missing chapter", "Contrasting details may reveal a change or a tension; both require attention."],
    ["Un personnage agit autrement que prévu. Que faire?", "Comparer ses paroles et ses actions", "Ignorer la nouvelle action", "Inventer un chapitre absent", "Les deux détails peuvent révéler un changement."],
  ],
  "functional-reading": [
    ["A notice names an event but gives no place. What should a reader do?", "Request the missing location", "Invent a location", "Assume all events share one place", "A usable notice needs the information required for attendance."],
    ["Un avis nomme une activité sans lieu. Que faire?", "Demander le lieu manquant", "Inventer le lieu", "Supposer un lieu universel", "Le lecteur a besoin du lieu pour participer."],
  ],
  writing: [
    ["A reader asks who the pronoun refers to. Which revision helps?", "Replace the ambiguous pronoun with the intended name", "Change only the text colour", "Delete all sentence endings", "Naming the intended person repairs a meaning ambiguity."],
    ["Le lecteur ne sait pas qui désigne un pronom. Quelle révision aide?", "Nommer la personne voulue", "Changer seulement la couleur", "Enlever toute ponctuation", "Un nom clair répare l'ambiguïté."],
  ],
  language: [
    ["A dictionary offers two meanings. Which should guide your choice?", "The meaning fitting the sentence context", "Always the first regardless of context", "Always the longest definition", "Words can have several meanings, so context determines the relevant one."],
    ["Le dictionnaire donne deux sens. Lequel choisir?", "Celui qui convient au contexte", "Toujours le premier sans vérifier", "Toujours le plus long", "Le contexte permet de choisir le sens pertinent."],
  ],
  media: [
    ["An invitation says 'best ever' without evidence. What is it?", "An unsupported promotional judgement", "A verified measurement", "A required date", "A superlative opinion is not a measured fact without supporting evidence."],
    ["Une invitation dit « le meilleur » sans preuve. Qu'est-ce que c'est?", "Un jugement promotionnel non prouvé", "Une mesure vérifiée", "Une date nécessaire", "Un jugement superlatif n'est pas un fait mesuré sans preuve."],
  ],
  communities: [
    ["Two community creators describe different experiences. What follows?", "Both accounts need their own context", "One voice represents everyone", "Difference makes all sources useless", "Diverse experiences should be situated rather than forced into a stereotype."],
    ["Deux créateurs décrivent des expériences différentes. Que conclure?", "Chaque récit demande son contexte", "Une voix représente tout le monde", "Toutes les sources deviennent inutiles", "Des expériences variées doivent être situées, pas réduites à un stéréotype."],
  ],
};

function question(id: string, check: Check, index: number, sectionIndex?: number, listeningText?: string): Question {
  const [prompt, answer, first, second, explanation] = check;
  const answerIndex = index % 3;
  const options = [first, second];
  options.splice(answerIndex, 0, answer);
  return { id, prompt, options, answerIndex, explanation, ...(sectionIndex === undefined ? {} : { sectionIndex }), ...(listeningText ? { listeningText } : {}) };
}

function topicSearch(words: readonly string[], immersion: boolean): Problem {
  const prompt = immersion ? "Trouve les trois mots du sujet en sélectionnant leur première et dernière lettre." : "Find the three topic words by selecting their first and last letters.";
  const explanation = immersion ? "Ces mots appartiennent au sujet. Explique ensuite leur sens dans une phrase." : "These words belong to the topic. Explain their meanings in a sentence afterwards.";
  if (words.every((word) => word.length <= 7)) return search(words, explanation, prompt);
  const size = Math.max(...words.map((word) => word.length)) + 2;
  const letters = "AEILNORSTUVBCDFGMP";
  const grid = Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => letters[(row * 7 + column * 3) % letters.length]));
  words.forEach((word, index) => [...word.toLocaleUpperCase("fr")].forEach((letter, offset) => {
    const [row, column] = index === 0 ? [0, offset] : index === 1 ? [offset + 1, size - 1] : [offset + 2, offset];
    grid[row][column] = letter;
  }));
  return { id: "search", type: "word-search", prompt, explanation, grid: grid.map((row) => row.join("")), words: words.map((text, i) => ({ id: `word-${i}`, text: text.toLocaleUpperCase("fr") })) };
}

function activitySet(topic: Topic, immersion: boolean, index: number): ActivitySet {
  const associate = pairs(immersion ? "Associe les expressions et leur sens dans ce sujet." : "Match the expressions and their meanings in this topic.", topic.links, immersion ? "Le contexte aide à relier chaque expression à son sens." : "Use the topic context to connect each expression with its meaning.");
  const gap = { ...fill(...[topic.gap[0], topic.gap[1], immersion ? "Le mot complète le modèle étudié; relis toute la phrase pour vérifier le sens." : "The word completes the studied model; reread the whole sentence for meaning.", topic.gap[2]] as const),
    prompt: immersion ? "Complète le modèle avec le mot français qui convient." : "Complete the model with the appropriate French word." };
  const hunt = topicSearch(topic.words, immersion);
  const ordering = sequence(immersion ? "Place les étapes de travail dans l'ordre." : "Put the topic work stages in order.", topic.scenes.map((s) => s[0]), immersion ? "Prépare, utilise les informations, puis vérifie le résultat selon les étapes du sujet." : "Prepare, use the information, then check the outcome using the topic stages.");
  const categories = sort(immersion ? "Classe les expressions selon leur fonction." : "Sort the expressions by their function.", immersion ? ["Expression française", "Explication du sens"] : ["French expression", "Meaning explanation"], topic.links.flatMap(([a, b]) => [[a, 0], [b, 1]] as const), immersion ? "Distingue la forme de l'expression et l'explication de son sens." : "Distinguish the expression itself from its meaning explanation.");
  const firstWord = topic.gap[1];
  const spelling = highlight(immersion ? "Repère la forme mal écrite du mot étudié." : "Identify the misspelled form of the studied word.", [firstWord, `${firstWord}x`, firstWord], [1], immersion ? `La forme du modèle est « ${firstWord} »; le x ajouté n'y appartient pas.` : `The model uses ${firstWord}; the added x does not belong to that form.`);
  let picture: Problem | undefined;
  if (topic.pictures) {
    const registry = french.lessons.flatMap((l) => l.frenchWords ?? []);
    const entries = topic.pictures.map((id) => {
      const word = registry.find((w) => w.id === id);
      if (!word) throw new Error(`Unknown French picture word ${id}`);
      return word;
    });
    picture = { id: "pictures", type: "picture-match", prompt: immersion ? "Associe les mots français aux images." : "Match the French words to the pictures.", explanation: entries.map((w) => `${w.french} : ${w.english}`).join("; "),
      words: entries.map((w) => ({ id: w.id, text: w.french })),
      pictures: entries.map((w) => ({ id: `picture-${w.id}`, pictureId: w.id, description: immersion ? w.french : w.english, wordId: w.id })).reverse() };
  }
  const variants = [associate, gap, hunt, ordering, categories, spelling];
  return [picture ?? variants[index % variants.length], variants[(index + 1) % variants.length], variants[(index + 3) % variants.length]];
}

export function makeGrade(program: "core" | "immersion", grade: number, topics: readonly Topic[]): GradeContent {
  if (topics.length !== roles.length) throw new Error("Author exactly ten distinct French topic lessons in pedagogical role order.");
  const immersion = program === "immersion";
  const source = sourceFor(program, grade);
  const activities: Record<string, ActivitySet> = {};
  const lessons: (Lesson | ImmersionLesson)[] = topics.map((topic, i) => {
    const role = roles[i];
    const slug = `${immersion ? "imm" : "core"}-g${grade}-${topic.slug}`;
    const sections = topic.scenes.map(([heading, text, task], j) => {
      const expectations = [...mappings[role][j]];
      if (immersion) {
        if (["instructions", "story-listening", "media"].includes(role)) {
          if (j < 2) expectations.push("A1.3");
          if (role === "media") expectations.push(j === 0 ? "A1.4" : j === 1 ? "C1.5" : "D1.5");
        }
        if (role === "media" && j === 2) expectations.push("B1.4");
        if (role === "language") expectations.push(j === 0 ? "D1.3" : j === 1 ? "D1.4" : grade >= 4 ? "D1.6" : "D1.3");
      } else if (role === "language" && grade >= 7) expectations.push("D1.3");
      const body = `${text}\n\n${(immersion ? frenchMethods : methods)[role][j]}`;
      const activity = `${task} ${immersion ? "Un adulte observe le travail réel et demande quel indice ou choix t'a aidé. Explique une réussite et un prochain essai; le quiz ne certifie pas la maîtrise." : "An adult observes the actual work and asks which clue or choice helped. Explain one success and one next attempt; the quiz does not certify mastery."}`;
      return { heading, body, activity, expectations,
        questions: [question(`${slug}-p${j + 1}`, (immersion ? frenchPractice : practice)[role][j], i + j)],
        ...(immersion ? { englishHelp: `${methods[role][j]} The French scene above is the main learning text. Read it with a capable adult, explain the topic-specific evidence, and carry out the actual task rather than replacing French communication with a written quiz.` } : {}) };
    });
    const final = [
      question(`${slug}-f1`, topic.listening?.[1] ?? transfers[role][immersion ? 1 : 0], i + 1, 0, topic.listening?.[0]),
      ...sections.map((_, j) => question(`${slug}-f${j + 2}`, topic.scenes[j][3], i + j + 2, j)),
    ];
    activities[slug] = activitySet(topic, immersion, i);
    const data = { slug, title: topic.title, grade, program, strand: role === "communities" ? "A–D · Intercultural understanding" : role === "media" ? "A–D · Media literacy" : `${sections[0].expectations[0][0]} · ${role.replaceAll("-", " ")}`,
      introduction: immersion ? "Lis les exemples originaux, essaie les tâches réelles avec un adulte et vérifie les stratégies. Les activités et le quiz accompagnent l'apprentissage sans remplacer l'observation." : "Study original French examples with supported meaning, carry out the real tasks with an adult, and check strategies. Activities and quizzes support learning rather than replacing observation.",
      durationMinutes: grade <= 3 ? 25 : grade <= 6 ? 35 : 45, source, unitSlug: `${immersion ? "imm" : "core"}-g${grade}-${role}`, unitTitle: topic.title,
      expectations: [...new Set(sections.flatMap((s) => s.expectations))],
      sections, questions: final };
    if (immersion) return { ...data, program: "immersion", sections: data.sections.map((s) => ({ ...s, englishHelp: s.englishHelp! })) } satisfies ImmersionLesson;
    return { ...data, program: "core" } satisfies Lesson;
  });
  return { edition: 2013, source, expectations: expectationInventory(program, grade), lessons, activities };
}
