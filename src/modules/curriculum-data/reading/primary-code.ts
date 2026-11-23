import { check as q, meaningActivities as meanings, section as s, type ReadingGrade, type ReadingTopic } from "./model";

const models = {
  1: {
    title: "Alphabet knowledge and common sound-letter patterns",
    heading: "Letter names, shapes, and sounds",
    body: "The alphabet in order is a b c d e f g h i j k l m n o p q r s t u v w x y z. Every letter has an uppercase partner: A/a, B/b, and so on. A letter's name is not always its sound: the name of m is em, while its common sound is /m/. Form a letter using an adult's model, name it in a shuffled set, then recall its position in the alphabet. Compare b and d carefully: their shapes face different ways and their common sounds differ. Alphabetic order helps find words in a list; quick naming and accurate formation need practice across the whole alphabet, not only singing it in sequence.",
    middleHeading: "Short vowels, consonants, and digraphs",
    middle: "Use these short-vowel anchors: a in cat, e in pet, i in sit, o in hot, and u in cup. Common consonant anchors include b/bat, d/dog, f/fan, g/go, h/hat, j/jam, k/kid, l/log, m/map, n/net, p/pig, r/red, s/sun, t/top, v/van, w/wet, y/yes, and z/zip. C commonly represents /k/ in cat; q commonly works with u in queen; x often represents /k/ /s/ in box. Two letters can represent one sound: sh in ship, ch in chip, th in thin or this, and ng in sing. Isolate the first sound in ship, then segment /sh/ /i/ /p/: there are three sounds despite four letters. Blend sounds without adding an extra vowel.",
    lastHeading: "Connect patterns with early reading",
    last: "Original passage: 'A cat sat in a red box. The cat had a nap.' Decode cat, red, box, and nap using their printed sounds, then reread to understand the event. Some frequent words need an explicitly taught unexpected part: the has a common /th/ sound followed by a vowel that can be reduced in speech. Common patterns extend beyond short vowels: a final e often changes a vowel as in cap/cape; ee in see, ai in rain, and oa in boat represent common long-vowel sounds. Oo differs in food and book, so check the taught word rather than use one sound everywhere. Spell a regular word by segmenting its sounds, choosing graphemes, and blending to check it.",
    ids: ["B2.1", "B2.2", "B2.3", "B2.4", "B2.5"],
    practice: ["What is the difference between m's name and its common sound?", "Its name is em and its common sound is /m/."],
    final: ["Why practise letter names in a shuffled set?", "It checks naming beyond memorizing alphabet sequence."],
    second: ["How many phonemes are in ship in this model?", "Three: /sh/ /i/ /p/."],
    third: ["What does the final e commonly do in the taught pair cap/cape?", "Changes the vowel pattern from short to long."],
  },
  2: {
    title: "Vowel patterns and reading across syllables",
    heading: "Compare closed, open, and final-e syllables",
    body: "A syllable is a spoken beat organized around a vowel sound. A closed syllable ends with a consonant after its vowel: cat and the two syllables in rabbit have short vowels in this model. An open syllable ends with its vowel: go and the first syllable of robot commonly use long vowels. In a final-e pattern such as cake, the final e is usually silent and the a is long; compare cap and cape. These are useful patterns, not a guarantee about every word. Mark a manageable part, blend it accurately, then join the next part. The sentence meaning helps confirm the whole word after decoding, not replace attention to the letters.",
    middleHeading: "Read vowel teams and adjust approximations",
    middle: "A vowel team can have more than one letter representing a vowel sound: ee in green, ai in rain, and oa in boat commonly represent long vowels. Ea appears with different sounds in team and head, while oo differs in food and book. Compare the actual taught words instead of inventing a rule that two vowels always say the first one's name. If decoding gives an approximation, try a known spoken form that matches the spelling and check context. In 'We ate bread', the familiar word bread needs the /e/ vowel sound, not the long /ee/ in bead. This set for variability adjusts a plausible decoding; it is not guessing from a picture.",
    lastHeading: "Spell and apply longer regular words",
    last: "Original passage: 'A rabbit sat by the sunset picture. We put a green frame around it.' Rabbit, sunset, and picture must be read as whole words after their parts are examined. Segment sunset into sun and set, then its individual sounds before spelling; compare your graphemes with the model. For rabbit, attend to the two syllables and the doubled b spelling rather than omit letters heard across the boundary. Use known patterns to narrow a choice, verify uncertainty, and reread the whole sentence. Explain what was framed in this passage: it was the picture, not the rabbit. Accurate decoding must connect with the sentence's reference and meaning.",
    ids: ["B2.1", "B2.2"],
    practice: ["Which taught word has an open syllable?", "go"],
    final: ["What is true of a closed syllable in the taught model?", "A consonant follows its vowel, commonly giving a short vowel."],
    second: ["Why do team and head require attention to the whole word?", "The ea spelling represents different vowel sounds."],
    third: ["What was framed in the original rabbit passage?", "The picture."],
  },
  3: {
    title: "Consolidating syllables and spelling endings",
    heading: "Use established syllable knowledge",
    body: "Decode a longer word by using known syllable and spelling patterns, not by guessing from its size. Picnic has two closed syllables with short vowels; robot begins with an open syllable with a long o. Final-e patterns appear in words such as compete, where the final e affects the last vowel pattern. Vowel teams differ: ea in team is not the same sound as ea in head. Consolidated knowledge means retrieving these taught patterns accurately and checking a whole word in context. If a reasonable sound-by-sound approximation is not a familiar spoken form, adjust its vowel with set for variability, then verify that the word fits the sentence.",
    middleHeading: "Hear and spell inflectional endings",
    middle: "The same -ed spelling can represent different sounds: jumped ends with /t/, played ends with /d/, and wanted adds an /id/ syllable. The ending still marks a past form in these words. Likewise -s can sound like /s/ in cats or /z/ in dogs, and -es can add a syllable in wishes. Do not spell these endings only by their surface sound; connect the stable spelling with their meaning and function. Keep the base recognizable where appropriate. Compare hop/hopped, hope/hoped, and try/tried: doubling, removing final e, or changing y to i needs attention to the base pattern rather than one universal rule.",
    lastHeading: "Read, encode, and verify in context",
    last: "Original passage: 'We hoped the model would float. Jo tried a wider base. The class wanted another test.' Hoped is not hopped: the spelling distinction changes the word and meaning. Tried belongs to try and wanted contains the taught -ed ending. Segment and write a dictated regular word, inspect its base and ending, and verify any change against the taught pattern or a reference. Reread the complete passage and explain the sequence and purpose of the test. Practise accurate retrieval before increasing speed. An error correction should name the pattern that changed so the next attempt reflects consolidated learning, not a copied visual shape.",
    ids: ["B2.1", "B2.2", "B2.3"],
    practice: ["Which taught word begins with an open syllable?", "robot"],
    final: ["What is the useful first approach to a longer unfamiliar word?", "Apply known syllable patterns, blend, and check the whole word."],
    second: ["Which word adds an /id/ syllable for -ed?", "wanted"],
    third: ["Why must hoped and hopped be distinguished?", "Their different spellings represent different words and meanings."],
  },
} as const;

export function primaryCodeTopics(grade: ReadingGrade): ReadingTopic[] {
  if (grade > 3) return [];
  const model = models[grade as 1 | 2 | 3];
  return [{
    slug: "alphabet-vowels-and-syllable-patterns", title: model.title, strand: "B",
    sections: [
      s(model.heading, model.body,
        "With an adult, read and explain the taught letter or syllable patterns, then apply them to a new suitable regular word. Grade 1 also names and forms shuffled uppercase/lowercase letters and checks alphabetic order. The adult observes accurate recall and provides a formation model.", grade === 1 ? ["B2.2"] : ["B2.1", "B2.2"],
        q(model.practice[0], model.practice[1], "Only its picture tells the answer.", "Every letter always has the same name and sound.", "The original pattern explanation supports this distinction."),
        q(model.final[0], model.final[1], "Only picture guessing is useful.", "Alphabet song speed determines every word.", "The worked explanation connects printed patterns with reliable retrieval and decoding.")),
      s(model.middleHeading, model.middle,
        "Ask an adult to model two contrasting words from this section. Say their sounds, identify the printed pattern, and explain what remains stable or changes. Write one dictated word and verify it. The adult checks phonemes or syllables, not only the number of letters.", grade === 1 ? ["B2.1", "B2.3"] : grade === 2 ? ["B2.1", "B2.2"] : ["B2.2", "B2.3"],
        q("Why compare contrasting words with the same or similar spelling?", "A printed pattern may represent different sounds or functions.", "English has no recurring patterns.", "The first letter always reveals the whole word.", "Contrasts show both useful patterns and their limits."),
        q(model.second[0], model.second[1], "Every word has exactly one sound.", "No printed letter can help.", "The contrasted words and sound analysis establish the correct answer.")),
      s(model.lastHeading, model.last,
        "Read the original passage to an adult, explain its event or reference, then spell two taught words from dictation. Cover the model and retry a corrected word after explaining its pattern. The adult checks reading accuracy, spelling, and connected understanding.", model.ids,
        q("Why reread a whole sentence after decoding its words?", "To connect accurate word reading with the sentence's meaning.", "To ignore every word that was difficult.", "To replace the text with a picture guess.", "Decoding must serve understanding of connected language."),
        q(model.third[0], model.third[1], "The spelling cannot affect meaning.", "Every vowel pattern is identical.", "The original passage and pattern comparison support this answer.")),
    ],
    transfer: q("How should a learner check a newly spelled regular word?", "Blend its written graphemes and compare with the intended word.", "Ignore its letters after writing.", "Judge it only by handwriting colour.", "Connecting encoding back to decoding helps verify the word."),
    activities: grade === 1
      ? meanings([["sh in ship", "One sound written with two letters"], ["a in cat", "Short vowel anchor"], ["ee in see", "Common long-vowel team"]], "The two-letter spelling for the first sound in ship is", "sh", "The lesson compares sounds, letters, and explicitly taught vowel patterns.", ["Short a anchor", "Short e anchor"], [["cat", 0], ["pet", 1], ["nap", 0], ["red", 1]])
      : grade === 2
        ? meanings([["go", "Open syllable"], ["cat", "Closed syllable"], ["cape", "Final-e pattern"]], "The taught open-syllable word with a long o is", "go", "Known syllable patterns support accurate reading and spelling.", ["Open first syllable", "Closed first syllable"], [["robot", 0], ["rabbit", 1], ["picnic", 1]])
        : meanings([["jumped", "Final -ed sounds /t/"], ["played", "Final -ed sounds /d/"], ["wanted", "Final -ed adds /id/"]], "The past form of try taught in the passage is", "tried", "Stable meaningful endings can have different sounds; base spelling patterns must also be checked.", ["Final -ed without an added syllable", "Final -ed with an added syllable"], [["jumped", 0], ["wanted", 1], ["played", 0]]),
  }];
}
