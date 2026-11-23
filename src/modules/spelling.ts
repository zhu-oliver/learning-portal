import type { Question, SubjectModule } from "./types";

export interface SpellingList {
  id: string;
  title: string;
  description: string;
  words: readonly string[];
  vocabulary: readonly Question[];
  examples: readonly string[];
}

export const spelling: SubjectModule = {
  slug: "spelling",
  title: "Spelling Bee",
  theme: "spelling",
  tagline: "Listen. Spell. Let your words take flight.",
  description: "Build spelling confidence and discover what your words mean.",
  activity: "spelling",
  lessons: [],
};

export const spellingLists: readonly SpellingList[] = [
  {
    id: "test-1", title: "Test 1", description: "People, actions, and everyday challenges",
    words: ["assignment", "patient", "budge", "obedient", "alert", "accustom", "companion", "concept", "compatible", "burly", "jostle", "retirement", "distraction", "pedestrian", "obstacle"],
    examples: [
      "My assignment is to write a story about a forest.",
      "Maya was patient while her little brother tied his shoes.",
      "We pushed the heavy cupboard, but it would not budge.",
      "The obedient puppy sat when its trainer asked it to sit.",
      "Stay alert and look both ways before crossing the road.",
      "Daily practice will accustom you to the new piano routine.",
      "My cousin was my companion on the nature walk.",
      "We used counters to understand the concept of equal groups.",
      "This keyboard is compatible with our computer.",
      "The burly farmer lifted the large sack of grain.",
      "Walk slowly so you do not jostle anyone in the busy hallway.",
      "After her retirement, Grandma had more time to tend her garden.",
      "The noisy television was a distraction while I read.",
      "The driver stopped to let a pedestrian cross the street.",
      "A fallen branch was an obstacle on the bicycle path.",
    ],
    vocabulary: [
      { id: "assignment", prompt: "Your teacher gives you an assignment. What is it?", options: ["A task you are asked to complete", "A place to eat lunch", "A kind of weather"], answerIndex: 0, explanation: "An assignment is a task or piece of work given to someone." },
      { id: "patient", prompt: "If you are patient while waiting your turn, you...", options: ["Push to the front", "Wait calmly without getting upset", "Leave without telling anyone"], answerIndex: 1, explanation: "Being patient means being able to wait calmly. Patient can also mean someone receiving medical care." },
      { id: "budge", prompt: "The heavy box will not budge. What does that mean?", options: ["It will not open", "It will not make a sound", "It will not move even a little"], answerIndex: 2, explanation: "To budge is to move, even slightly." },
      { id: "obedient", prompt: "An obedient dog is one that...", options: ["Follows its owner's commands", "Runs away from every command", "Sleeps all day"], answerIndex: 0, explanation: "Obedient means willing to follow rules or instructions." },
      { id: "alert", prompt: "An alert crossing guard is...", options: ["Not paying attention", "Watchful and ready to notice danger", "Always asleep"], answerIndex: 1, explanation: "Alert means watchful and ready to notice or respond to something." },
      { id: "accustom", prompt: "To accustom yourself to a new routine means to...", options: ["Forget the routine", "Explain it to a stranger", "Get used to it"], answerIndex: 2, explanation: "To accustom someone to something is to help them become used to it." },
      { id: "companion", prompt: "Who could be your companion on a walk?", options: ["A friend who walks with you", "A cloud far away", "A sign at the end of the street"], answerIndex: 0, explanation: "A companion is someone who spends time with you or goes somewhere with you." },
      { id: "concept", prompt: "The concept of sharing is...", options: ["A special container", "An idea about letting others use or enjoy something", "A type of sport"], answerIndex: 1, explanation: "A concept is an idea or understanding of something." },
      { id: "compatible", prompt: "Two computer parts are compatible if they...", options: ["Can work together properly", "Always break when connected", "Must be exactly the same color"], answerIndex: 0, explanation: "Compatible things work well together; compatible people get along well." },
      { id: "burly", prompt: "A burly person is...", options: ["Very tiny and delicate", "Large and strongly built", "Always wearing a hat"], answerIndex: 1, explanation: "Burly describes someone with a large, strong build." },
      { id: "jostle", prompt: "People jostle each other in a crowded hallway when they...", options: ["Whisper quietly", "Stand far apart", "Bump or push against one another"], answerIndex: 2, explanation: "To jostle is to bump or push against someone, often in a crowd." },
      { id: "retirement", prompt: "A person's retirement usually begins when they...", options: ["Stop working at their regular job, often after many years", "Start their first day of school", "Take a short lunch break"], answerIndex: 0, explanation: "Retirement is the time when someone stops working at their regular job, often because of age." },
      { id: "distraction", prompt: "Which could be a distraction while you study?", options: ["A quiet desk", "A loud television that pulls your attention away", "Reading the question carefully"], answerIndex: 1, explanation: "A distraction takes your attention away from what you are doing." },
      { id: "pedestrian", prompt: "Which person is a pedestrian?", options: ["A person driving a bus", "A person riding a bicycle", "A person walking along the street"], answerIndex: 2, explanation: "A pedestrian is a person traveling on foot." },
      { id: "obstacle", prompt: "A fallen tree blocking a path is an obstacle because it...", options: ["Gets in the way of moving forward", "Makes the path wider", "Shows how far you have walked"], answerIndex: 0, explanation: "An obstacle is something that blocks your way or makes progress difficult." },
    ],
  },
  {
    id: "test-2", title: "Test 2", description: "Food, growing, and exchanging",
    words: ["combine", "purchase", "bland", "aroma", "consume", "cluster", "equivalent", "beverage", "crave", "cultivate", "introduce", "brittle", "tropical", "extract", "export"],
    examples: [
      "Combine the flour and water in a bowl.",
      "We saved enough money to purchase a new board game.",
      "The soup was bland until we added a little seasoning.",
      "The aroma of warm bread filled the kitchen.",
      "We consume food to give our bodies energy.",
      "A cluster of purple grapes hung from the vine.",
      "One dollar is equivalent to one hundred cents.",
      "Water is my favourite beverage after a game of soccer.",
      "After our long walk, I began to crave a crunchy apple.",
      "The gardeners cultivate carrots in the school garden.",
      "Let me introduce you to my friend Sam.",
      "The brittle twig snapped when I bent it.",
      "Many tropical plants grow well in warm, humid places.",
      "Use the juicer to extract juice from an orange.",
      "Farmers export some of their apples to other countries.",
    ],
    vocabulary: [
      { id: "combine", prompt: "To combine flour and water means to...", options: ["Keep them far apart", "Put or mix them together", "Throw both away"], answerIndex: 1, explanation: "Combine means to join or mix things together." },
      { id: "purchase", prompt: "When you purchase a book, you...", options: ["Buy it", "Borrow it without paying", "Write its title"], answerIndex: 0, explanation: "To purchase something means to buy it." },
      { id: "bland", prompt: "A bland soup tastes...", options: ["Very spicy", "Extremely sweet", "Mild, with little flavor"], answerIndex: 2, explanation: "Bland food has little strong flavor." },
      { id: "aroma", prompt: "The aroma of fresh bread is its...", options: ["Shape", "Smell", "Price"], answerIndex: 1, explanation: "An aroma is a noticeable smell, often a pleasant one." },
      { id: "consume", prompt: "To consume an apple means to...", options: ["Eat it", "Draw it", "Plant it whole"], answerIndex: 0, explanation: "Consume can mean to eat or drink something, or to use it up." },
      { id: "cluster", prompt: "A cluster of grapes is...", options: ["A single grape seed", "A grape's color", "A group of grapes close together"], answerIndex: 2, explanation: "A cluster is a group of things gathered close together." },
      { id: "equivalent", prompt: "Two amounts are equivalent if they...", options: ["Look different and have different values", "Have the same value or amount", "Are always larger than ten"], answerIndex: 1, explanation: "Equivalent means equal in value, amount, or meaning. For example, 1/2 and 2/4 are equivalent." },
      { id: "beverage", prompt: "Which is a beverage?", options: ["A glass of juice", "A slice of bread", "A bowl"], answerIndex: 0, explanation: "A beverage is a drink." },
      { id: "crave", prompt: "If you crave a snack, you...", options: ["Forget it exists", "Never want to eat it", "Want it very much"], answerIndex: 2, explanation: "To crave something is to want it very strongly." },
      { id: "cultivate", prompt: "Farmers cultivate vegetables by...", options: ["Leaving them without care", "Preparing the soil and helping them grow", "Painting pictures of them"], answerIndex: 1, explanation: "To cultivate plants means to grow and care for them, including preparing the soil." },
      { id: "introduce", prompt: "You introduce a new friend to your class when you...", options: ["Tell the class who the friend is", "Hide the friend from everyone", "Forget the friend's name"], answerIndex: 0, explanation: "To introduce someone is to make them known to others. You can also introduce a new idea or thing." },
      { id: "brittle", prompt: "A brittle twig is likely to...", options: ["Stretch like rubber", "Turn into water", "Break or snap easily"], answerIndex: 2, explanation: "Brittle things are hard but break or snap easily rather than bending." },
      { id: "tropical", prompt: "A tropical island is usually in a region that is...", options: ["Near the North Pole", "Warm and near the equator", "Always covered in ice"], answerIndex: 1, explanation: "Tropical means relating to the warm regions near the equator." },
      { id: "extract", prompt: "To extract juice from an orange means to...", options: ["Take or squeeze the juice out", "Put the juice back inside", "Count the orange's seeds"], answerIndex: 0, explanation: "To extract something means to take it out of something else." },
      { id: "export", prompt: "A country exports fruit when it...", options: ["Buys fruit from another country", "Keeps all its fruit at home", "Sends fruit to another country to be sold"], answerIndex: 2, explanation: "Export means to send goods to another country for sale." },
    ],
  },
  {
    id: "test-3", title: "Test 3", description: "Animals, survival, and understanding",
    words: ["carnivore", "ferocious", "gigantic", "obscure", "premature", "preserve", "puny", "prey", "option", "extinct", "ancestor", "comprehend", "survive", "duration", "carnivorous", "comprehension", "survivor"],
    examples: [
      "A lion is a carnivore that eats other animals.",
      "The story described a ferocious dragon guarding a cave.",
      "A gigantic dinosaur skeleton filled the museum hall.",
      "The book explained an obscure fact that few people knew.",
      "It was premature to announce the winner before the race ended.",
      "We can preserve a forest by protecting its trees and wildlife.",
      "The puny seedling looked tiny beside the tall oak tree.",
      "A rabbit can be prey for a hungry fox.",
      "One option for our project is to make a model of a habitat.",
      "The dodo is extinct because none of these birds are alive today.",
      "My great-grandmother is an ancestor from an earlier generation.",
      "The diagram helped me comprehend how the water cycle works.",
      "Plants need enough water and light to survive.",
      "The duration of our nature walk was thirty minutes.",
      "A carnivorous animal gets its food by eating other animals.",
      "Drawing a food chain showed my comprehension of the lesson.",
      "The rescued sea turtle was a survivor of a powerful storm.",
    ],
    vocabulary: [
      { id: "carnivore", prompt: "A carnivore is an animal that...", options: ["Eats other animals", "Eats only plants", "Makes food from sunlight"], answerIndex: 0, explanation: "A carnivore is an animal that eats other animals. Carnivore is a noun naming the animal." },
      { id: "ferocious", prompt: "A ferocious creature in a story is...", options: ["Always gentle and quiet", "Very fierce or aggressive", "Unable to move"], answerIndex: 1, explanation: "Ferocious means very fierce, aggressive, or violent." },
      { id: "gigantic", prompt: "A gigantic skeleton is...", options: ["Smaller than a seed", "Exactly the size of a pencil", "Extremely large"], answerIndex: 2, explanation: "Gigantic means extremely large or huge." },
      { id: "obscure", prompt: "An obscure fact is one that...", options: ["Is not well known or is difficult to understand", "Everyone already knows", "Must be false"], answerIndex: 0, explanation: "Obscure can mean not well known or difficult to understand. As a verb, it can also mean to hide something or make it hard to see." },
      { id: "premature", prompt: "Calling a race winner before the race ends is premature because it happens...", options: ["At exactly the right time", "Too early, before the proper time", "Long after it is needed"], answerIndex: 1, explanation: "Premature means happening too early or before the expected or proper time." },
      { id: "preserve", prompt: "To preserve a forest means to...", options: ["Remove every tree", "Forget where it is", "Protect it and keep it from harm"], answerIndex: 2, explanation: "To preserve something is to protect it from harm, damage, or loss, or keep it in good condition." },
      { id: "puny", prompt: "A puny seedling beside a tall tree looks...", options: ["Very small or weak", "Enormous and powerful", "Exactly as tall as the tree"], answerIndex: 0, explanation: "Puny means very small or weak. It can be an unkind word when used to describe a person." },
      { id: "prey", prompt: "In a food chain, prey is...", options: ["A plant that makes its own food", "An animal hunted by another animal for food", "A place where animals sleep"], answerIndex: 1, explanation: "Prey is an animal hunted by another animal for food. The hunter is called a predator." },
      { id: "option", prompt: "An option is...", options: ["Something that has already disappeared", "A rule with no possible choice", "One of the choices available"], answerIndex: 2, explanation: "An option is a choice or possibility available to someone." },
      { id: "extinct", prompt: "A species is extinct when...", options: ["No living members of that species remain", "Its members are sleeping", "It moves to a new habitat"], answerIndex: 0, explanation: "Extinct means that a species has no living members left. Rare or endangered species still have living members." },
      { id: "ancestor", prompt: "An ancestor is...", options: ["Someone born after you in your family", "A family member from an earlier generation", "Any person who lives nearby"], answerIndex: 1, explanation: "An ancestor is a person from an earlier generation in your family, such as a great-grandparent. The word can also describe an earlier organism from which later organisms descended." },
      { id: "comprehend", prompt: "To comprehend an explanation means to...", options: ["Repeat it without knowing its meaning", "Hide it from others", "Understand it"], answerIndex: 2, explanation: "To comprehend means to understand. Comprehend is a verb describing the action of understanding." },
      { id: "survive", prompt: "To survive a difficult event means to...", options: ["Stay alive through it", "Cause it to happen", "Know exactly when it will begin"], answerIndex: 0, explanation: "To survive means to remain alive or continue to exist through a difficult situation." },
      { id: "duration", prompt: "The duration of a nature walk is...", options: ["The number of trees you see", "The length of time it lasts", "The place where it starts"], answerIndex: 1, explanation: "Duration is the length of time that something lasts." },
      { id: "carnivorous", prompt: "The word carnivorous describes an animal as...", options: ["Eating only plants", "Living only in water", "Meat-eating"], answerIndex: 2, explanation: "Carnivorous means meat-eating. It is an adjective that describes an animal, while carnivore is the noun naming that kind of animal." },
      { id: "comprehension", prompt: "Your comprehension of a lesson is...", options: ["Your understanding of it", "The number of pages in it", "The time when it begins"], answerIndex: 0, explanation: "Comprehension is understanding, or the ability to understand. It is a noun related to the verb comprehend." },
      { id: "survivor", prompt: "A survivor of a storm is...", options: ["The place where the storm began", "A person or animal that stayed alive through it", "A prediction of the storm's duration"], answerIndex: 1, explanation: "A survivor is a person or animal that remains alive after danger or difficulty. Survive is the action; survivor names the one who survives." },
    ],
  },
];

export function getSpellingList(id: string) {
  return spellingLists.find((list) => list.id === id);
}

export function parseCustomWords(raw: string): string[] {
  const words = [...new Set(raw.split(/[\n,;]+/).map((word) => word.trim().toLowerCase()).filter(Boolean))];
  if (words.length < 1 || words.length > 50) throw new Error("Enter between 1 and 50 different words.");
  if (words.some((word) => !/^[a-z]+(?:['-][a-z]+)*$/.test(word) || word.length > 40)) {
    throw new Error("Use English words up to 40 characters, with optional apostrophes or hyphens. Separate words with commas, semicolons, or new lines.");
  }
  return words;
}
