import { fill, highlight, pairs, search, sequence, sort, type ActivityBank } from "./builders";
import type { Problem } from "../problems";

function pictures(prompt: string, entries: readonly (readonly [string, string, string])[], explanation: string): Problem {
  return { id: "pictures", type: "picture-match", prompt, explanation,
    words: entries.map(([text], index) => ({ id: `word-${index}`, text })),
    pictures: entries.map(([, pictureId, description], index) => ({ id: `picture-${index}`, pictureId, description, wordId: `word-${index}` })).reverse() };
}

export const coreFrenchActivities: ActivityBank = {
  "bonjour-les-animaux-listening": [
    pictures("Match the animal words to their pictures.", [["un chat", "cat", "Cat"], ["un chien", "dog", "Dog"], ["un lapin", "rabbit", "Rabbit"]], "A chat is a cat, a chien is a dog, and a lapin is a rabbit."),
    fill("The French word in 'un chat' names a", "cat", "Un chat is the French expression for a cat."),
    pictures("Match these other animal words.", [["un poisson", "fish", "Fish"], ["un oiseau", "bird", "Bird"], ["une vache", "cow", "Cow"]], "Poisson means fish, oiseau means bird and vache means cow."),
  ],
  "bonjour-les-animaux-conversation": [
    sequence("Order a brief French conversation.", ["Bonjour !", "Comment ça va ?", "Ça va bien, merci."], "A greeting can lead to a question and then an answer."),
    fill("Complete the greeting: Bon", "jour", "Bonjour is a common greeting.", " !"),
    pairs("Match French expressions to their meanings.", [["Merci", "Thank you"], ["Au revoir", "Goodbye"], ["S'il te plaît", "Please, to someone addressed as tu"]], "Use expressions suitable for the person and situation."),
  ],
  "bonjour-les-animaux-reading-and-writing": [
    pairs("Match French descriptions.", [["un petit chat", "a small cat"], ["un grand chien", "a big dog"], ["un lapin blanc", "a white rabbit"]], "Descriptions combine a noun with an adjective."),
    fill("Complete 'Voici un", "chat", "Voici un chat means here is a cat.", "' to say 'Here is a cat'."),
    highlight("Highlight the misspelled French words.", ["Le", "chatt", "est", "petitt", "."], [1, 3], "Chat and petit are written with one final t."),
  ],
  "bonjour-les-animaux-francophone-communities": [
    sort("Sort claims about francophone communities.", ["Respects context", "Overgeneralizes"], [["This speaker describes their family.", 0], ["All French speakers have identical customs.", 1], ["Name the community and the resource.", 0]], "Communities and experiences are diverse."),
    fill("A community-authored resource should be credited by naming its", "source", "Identify where an account comes from."),
    pairs("Match respectful research actions.", [["Listen", "Attend to the speaker's own account"], ["Locate", "Identify the place discussed"], ["Compare", "Notice a specific connection without stereotypes"]], "Use an adult-selected public resource and keep its context."),
  ],
  "au-marche-listening": [
    pictures("Match French food words.", [["une pomme", "apple", "Apple"], ["du pain", "bread", "Bread"], ["du fromage", "cheese", "Cheese"]], "Pomme, pain and fromage name different foods."),
    fill("In 'une pomme', pomme means", "apple", "Une pomme means an apple."),
    pictures("Match the food pictures to these words.", [["une banane", "banana", "Banana"], ["une carotte", "carrot", "Carrot"], ["un œuf", "egg", "Egg"]], "Banane means banana, carotte means carrot and œuf means egg."),
  ],
  "au-marche-polite-interaction": [
    sequence("Order a polite purchase exchange.", ["Bonjour !", "Je voudrais une pomme, s'il vous plaît.", "Merci. Au revoir !"], "Greet, make the request and thank the other person."),
    fill("Complete the polite thanks:", "merci", "Merci means thank you.", " !"),
    pairs("Match expressions.", [["Je voudrais", "I would like"], ["Combien ça coûte ?", "How much does it cost?"], ["S'il vous plaît", "Please, in a vous request"]], "Polite forms support a respectful exchange."),
  ],
  "au-marche-functional-texts": [
    sort("Sort text features.", ["Helps a shopping list", "Helps a recipe"], [["Names items to buy", 0], ["Numbers preparation steps", 1], ["Lists ingredients and cooking directions", 1]], "Text forms serve different purposes."),
    fill("Complete a shopping list with the French word for bread: du", "pain", "Pain is French for bread; du pain means some bread.", ""),
    pairs("Match French text words.", [["Prix", "Price"], ["Liste", "List"], ["Recette", "Recipe"]], "These words help identify a functional text."),
  ],
  "au-marche-culture-and-reflection": [
    pairs("Match reflection questions to their purpose.", [["Who created this resource?", "Check the source"], ["Which strategy helped?", "Reflect on learning"], ["What will I try next?", "Set a next step"]], "Reflection connects evidence, strategies and future learning."),
    fill("A useful learning reflection names a strategy and a next", "step", "Choose a specific action you can try."),
    sort("Sort cultural comparisons.", ["Careful comparison", "Unsupported generalization"], [["This market differs from one I have visited.", 0], ["Every francophone market is identical.", 1], ["This public resource describes one named place.", 0]], "Compare specific examples, not imagined universal customs."),
  ],
  "dans-mon-sac-listening": [
    pictures("Match words for school objects.", [["un livre", "book", "Book"], ["un crayon", "pencil", "Pencil"], ["un sac", "bag", "Bag"]], "Livre means book, crayon means pencil and sac means bag."),
    fill("The word livre in 'un livre' means", "book", "Un livre means a book."),
    search(["SAC", "LIVRE", "CRAYON"], "Sac, livre and crayon are useful words for describing school objects."),
  ],
  "dans-mon-sac-questions-and-descriptions": [
    pairs("Match questions and suitable responses.", [["Qu'est-ce que c'est ?", "C'est un livre."], ["De quelle couleur est le sac ?", "Il est bleu."], ["Où est le crayon ?", "Il est dans le sac."]], "Answer the kind of information asked for."),
    fill("Complete 'Il est", "bleu", "Bleu is the masculine form used for a blue sac.", "' to describe a blue sac."),
    sort("Sort description words.", ["Colour", "Size"], [["rouge", 0], ["petit", 1], ["bleu", 0], ["grand", 1]], "Colour and size describe different properties."),
  ],
  "dans-mon-sac-notes-and-writing": [
    sequence("Order the steps for a clear short note.", ["Choose who will read it.", "Write the useful message.", "Check the words and punctuation."], "Purpose, drafting and checking work together."),
    fill("Complete the sentence with the word for bag: Voici mon", "sac", "Voici mon sac means here is my bag.", "."),
    highlight("Highlight the misspelled words.", ["Mon", "livrre", "est", "dans", "mon", "sacc", "."], [1, 5], "The correct forms are livre and sac."),
  ],
  "dans-mon-sac-community-voices": [
    sort("Sort uses of a community resource.", ["Respects the resource", "Misrepresents the resource"], [["Name its creator.", 0], ["Invent a quotation and claim the creator said it.", 1], ["Keep the account's place and context.", 0]], "Use actual public resources without inventing cultural information."),
    fill("A copied statement should not be presented as your own", "words", "Quote and credit exact wording; do not pretend you created it."),
    pairs("Match French courteous expressions.", [["Bonjour", "Hello"], ["Merci", "Thank you"], ["Au revoir", "Goodbye"]], "Observe the context and ask an adult which form suits the situation."),
  ],
};

export const immersionActivities: ActivityBank = {
  "ecouter-les-consignes": [
    sequence("Place les consignes dans l'ordre.", ["D'abord, prends une feuille.", "Ensuite, dessine une fleur.", "Enfin, écris ton prénom."], "Les mots d'ordre aident à suivre les étapes."),
    fill("Pour demander de l'aide : Peux-tu", "répéter", "« Peux-tu répéter, s'il te plaît ? » est une demande polie.", ", s'il te plaît ?"),
    pairs("Associe les mots aux actions.", [["Écoute", "Prête attention au message"], ["Dessine", "Fais une image"], ["Écris", "Forme des mots"]], "Les verbes indiquent ce qu'il faut faire."),
  ],
  "ecouter-et-reagir": [
    pairs("Associe un indice à une idée possible.", [["Un sourire", "Une personne peut être contente"], ["Des larmes", "Une personne peut être triste"], ["Des gouttes sur la fenêtre", "Il peut pleuvoir"]], "Une idée doit s'appuyer sur un indice; le contexte reste important."),
    fill("Pour vérifier une idée, cherche un", "indice", "Un indice soutient ton interprétation.", " dans le message."),
    sort("Trie les réactions dans une conversation.", ["Aide à comprendre", "N'aide pas à comprendre"], [["Redire l'idée de l'autre", 0], ["Ignorer sa raison", 1], ["Poser une question sur le sujet", 0]], "Écouter et répondre au sujet soutiennent l'échange."),
  ],
  "parler-de-mon-monde": [
    sequence("Organise une présentation de ton sac.", ["Voici mon sac.", "Il est vert.", "Je l'utilise pour transporter mes livres."], "Présente l'objet, un détail et son utilité."),
    fill("Pour annoncer la dernière étape, je peux dire", "enfin", "Enfin marque la fin d'une suite d'étapes.", "."),
    sort("Trie les façons de parler.", ["Aide le public", "Rend le message difficile"], [["Faire une pause au point", 0], ["Parler très vite sans pause", 1], ["Utiliser une voix audible", 0]], "La voix et les pauses soutiennent le sens."),
  ],
  "dialogues-et-annonces": [
    pairs("Associe les expressions.", [["Bonjour !", "Commencer l'échange"], ["S'il vous plaît", "Faire une demande polie"], ["Merci !", "Remercier"]], "Choisis une formule adaptée au contexte."),
    fill("Une annonce doit tenir compte de son", "public", "Le public doit comprendre le message.", "."),
    sequence("Organise un échange à la bibliothèque.", ["Bonjour !", "Quel livre me conseillez-vous ?", "Merci pour votre conseil."], "La salutation vient avant la demande, puis le remerciement."),
  ],
  "sons-et-mots": [
    search(["CHAT", "LIVRE", "MOT"], "Ces mots servent à travailler les lettres et le vocabulaire. Lis-les aussi à un adulte.", "Trouve CHAT, LIVRE et MOT."),
    fill("Dans chat, les deux premières lettres sont", "ch", "Les lettres ch forment un groupe qui représente un son dans chat.", "."),
    pictures("Associe les mots aux images.", [["un chien", "dog", "Un chien"], ["un poisson", "fish", "Un poisson"], ["une chaise", "chair", "Une chaise"]], "Le mot et l'image doivent représenter la même chose."),
  ],
  "comprendre-un-recit": [
    sequence("Lis et remets le récit dans l'ordre : Zoé prend une graine, la plante, puis voit une feuille.", ["Zoé prend une graine.", "Elle la plante.", "Une feuille apparaît."], "Suis les événements donnés dans le récit."),
    fill("Une idée à vérifier avant de lire est une", "prédiction", "Une prédiction peut changer grâce aux détails du texte.", "."),
    sort("Trie les phrases.", ["Information", "Événement d'un récit"], [["Une plante a besoin d'eau.", 0], ["Léo plante une graine dans son pot.", 1], ["Léo sourit en voyant une feuille.", 1]], "Un récit présente des événements; une information donne un fait."),
  ],
  "lire-les-messages": [
    pairs("Associe les formes de texte.", [["Invitation", "Propose de participer"], ["Consignes", "Expliquent les étapes"], ["Récit", "Raconte des événements"]], "Le but du texte aide à choisir comment le lire."),
    fill("Au début d'une lettre polie, on peut écrire", "bonjour", "Bonjour est une salutation.", "."),
    sequence("Suis la procédure : prends une feuille, plie-la, puis dessine une carte.", ["Prends une feuille.", "Plie la feuille.", "Dessine une carte."], "Les étapes doivent suivre l'ordre donné."),
  ],
  "ecrire-un-message": [
    sort("Trie les détails pour une affiche sur la lecture.", ["Soutient le message", "Sans lien avec le message"], [["Une image de livre", 0], ["Une invitation à lire", 0], ["Une liste de chaussures", 1]], "Les mots et l'image doivent servir le même but."),
    fill("La personne à qui j'écris est mon", "destinataire", "Le destinataire est la personne qui reçoit le message.", "."),
    pairs("Associe le but à une forme.", [["Remercier", "Carte de remerciement"], ["Expliquer un jeu", "Règles"], ["Raconter une sortie", "Petit récit"]], "Choisis une forme qui convient au but."),
  ],
  "ameliorer-mon-texte": [
    sequence("Organise le travail d'écriture.", ["Prépare les idées.", "Écris un brouillon.", "Révise le sens.", "Vérifie les mots et les points."], "La révision du sens vient avant la vérification finale."),
    fill("Le premier essai d'un texte est un", "brouillon", "Un brouillon permet de changer les idées avant la copie finale.", "."),
    highlight("Trouve les mots mal écrits.", ["Léa", "aime", "son", "livrre", "et", "son", "sacc", "."], [3, 6], "On écrit livre et sac."),
  ],
  "francophonie-pres-de-moi": [
    sort("Trie les façons de partager une ressource.", ["Respecte le contexte", "Généralise sans preuve"], [["Nommer la communauté précise", 0], ["Dire que toutes les familles sont identiques", 1], ["Nommer la personne qui parle", 0]], "Une expérience ne représente pas tout le monde."),
    fill("Pour vérifier un fait, je nomme la", "source", "La source indique d'où vient l'information.", "."),
    pairs("Associe les actions respectueuses.", [["Remercier", "Merci de partager votre expérience."], ["Vérifier", "D'où vient ce fait ?"], ["Comparer", "Dans ma vie, je remarque cette différence."]], "Utilise une ressource publique choisie avec un adulte."),
  ],
};

export const frenchVocabularyPractice: Readonly<Record<string, readonly Problem[]>> = {
  animals: [search(["CHAT", "CHIEN", "LAPIN"], "Chat, chien and lapin name familiar animals.")],
  food: [pictures("Match food words to pictures.", [["la pomme", "apple", "Apple"], ["le lait", "milk", "Milk"], ["l'eau", "water", "Water"]], "Pomme means apple, lait means milk and eau means water.")],
  "everyday-objects": [sort("Sort French object words.", ["Used for reading or writing", "Used for sitting"], [["le livre", 0], ["le crayon", 0], ["la chaise", 1]], "Livre is a book, crayon is a pencil and chaise is a chair.")],
  classroom: [pictures("Match classroom words to their pictures.", [["la porte", "door", "Door"], ["une règle", "ruler", "Ruler"], ["des ciseaux", "scissors", "Scissors"]], "Porte means door, règle means ruler and ciseaux means scissors.")],
};
