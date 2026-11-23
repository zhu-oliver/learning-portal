import type { Lesson, Question } from "../../types";
import { fill, pairs, sequence, sort, search, type ActivitySet } from "../../activities/builders";
import type { GradeContent } from "../types";
import { mathProcesses } from "./expectations";

export type Check = readonly [string, readonly [string, string, string], number, string];
export type Example = readonly [body: string, practice: Check, final: Check];
export type Topic = readonly [key: keyof typeof teaching, title: string, ids: readonly string[], examples: readonly [Example, Example, Example], extra: Check];
// Equation-only draft rationales are replaced with individually explained
// mathematical relationships, not padded with an unrelated stock sentence.
const clarifiedExplanations: Record<string, string> = {
  "100 + 70 + 2 = 172.": "A hundred contributes 100, seven tens contribute 70, and two ones complete 172.",
  "130 + 2 = 132.": "Thirteen ten-unit groups contain 130; the two separate ones bring the total to 132.",
  "150 + 8 = 158.": "Fifteen tens are 150, and adding eight single units gives 158.",
  "340 + 2 = 342.": "Thirty-four tens contribute 340; two ones make the represented total 342.",
  "500 + 10 + 7 = 517.": "The five hundreds, one ten, and seven ones contribute 500, 10, and 7, totalling 517.",
  "400 + 247 − 2 = 645.": "Replacing 398 by 400 adds two extra units. Subtract those two from 647 to restore the original sum, 645.",
  "300 + 126 − 1 = 425.": "The friendly sum 300 + 126 is 426. Since 299 is one smaller than 300, the original sum is 425.",
  "42 + 300 + 25 = 367.": "Count from 258 to 300 by 42, then to 600 by 300 and to 625 by 25; the jumps total the difference, 367.",
  "900 − 645 = 255.": "The 645 pages already read and 255 remaining pages together reach the 900-page goal.",
  "572 + 228 = 800.": "The missing part must take 572 to 800; adding 228 reaches the target exactly.",
  "375 + 125 = 500.": "Adding another group of 125 to 375 preserves the pattern's constant increase and gives 500.",
  "500 − 175 = 325.": "The unknown part is the difference between 500 and 175. Checking 325 + 175 recovers 500.",
  "2 + 2 + 2 = 6.": "Three repetitions each contribute two steps, so the program's accumulated movement is six steps.",
  "2 + 5 + 1 = 8.": "Travelled distance adds the three route segments: two metres, five metres, and one metre total eight.",
  "Add all four sides.": "The rectangle's boundary includes two seven-centimetre sides and two three-centimetre sides, totalling twenty centimetres.",
  "60 + 15 = 75.": "One minute contributes sixty seconds; the extra fifteen seconds make seventy-five seconds altogether.",
  "120 + 10 = 130.": "Two minutes contain one hundred twenty seconds; the additional ten seconds produce one hundred thirty.",
  "2 × 4 = 8.": "Two rows each contain four equal area units, so eight units cover the complete design.",
  "20 − 17 = 3.": "Three dollars of the twenty-dollar payment are not needed for the seventeen-dollar cost and must be returned.",
  "38 + 12 = 50.": "The thirty-eight-dollar cost and twelve dollars returned as change reconstruct the fifty-dollar payment.",
  "90 − 65 = 25 cents.": "Count five cents from 65 to 70 and twenty more to 90; the twenty-five-cent difference is the change.",
  "45 + 35 = 80 cents.": "The forty-five-cent cost plus thirty-five-cent change accounts for all eighty cents paid.",
  "31 + 9 = 40.": "Nine dollars of change added to the thirty-one-dollar cost accounts for the forty dollars tendered.",
  "452 × 100 = 45,200.": "Each of the 452 units is a hundred, so its combined value is 452 hundreds, or 45,200.",
  "It is closer to 4.7.": "4.67 is three hundredths below 4.7 but seven above 4.6, so the nearer tenth is 4.7.",
  "12 × 11 = 132.": "Eleven groups of twelve contain 132, so division by twelve recovers the group count eleven.",
  "3.47 + 6.53 = 10.00.": "Subtracting 3.47 from ten leaves 6.53; adding the difference back is an exact inverse check.",
  "640 + 32 = 672.": "Split twenty-one into twenty and one: thirty-two twenties contribute 640 and one more thirty-two gives 672.",
  "Add another six.": "The constant change is six, so extending from eighteen adds another six to reach twenty-four.",
  "3 × 6 + 4 = 22.": "Substitute six for n, find three groups of six as eighteen, then add the four single units to get twenty-two.",
  "4 × 5 + 2 = 22.": "Substitute five for b; four five-unit groups contribute twenty and two singles bring the expression to twenty-two.",
  "71 − 23 = 48.": "Undo adding twenty-three by subtracting it from seventy-one; forty-eight makes the original equation true.",
  "135 − 90 = 45.": "The extra opening beyond the right-angle benchmark is 135 degrees minus 90 degrees, or 45 degrees.",
  "7 × 4 = 28.": "The rearranged parallelogram corresponds to seven columns each four units high, covering twenty-eight square centimetres.",
  "8 × 5 ÷ 2 = 20.": "A matching parallelogram covers forty square centimetres; one of its two congruent triangles covers twenty.",
  "6 + 4 + 6 + 4 = 20.": "The complete rectangular boundary has two six-centimetre and two four-centimetre sides, adding to twenty centimetres.",
  "12 + 8 + 6 + 4 = 30.": "Transport, supplies, saving, and donation amounts add to thirty dollars, exactly matching the fictional income.",
  "40 − 27 = 13.": "After allocating twenty-seven dollars of forty available, thirteen dollars remain for another planned use.",
  "1440 ÷ 8 = 180.": "Rename both dividend and divisor in tenths: 1440 tenths divided into eight-tenth groups gives 180 groups.",
  "18 ÷ 1.5 = 12.": "Dividing the eighteen-kilometre distance by one and a half hours gives twelve kilometres for each hour.",
  "4 × 1.2 + 1 = 5.8.": "Four copies of 1.2 give 4.8; adding the constant one produces the expression value 5.8.",
  "360 − 120 = 240.": "The counterclockwise route to the same direction completes the remainder of a full 360-degree turn, 240 degrees.",
  "360 − 70 = 290.": "The reflex opening is the rest of the full turn after seventy degrees, so it measures 290 degrees.",
  "90 − 35 = 55.": "Complementary angles total ninety degrees; fifty-five degrees supplies the amount missing from thirty-five.",
  "180 − 68 = 112.": "The adjacent angles on a straight line total 180 degrees, leaving 112 after the known 68 degrees.",
  "180 − 50 − 60 = 70.": "The triangle has 180 degrees in all; its two known angles use 110, leaving seventy for the third.",
  "120 − 30 = 90.": "Thirty dollars are already saved, so ninety more dollars are needed to reach the one-hundred-twenty-dollar goal.",
  "80 ÷ 4 = 20.": "Four equal weekly contributions must total eighty dollars, requiring twenty dollars per week on average.",
  "30/60 = 1/2 = 50%.": "Thirty of sixty is one half of the responses; one half corresponds to fifty out of one hundred.",
  "45/150 = 0.3.": "Divide the forty-five qualifying responses by all 150; the relative frequency 0.3 equals thirty percent.",
  "60 ÷ 200 × 100 = 30.": "Sixty of two hundred is three tenths; converting that proportion to a hundred-part reference gives thirty percent.",
  "0.4 × 360 = 144.": "The category occupies forty percent of a full 360-degree turn, so its circle-graph sector measures 144 degrees.",
  "40 × 1.35 = 54.": "Each foreign dollar is worth C$1.35 under the stated rate; forty such units convert to C$54 before fees.",
  "0.03 × 200 = 6.": "Three percent means three hundredths of the principal; three hundredths of two hundred dollars is six dollars.",
  "300 ÷ 6 = 50.": "The remaining three-hundred-dollar target spread over six months requires fifty dollars monthly on average.",
  "150 − 80 − 20 = 50.": "After necessities of eighty and optional spending of twenty, fifty dollars of the 150-dollar income remain.",
  "9/4 × 4/3 = 3.": "Rename the mixed numbers as nine fourths and four thirds; their product 36/12 simplifies to three.",
  "5/2 × 4/3 = 10/3.": "Dividing five halves by three fourths multiplies by four thirds, yielding ten thirds, or three and one third groups.",
  "10/3 × 6/5 = 4.": "Ten thirds divided by five sixths is sixty fifteenths, which equals four whole groups of that size.",
  "0.005 × 200 = 1.": "Half a percent is five thousandths, not one half. Five thousandths of two hundred is one.",
  "7.2 × 5 = 36.": "Each centimetre represents five kilometres, so 7.2 drawn centimetres correspond to thirty-six kilometres.",
  "2.5x equals ten.": "Add three to both sides to obtain 2.5x = 10, then divide by 2.5 to find x = 4.",
  "√(9+16) = 5.": "The leg squares have areas nine and sixteen. Their sum twenty-five is the hypotenuse square, whose positive side is five.",
  "√(36+64) = 10.": "The rectangular diagonal is the hypotenuse; the squared six- and eight-metre legs total one hundred, whose root is ten.",
  "40 × 1.4 + 2 = 58.": "Convert forty foreign units to fifty-six Canadian dollars, then include the two-dollar fee for a total of C$58.",
};
export function check(prompt: string, answer: string, wrongOne: string, wrongTwo: string, explanation: string): Check {
  const position = prompt.length % 3;
  const options: [string, string, string] = [wrongOne, wrongTwo, wrongOne];
  options[position] = answer;
  options[(position + 1) % 3] = wrongOne;
  options[(position + 2) % 3] = wrongTwo;
  const rationale = clarifiedExplanations[explanation] ?? explanation;
  if (rationale.length <= 20) throw new Error(`Explain the mathematical reason fully: ${prompt}`);
  return [prompt, options, position, rationale];
}
export function example(body: string, practice: Check, final: Check): Example { return [body, practice, final]; }
const teaching = {
  representation: [
    ["Build and name the quantity", "A number describes a quantity, not the size of its printed digits. Build a model and label the units each part represents. Read the model back before recording its numeral. A useful representation preserves the total even when its appearance changes; count or calculate the value of every part rather than judging by how much space the drawing occupies."],
    ["Exchange and decompose", "Decomposition separates a total into useful parts. An exchange must preserve value: replacing a large unit with smaller units changes the number of pieces, not the quantity. Write an equality to explain the exchange. Reassemble the parts to check the original total, and distinguish an equivalent decomposition from a drawing that accidentally adds another unit."],
    ["Use numbers in context", "Choose a representation that helps someone answer the actual question. A place-value chart shows units, a number line shows position, and an expanded expression shows how parts contribute to a total. Label the context as well as the number. Explain which information the representation makes easy to see and which information still needs to be supplied."],
  ],
  comparison: [
    ["Compare on a common scale", "Two quantities can be compared only when their units and reference wholes agree. Locate both on one labelled number line or rewrite them in common units. The greater number is farther right. Read a comparison aloud in both directions to check the symbol, and explain the first place or benchmark that actually distinguishes the values."],
    ["Estimate or round with a reason", "An estimate is a reasoned approximation rather than a random guess. Identify useful nearby benchmarks and state whether the situation permits approximate information. Rounding deliberately removes detail. Use distance to decide which benchmark is closer, and return to exact quantities when a small difference matters for payment, measurement, or a fair comparison."],
    ["Check the decision", "A comparison should support a decision and not replace the reasoning behind it. Explain how you located the values, then test whether a different representation gives the same order. Watch for misleading visual size, missing units, or precision that makes distinct quantities look equal. If an estimate disagrees with an exact calculation, examine the size of the difference."],
  ],
  fractions: [
    ["Define the whole and equal shares", "Before naming a fraction, say what counts as one whole. Equal shares must have equal amounts even when their shapes differ. The numerator counts selected parts; the denominator tells how many equal parts make a whole. Sharing a divisible object can produce part of an object, whereas sharing indivisible objects may leave objects over; explain which interpretation the story allows."],
    ["Rename without changing amount", "Equivalent fractions name the same amount of the same whole. Subdividing every part equally increases both the count of selected parts and the count of parts in one whole. Recombine small pieces to reverse the process. A drawing should show why the value stays fixed; changing only one count generally changes the amount being represented."],
    ["Compare and reason about portions", "Keep the reference whole fixed when comparing portions. Use equal strips, a number line, or a benchmark, and explain the part size rather than relying on the written numerator alone. More sharers usually mean smaller individual portions of a fixed total. Check a sharing answer by recombining every person's portion and recovering all of the starting quantity."],
  ],
  strategies: [
    ["Choose a useful relationship", "A strategy is useful when its steps have a mathematical reason. Make a friendly quantity, split into convenient parts, or use a related fact. Show the original calculation alongside the new one so another learner can see why they are equivalent. The easiest representation may be a set of counters, an array, a number line, or a written expression."],
    ["Explain facts and inverses", "Related operations help verify calculations, but their order matters. Undoing a change should recover the starting quantity. A fact family contains relationships rather than unrelated answers to memorize. Show the same relationship with a model and an equation, then identify which quantities describe parts, totals, equal groups, or the size of each group."],
    ["Estimate and detect errors", "Check the scale of an answer before trusting its exact digits. Compare it with friendly quantities, then use an inverse or a second strategy. A plausible estimate does not prove every digit correct, but it can expose a misplaced unit or an omitted group. Explain both what your check confirms and what still requires exact verification."],
  ],
  addition: [
    ["Represent the change", "Addition joins quantities or increases a starting quantity; subtraction can describe taking away, a difference, or a missing part. Identify the meaning in the story before selecting a calculation. Label a diagram with known quantities and the unknown. An equation should describe that relationship, not merely combine every number that happens to appear in the question."],
    ["Calculate with aligned units", "Combine or subtract corresponding units. When an exchange is needed, explain its value rather than describing a digit as mysteriously moving. A number-line strategy and a written algorithm can represent the same changes in different ways. Record intermediate amounts clearly so that another learner can reconstruct the method and find a possible error."],
    ["Check with the inverse", "A difference plus the subtracted quantity should recover the starting amount. A sum minus one addend should recover the other. Use this relationship to verify an answer, then interpret it with the correct units. In a word problem, check that the answer describes the requested quantity rather than a valid but unrelated calculation."],
  ],
  groups: [
    ["Make equal groups", "Equal groups have the same amount in each group. Label the number of groups and the size of a group separately. An array shows one as rows and the other as entries in each row, so counting all entries gives the total. Rearranging an array preserves the total; adding an extra row changes it. Distinguish equal groups from a collection of unequal piles."],
    ["Share or measure by groups", "Division can ask for each person's share or for the number of groups of a specified size. These questions use the same relationship but assign different meanings to the quotient. Draw or label the groups before calculating. Recombine the groups to check the total, and explain any leftover amount in the units of the original problem."],
    ["Connect a model to calculation", "A drawn model should make a calculation understandable rather than merely decorate the answer. Split a large array into manageable rectangles or remove convenient groups from a total. Add the partial results and check them against the original model. If a remainder occurs, the context decides whether to leave it, share it, or provide another container."],
  ],
  proportional: [
    ["Count parts or scale a relationship", "A multiplicative relationship links corresponding quantities, not just their differences. Identify the reference amount before finding a fraction of it or scaling it. Repeated equal parts can be shown as jumps or groups. Keep the units visible so the calculation distinguishes a number of portions from the amount contained in those portions."],
    ["Use equal-sized units", "When combining fractions, the pieces being counted must be the same size. When comparing ratios or rates, use matching reference quantities. A common unit makes a comparison fair, but it does not remove the context. Explain how you obtained the unit and check that the conversion preserves the original amount or relationship."],
    ["Test a model in a new case", "Use the relationship to predict another case, then check the prediction with a drawing, table, or inverse calculation. A constant difference and a constant ratio describe different patterns. State the assumption that makes your model work, such as identical portions or a fixed price per item, and explain when that assumption might fail."],
  ],
  patterns: [
    ["Find the structure", "Look for what repeats and what changes. A repeating pattern has a core; a growing pattern needs an account of how each new term is built. Describe enough of the structure that someone else can continue it without seeing your next answer. A short list of values can fit more than one rule, so name your intended rule and the starting information."],
    ["Translate representations", "A movement, a drawing, a list of numbers, and a table may show the same pattern. Match corresponding positions rather than superficial appearance. Record a position column and a value column when that helps. Explain which feature remains constant during translation and how the new representation makes the rule easier to inspect."],
    ["Predict and justify", "A prediction needs the rule and the position being predicted. Check it against earlier terms, then use it to fill a missing term or build a later term. Do not confuse the term number with the term's value. If a proposed prediction fits only the last pair but fails elsewhere, revise the rule or explain why the available evidence is insufficient."],
  ],
  algebra: [
    ["Name changing quantities", "A symbol can represent a quantity whose value is unknown or can vary. State its meaning and units before using it. An expression describes a quantity; an equation asserts that two quantities are equal. Substitute a known value carefully and keep the operation order visible. The same symbol has one consistent meaning within a stated problem."],
    ["Preserve a relationship", "An equality is balanced when its sides have the same value. A valid transformation preserves that equality, rather than changing just the side that is convenient. Use a drawing or an inverse operation to explain the transformation. Substitute the proposed answer into the original statement, because solving a changed statement does not automatically solve the original."],
    ["Describe all allowed solutions", "Some mathematical statements have one solution; others allow several or a whole range. State the allowed number domain and test boundary cases. A number line can show a range, while a balance model can explain equality. Explain whether a boundary is included and why, instead of reporting one successful trial as if it were the entire answer."],
  ],
  coding: [
    ["Plan a mathematical program", "Write a short plan that identifies the input, the operations, and the output. A program follows the instructions actually written, not the result you hoped for. Trace each change with a small example before running it. Use meaningful labels for stored quantities and distinguish instructions that happen in order from instructions that start at the same time."],
    ["Trace and change instructions", "A trace records the state after each important instruction. It makes an incorrect result explainable and helps predict the effect of changing code. Change one feature at a time and compare the new trace with the original. Check starting values, event order, and conditions instead of treating every unexpected output as a mysterious computer failure."],
    ["Debug and communicate", "Choose a test that would reveal the suspected mistake, including a boundary or an unusual input where appropriate. State the expected output before running the test. After correcting the program, test again rather than assuming the edit worked. Explain what mathematical relationship the code represents and whether the revised instructions preserve that relationship."],
  ],
  collection: [
    ["Ask an answerable question", "A data question needs a clear population and a clear description of what will be recorded. Decide whether each observation is a category or a measurement. Ask consistently so that responses are comparable. Respect privacy: use invented or anonymous classroom data rather than collecting sensitive information, and record the source and the question alongside the results."],
    ["Organize without losing evidence", "A table or logic diagram should follow an explicit rule. Check that each observation belongs in its intended place and that totals agree with the original collection. Separate a missing response from a response of zero. Categories should be understandable to the reader; if categories overlap, use a representation that can show their intersection."],
    ["Consider whose data are missing", "The people or objects observed affect the conclusion. A small convenient group may not represent everyone, and another group can give different results without either collection being false. State which population your claim describes. Compare a prediction with the collected evidence and explain a limitation rather than extending a classroom result to an entire province."],
  ],
  displays: [
    ["Choose and label a display", "Choose a graph for the question, not just because it looks attractive. Include the source, topic, categories or variables, and units. Explain what one symbol or one scale interval represents. Keep numerical intervals consistent when the axis represents equal changes. A reader should be able to recover a value without guessing how the picture was drawn."],
    ["Summarize what the data show", "A summary emphasizes some information and hides other detail. Read the individual values as well as any central value or visual trend. Explain the calculation or counting rule behind the summary. Compare groups fairly by considering their sizes and distributions, and avoid presenting a summary as if it described every individual observation."],
    ["Make and challenge a claim", "Support a claim with specific values from the display. Check the scale, selected categories, missing information, and source before accepting a persuasive graphic. A large visual difference need not be a large numerical difference. An infographic should combine readable evidence with a clear explanation, not use decoration to replace a defensible interpretation."],
  ],
  probability: [
    ["Describe the possible outcomes", "List or describe the outcomes before predicting an event. Decide whether the outcomes have equal chances; a list alone does not establish fairness. Use the words impossible and certain only when the event cannot happen or must happen under the stated conditions. A likely event can still fail to occur on the next trial."],
    ["Predict and test", "Make a prediction before collecting experimental results. Keep the procedure the same during repeated trials and record every result rather than only the interesting ones. Compare the observation with the prediction. A short run can vary considerably, so explain whether the evidence suggests changing the model or simply reflects ordinary variation."],
    ["Compare situations responsibly", "Different groups or different trial conditions can produce different results. Check whether the underlying outcomes, sampling method, or replacement rule changed. Distinguish a mathematical model from what happened in a finite experiment. Explain what the evidence supports, and avoid claiming that a previous result forces a particular outcome on the next trial."],
  ],
  geometry: [
    ["Describe properties, not appearance", "Classify a shape using properties that remain true when it is moved or turned. Name sides, faces, angles, or symmetry as appropriate. A tilted drawing can still represent the same kind of shape. Check the definition against more than one example and distinguish a property shared by a whole class from a feature of just one sketch."],
    ["Build and match", "Construct or assemble a model and compare its parts. Congruent parts match exactly in size and shape after movement; looking similar from one direction is not sufficient. Explain which lengths or angles provide evidence. When decomposing an object, name both the whole structure and the simpler shapes or objects it contains."],
    ["View and transform", "A different view or position can change a picture without changing an object's dimensions. Explain what the observer can see and what may be hidden. For a transformation or a scaled model, state which properties remain and which measurements change. Use labelled corresponding points or parts so that the comparison can be checked."],
  ],
  location: [
    ["Describe a starting location", "Directions need a starting point and a shared frame of reference. Use landmarks, labelled grid lines, or coordinates rather than an unexplained 'over there'. State how the axes or map directions are oriented. A location and a movement are different: the first describes where something is, and the second describes a change from that location."],
    ["Follow and record a movement", "Read instructions in their given order and track the location after each step. For a turn, state its direction and amount; for a translation, state the horizontal and vertical changes. A diagram with arrows can make an ambiguous instruction visible. Reverse or independently trace the route to check whether the final location is correct."],
    ["Predict a transformed position", "Match corresponding positions before and after a move. A reflection reverses orientation across a line, while a translation slides every point by the same change. A turn needs a centre as well as an angle. State the defining information before predicting an image, and use a second point to check a rule rather than trusting one convenient point."],
  ],
  measurement: [
    ["Select an attribute and unit", "First decide what is being measured: length, mass, capacity, or another attribute. Choose a unit and tool suited to that attribute and the size of the object. A number without a unit is incomplete measurement information. Use a familiar benchmark to estimate before measuring, then explain whether the tool's precision is suitable for the question."],
    ["Measure consistently", "Repeated units must be comparable and placed consistently. For a scale or a ruler, read the starting point as well as the ending point. A measurement can be wrong because of gaps, overlaps, or an incorrect zero even when the counting is accurate. Repeat the measurement or use a second method to distinguish a reading error from a genuine difference."],
    ["Convert and interpret", "A unit conversion renames an amount; it does not physically change the object. Larger units usually need a smaller numerical count for the same amount. Explain the relationship between units, including whether the attribute is length, area, or volume. Check the converted quantity against an everyday benchmark so that an extra factor does not pass unnoticed."],
  ],
  timeangles: [
    ["Choose a reference", "A clock reading and a duration answer different questions, just as a direction and an amount of turn are different. Identify the reference before reading a scale. Use labelled intervals or a familiar benchmark to estimate, then measure more carefully. Explain what the scale marks mean rather than reading an attractive number from the wrong part of the tool."],
    ["Read and construct", "Use the tool's starting position and direction consistently. A clock has repeating cycles; an angle tool may have more than one scale. Record the relevant unit and show the steps of a calculation. A sketch is useful for reasoning but may not be drawn accurately enough to substitute for a measurement or a stated relationship."],
    ["Reason about a missing amount", "A whole interval or a known total turn can be partitioned into parts. Find a missing part by explaining how the known parts combine, then check that all parts reconstruct the original total. Consider wrap-around and boundary cases. Report a duration or angle with its unit, and explain why a visually plausible alternative does not satisfy the relationship."],
  ],
  area: [
    ["Cover the region", "Area measures a two-dimensional region, not just its boundary. Cover the region with equal area units or decompose it into regions with known areas. Avoid gaps, overlaps, and double counting. Explain which lengths belong to the boundary and which help determine the interior. A long boundary does not by itself establish a large enclosed area."],
    ["Develop a calculation", "A formula should have a reason in a model. Rearranging pieces, counting rows, or combining known regions can explain why a calculation works. Label the needed measurements and retain square units for area. If a height is used, distinguish perpendicular height from a slanted side. Check that all pieces of a composite figure are accounted for exactly once."],
    ["Compare and solve backwards", "Use an area relationship to find a missing dimension or compare designs, then substitute the result back into the original relationship. Designs with the same area may have different boundaries. In a three-dimensional model, distinguish the surfaces being covered from the space being filled. State which measurement answers the actual design question."],
  ],
  circles: [
    ["Relate radius, diameter, and boundary", "A radius joins the centre to a point on a circle; a diameter passes through the centre and spans two radii. The circumference measures the curved boundary, not the inside area. Label these three features before substituting into a relationship, and distinguish an exact expression involving pi from a decimal approximation used for measurement."],
    ["Construct from given information", "A compass keeps a fixed distance from a centre while drawing the boundary. Convert a given diameter to a radius before setting that distance. If circumference is given, recover the diameter or radius using the same relationship that produces circumference. A sketch should show what is known and what is calculated, rather than trusting an unlabelled picture."],
    ["Check a circle model", "Compare a circle's measured boundary with its diameter using string and a ruler. The ratio is approximately pi for every circle, within measurement error. Doubling the radius doubles circumference, but it does not merely double area. State which attribute the question asks about and check the units so a boundary answer is not mistaken for a covered surface."],
  ],
  righttriangles: [
    ["Identify the right-angle relationship", "The Pythagorean relationship applies to right triangles. The hypotenuse is opposite the right angle and is the longest side. Squares built on the two legs have areas that together equal the square on the hypotenuse. Label those roles before writing an equation; applying the same relationship to an arbitrary triangle is not justified."],
    ["Find a missing side", "If the hypotenuse is unknown, add the squared legs and take the positive square root. If a leg is unknown, subtract the known leg's square from the hypotenuse's square before rooting. Length and squared length are different quantities, so retain the operation order and check that the resulting side is plausible in the labelled triangle."],
    ["Apply and verify a model", "Draw the right triangle hidden in a distance or construction problem and state why the angle is right. A diagram can identify the unknown even when the triangle is part of a larger shape. Substitute the calculated length back into the squared relationship, retain units, and explain any rounding because the exact length may not be a whole number."],
  ],
  interest: [
    ["Model simple interest", "Simple interest uses the original principal as the reference each period. State the rate, time unit, and starting amount before calculating. A percent is a rate per hundred, not a fixed dollar amount. Distinguish the interest earned or charged from the final balance, and label whether a fee or an additional contribution is included in the model."],
    ["Build a compound recurrence", "Compound interest adds each period's interest to the balance used in the next period. A spreadsheet or short program can record starting balance, interest, and ending balance for every row. The rate period must match the iteration period. Do not round every intermediate value unnecessarily, and explain whether displayed values or stored exact values drive later calculations."],
    ["Compare long-term consequences", "A larger final balance can benefit a saver but increase the cost of borrowing. Compare the same principal, rate periods, duration, and fees when judging two models. Small rate differences can accumulate over time, but real terms and risks still matter. Test a digital calculation with a one-period case before trusting a longer table."],
  ],
  money: [
    ["Represent or transfer value", "Money has a numerical value and a purpose in a transaction. A greater number of coins need not mean more money. Distinguish the amount transferred from the method used to transfer it. Read the units and any stated conditions carefully. Work with fictional purchases and labelled amounts; practising financial mathematics does not require sharing real account information."],
    ["Calculate a transaction", "List what is being paid for before adding amounts or applying a rate. State whether a quoted amount includes a fee or tax. Use exact arithmetic for a final payment and an estimate as a check. A fictional rate in a worked example is an assumption for that example, not a claim that every purchase or financial service uses that rate."],
    ["Check value and change", "Check a transaction by recombining the parts: payment, cost, change, or converted amounts should satisfy the original relationship. Compare like quantities when judging value and include relevant fees. The cheapest listed price may not be the best choice if the quantity, usefulness, or conditions differ. Explain both the calculation and the decision it supports."],
  ],
  planning: [
    ["Identify a goal and constraints", "A financial plan connects a stated goal with income, spending, and available resources. Use fictional amounts rather than classmates' personal finances. Separate a need, a preference, and an assumption; people can reasonably make different choices in different circumstances. A good plan explains the time available and the costs that must be covered before a goal can be reached."],
    ["Build and revise a plan", "Record each category consistently and compare planned amounts with actual or simulated amounts. Check that the whole plan balances, not merely one attractive line in it. If a cost changes, revise the plan rather than hiding the difference. Explain which adjustment is possible and what consequence it has for the timing or size of the original goal."],
    ["Compare options and consequences", "An option should be judged using its full conditions and the person's goal. Fees, time, risk, and access can matter as well as the headline amount. Use reliable information and identify assumptions. A calculation supports a decision but cannot decide every personal priority. Explain a trade-off and check whether the conclusion changes when one stated condition changes."],
  ],
} as const;

const investigations: Record<keyof typeof teaching, readonly [string, string, string]> = {
  representation: [
    "Build the quantity with labelled unit groups. Read it aloud, cover one part, and ask a partner to reconstruct the missing contribution.",
    "Draw two equivalent decompositions and connect exchanged units with arrows. Explain the total value on each side of your exchange.",
    "Design a supply label and a matching model for the worked quantity. Choose which form helps someone check the count most quickly.",
  ],
  comparison: [
    "Locate the quantities on one labelled line. Explain the first benchmark or place that separates them, then read the comparison both ways.",
    "Mark neighbouring benchmarks and their midpoint. Explain the distances, and identify a situation where the exact quantity must be retained.",
    "Challenge a claim that the longest numeral is greatest. Use the worked quantities and a common-unit representation to resolve the disagreement.",
  ],
  fractions: [
    "Cut or draw equal-sized wholes and distribute every part fairly. Recombine all shares to show that nothing was lost or counted twice.",
    "Subdivide a strip, then recombine its parts. Write two fractional names for the shaded amount and explain how the counts changed.",
    "Compare individual portions using identical wholes. Explain how changing the number of sharers affects portions while the total stays fixed.",
  ],
  strategies: [
    "Draw a friendly-number or split-array strategy. Label each adjustment so that a partner can explain why the new calculation is equivalent.",
    "Create a fact or factor diagram and an inverse check. Distinguish the role of each number rather than listing disconnected equations.",
    "Estimate before calculating. Introduce a deliberate place-value or operation-order mistake and show how a check makes it detectable.",
  ],
  addition: [
    "Make a part-whole or change diagram for the story. Label the unknown and explain why joining or comparing quantities fits the question.",
    "Show each exchange with units and with a written calculation. Compare a number-line method with your algorithm to find matching changes.",
    "Write the inverse calculation and interpret its units. Ask a partner which original quantity the check should recover and why.",
  ],
  groups: [
    "Build an equal-group or sign-pattern model. Label groups and group size separately, and identify which part of the model controls the total.",
    "Represent the quotient as a missing factor or a number of groups. Multiply back to verify it, preserving the signs and units.",
    "Connect every partial calculation to part of an array, strip, or signed model. Explain how an omitted or duplicated part changes the answer.",
  ],
  proportional: [
    "Draw the reference whole or corresponding groups. Explain whether a numerator counts parts or a ratio compares different quantities.",
    "Compare two rates or fraction quantities with a common unit. State why the conversion preserves the original relationship.",
    "Make a table of corresponding cases and test one prediction. Discuss a fixed fee or changing portion size that would invalidate the model.",
  ],
  patterns: [
    "Circle a repeating core or annotate each constant change. Find a plausible competing rule and explain what further term would distinguish it.",
    "Translate the pattern into a drawing, number list, and position-value table. Explain which information each representation preserves.",
    "Hide a term and ask a partner to recover it using the stated rule. Check both neighbouring terms rather than only the last transition.",
  ],
  algebra: [
    "Draw variable and constant units using different symbols. State what each symbol means, then substitute a value without changing its meaning.",
    "Model the balance and record an inverse step on both sides. Substitute your candidate into the original equation to find possible errors.",
    "Test a boundary and a nearby value. Display all permitted values on a number line and explain whether the domain allows fractions or only integers.",
  ],
  coding: [
    "Write pseudocode, name its input and output, and act out a small run. Track the state after each command instead of jumping to the hoped-for result.",
    "Change one command or condition and predict the altered trace. Identify whether order, concurrency, repetition, or a boundary caused the difference.",
    "Choose a test that reveals a specific bug. Record the expected and observed result, correct the instructions, and run the same test again.",
  ],
  collection: [
    "Write a question and identify its population and attributes. Use anonymous invented records, then explain which information each record must preserve.",
    "Organize the worked records in an appropriate table or logic diagram. Check totals and explain where an intersection or interval boundary belongs.",
    "Plan a second collection and predict what might differ. Discuss a missing group or uncontrolled attribute that limits a broader conclusion.",
  ],
  displays: [
    "Draw the appropriate graph with title, source, units, and key. Ask a partner to recover one value and explain how the scale encodes it.",
    "Calculate or count the summary and compare it with individual observations. Explain what the summary reveals and what detail it hides.",
    "Write an evidence-based claim, then challenge its scale or missing information. Improve an infographic so the claim and its limitations are visible.",
  ],
  probability: [
    "List outcomes or draw a staged tree. Mark favourable outcomes and explain the fairness or independence assumptions before predicting.",
    "Run or simulate a small experiment, recording every complete trial. Compare observed frequency with the model and explain ordinary variation.",
    "Change the population or replacement rule and predict its effect. Keep complete trials separate so the denominator matches the tested event.",
  ],
  geometry: [
    "Classify several examples and a non-example by properties. Turn each drawing and test whether your definition still identifies the shape.",
    "Construct with paper or blocks and compare corresponding parts. Use several views or an overlay to decide which evidence establishes a match.",
    "Draw a transformed or scaled model and label corresponding parts. Explain which lengths, angles, areas, or viewpoints change and which remain.",
  ],
  location: [
    "Mark the starting location and frame of reference. Draw an arrow for each movement and explain how signed changes relate to directions.",
    "Trace every intermediate location and label the mirror or axis. Ask a partner to repeat the instructions without changing the shared viewpoint.",
    "Predict another vertex's image and verify the transformation rule. Compare two operation orders to explain whether their final images coincide.",
  ],
  measurement: [
    "Choose a suitable unit and tool for the stated attribute. Make a benchmark estimate and explain why a different attribute needs a different unit.",
    "Measure or rename the quantity using consistent units. Check zero points, boundaries, or prefix scales, and reverse the conversion to verify.",
    "Build a line, square, or cube unit model. Explain why a length, area, or volume conversion uses one, two, or three scale factors.",
  ],
  timeangles: [
    "Mark the reference, starting reading, or known angles. Choose the relevant clock, calendar, or angle scale and justify its units.",
    "Construct a labelled example and check the scale direction. Explain a boundary, parallel-line condition, or unit relationship used in your reading.",
    "Find a missing interval or angle using a stated total. Recombine all parts and show why a tempting alternate answer fails the relationship.",
  ],
  area: [
    "Cover or decompose the worked region. Label every piece, remove overlaps, and distinguish boundary lengths from the surface being measured.",
    "Derive the calculation from rearranged pieces or a solid net. Identify perpendicular heights and any internal faces that must not be counted.",
    "Compare another design or solve for a missing dimension. Substitute back, retain square or cubic units, and explain the design trade-off.",
  ],
  circles: [
    "Mark centre, radius, and diameter on a disk. Measure its boundary with string and compare the circumference-to-diameter ratio.",
    "Set a compass from a calculated radius and draw the circle. Recover the original diameter or circumference to check the construction.",
    "Compare two circle sizes and a semicircle boundary. Explain why a complete perimeter may include a straight edge as well as an arc.",
  ],
  righttriangles: [
    "Build squares on the three sides of a right triangle. Compare the leg-square areas with the hypotenuse square and label the right angle.",
    "Solve a missing leg and a missing hypotenuse separately. Explain why one requires subtraction and the other addition before taking the root.",
    "Find a right triangle inside a rectangle or route diagram. Compare a diagonal with travel along edges and state any approximation used.",
  ],
  money: [
    "Represent the amount or currency transfer with labelled units. Compare the value moved with the method used and list stated fees.",
    "Record subtotal, rate, tax, discount, or fee as separate lines. Estimate and calculate, explaining which amount is the rate's reference.",
    "Check net value or change with an inverse calculation. Compare complete conditions and explain why the largest headline offer may not be best.",
  ],
  planning: [
    "Write a fictional goal with amount, timeline, and resources. Separate fixed necessities from choices and state which assumptions need evidence.",
    "Build a planned-versus-actual table and model an unexpected cost. Revise the saving rate, flexible spending, or deadline explicitly.",
    "Compare feasible options respectfully. Describe a personal or social constraint and explain how a change in conditions could alter your recommendation.",
  ],
  interest: [
    "Calculate interest and balance separately. Label principal, rate, and period, then explain why the simple model uses a fixed reference.",
    "Build a spreadsheet recurrence with one row per period. Check the first two rows by hand and retain enough precision for later growth.",
    "Compare equal-duration models including fees. Explain the saver and borrower consequences and test whether the rate period matches each iteration.",
  ],
};

// Each entry locates the corresponding authored Topic.ids expectation in its
// principal teaching section. Single-expectation topics develop it throughout.
// Broad A1/C4 processes remain lesson-wide rather than inflating specific counts.
const allocations: Record<number, Partial<Record<keyof typeof teaching, readonly (number | readonly number[])[]>>> = {
  1: {
    representation: [[0, 2], [0, 1]], comparison: [0, 1, 2], fractions: [[0, 1], 1, 2],
    strategies: [[1, 2], 1, [0, 2]], proportional: [[0, 1], 2], algebra: [0, 1, 2],
    collection: [0, [1, 2]], displays: [0, 1, 2], probability: [[0, 1], 2],
    geometry: [0, 1, 2], location: [0, [1, 2]], measurement: [0, [0, 1, 2]], area: [[0, 1], 2],
  },
  2: {
    comparison: [0, 1, 1, 2], fractions: [[0, 2], 1], strategies: [1, 1, [0, 2]],
    groups: [[0, 2], 1], algebra: [0, 1, 2], collection: [[0, 1], 2], displays: [0, 1, 2],
    probability: [0, [1, 2]], geometry: [0, [1, 2]], location: [0, [1, 2]], measurement: [0, 1, 2],
  },
  3: {
    representation: [0, 2, 1], comparison: [0, [1, 2]], fractions: [[0, 2], 1],
    strategies: [2, 1, 0], addition: [[0, 1], [0, 1, 2]], groups: [[0, 1], 2], proportional: [0, [1, 2]],
    algebra: [0, 1, 2], collection: [0, [1, 2]], displays: [0, 1, 2], probability: [0, [1, 2]],
    geometry: [0, 1, 2], measurement: [0, 1, 2, 2, 2], area: [1, 0, 2],
  },
  5: {
    representation: [[0, 1, 2], 0], comparison: [[0, 2], 1, [0, 2]], fractions: [[0, 1], [1, 2]],
    strategies: [2, 0, 1], groups: [0, [1, 2]], proportional: [0, 1, 2],
    algebra: [0, 0, 1, 2], collection: [[0, 2], 1], displays: [0, 0, 1, 2],
    probability: [0, [1, 2]], geometry: [0, 1, 2], location: [0, [1, 2]],
    measurement: [0, [1, 2]], timeangles: [0, [1, 2]], area: [[0, 1], 2],
    money: [0, 1, 2, 0], planning: [[0, 1], 2],
  },
  6: {
    representation: [0, [1, 2]], comparison: [[0, 2], [0, 2], 1, 2], fractions: [0, 1, 2],
    strategies: [2, 1, 1, 0], groups: [0, 1, 2], proportional: [[0, 1, 2], 1],
    algebra: [0, 0, 1, 2], collection: [0, [1, 2]], displays: [0, 0, 1, 2],
    probability: [0, [1, 2]], geometry: [[0, 2], 1], location: [0, [1, 2]], timeangles: [0, [1, 2]],
    area: [0, [1, 2], [1, 2]], money: [0, 1, 2], planning: [0, [1, 2]],
  },
  7: {
    representation: [0, [1, 2]], comparison: [0, 0, 1, 2, 2], strategies: [2, [0, 1], 2],
    groups: [[0, 1], 2], proportional: [0, 0, [1, 2]], algebra: [0, 0, 1, 2],
    collection: [[0, 2], 1], displays: [0, 0, 1, 2], probability: [0, [1, 2]],
    geometry: [0, 1, 2], measurement: [[0, 2], [1, 2]], circles: [[0, 2], 1], area: [0, 1, 2],
    money: [0, 1, 2], planning: [0, 1, 2],
  },
  8: {
    representation: [[0, 1], 2], comparison: [[0, 2], [1, 2], 1], fractions: [0, [1, 2]],
    strategies: [0, 1, 2], proportional: [0, [1, 2]], algebra: [0, 0, 1, 2],
    collection: [0, [1, 2]], displays: [0, 0, [1, 2], 2], probability: [0, [1, 2]],
    geometry: [0, 1, [1, 2]], money: [0, 1, 2], planning: [[0, 1], [1, 2]],
  },
};

function sectionExpectations(grade: number, key: keyof typeof teaching, ids: readonly string[], sectionIndex: number) {
  if (ids.length === 1) return ids;
  const explicit = allocations[grade][key];
  if (explicit) return ids.filter((_, index) => {
    const position = explicit[index];
    return typeof position === "number" ? position === sectionIndex : position.includes(sectionIndex);
  });
  if (key === "patterns") {
    const positions: Record<string, number> = { "C1.1": 0, "C1.2": 1, "C1.3": 2, "C1.4": 1 };
    return ids.filter((id) => positions[id] === sectionIndex);
  }
  if (key === "coding") return sectionIndex === 0 ? ids.filter((id) => id === "C3.1") : ids;
  throw new Error(`Missing specific section allocation: grade ${grade} ${key}`);
}

function question(check: Check, id: string, sectionIndex: number): Question {
  return { id, sectionIndex, prompt: check[0], options: check[1], answerIndex: check[2], explanation: check[3] };
}

function numericForms(value: string, decimalPlaces = 3): string[] {
  const ascii = value.replace(/−/g, "-").replace(/,/g, "");
  const [whole, fraction = ""] = ascii.split(".");
  const trimmedFraction = fraction.replace(/0+$/, "");
  const minimal = `${whole}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const bases = [minimal, `${grouped}${trimmedFraction ? `.${trimmedFraction}` : ""}`];
  const variants = bases.flatMap((base) => {
    const places = base.includes(".") ? base.length - base.indexOf(".") - 1 : 0;
    return [base, ...Array.from({ length: Math.max(0, decimalPlaces - places) }, (_, index) =>
      `${base}${places ? "" : "."}${"0".repeat(index + 1)}`)];
  });
  return [...new Set([value, ...variants, ...variants.map((form) => form.replace(/-/g, "−"))])];
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : greatestCommonDivisor(b, a % b);
}

// These are finite, explicit answer lists attached to individual problems.
// Scoring never strips currency, punctuation, or units from arbitrary input.
function finalActivity(check: Check, grade: number, title: string): ActivitySet[1] {
  const [prompt, options, answerIndex, explanation] = check;
  const answer = options[answerIndex];
  const accepted = new Set<string>([answer]);
  let instruction = "";
  const numeric = /^([−-]?\d[\d,]*(?:\.\d+)?)(?:\s+(counters|tens|real units|times|metres|seconds|g|cm²|cm|km|L|dollar))?$/.exec(answer);
  const currency = /^(\$)(\d[\d,]*(?:\.\d+)?)$/.exec(answer);
  const cents = /^(\d+)¢$/.exec(answer);
  const variable = /^x\s*=\s*([−-]?\d+(?:\.\d+)?)$/.exec(answer);
  const coordinate = /^\(([−-]?\d+(?:\.\d+)?),\s*([−-]?\d+(?:\.\d+)?)\)$/.exec(answer);
  const fraction = /^([−-]?\d+)\/(\d+)$/.exec(answer);
  const angle = /^(\d+)°$/.exec(answer);
  const namedFraction = /^One (third|fourth)( pizza)?$/.exec(answer);

  if (/Which number is a perfect square|Which lies between/i.test(prompt)) {
    return sort(`Classify the proposed answers: ${prompt}`, ["Answers the question", "Does not answer the question"],
      options.map((option, index) => [option, index === answerIndex ? 0 : 1] as const), explanation);
  } else if (currency) {
    instruction = "Enter the amount in dollars. The dollar sign and grouping commas are optional; cents may be written with two decimal places.";
    numericForms(currency[2], 2).forEach((form) => { accepted.add(form); accepted.add(`$${form}`); });
  } else if (cents) {
    instruction = "Enter the change in cents, not dollars. You may omit the cent sign.";
    numericForms(cents[1], 2).forEach((form) => { accepted.add(form); accepted.add(`${form}¢`); accepted.add(`${form} cents`); });
  } else if (variable) {
    instruction = "Enter the numerical value of x. You may include x= before your number.";
    numericForms(variable[1]).forEach((form) => {
      accepted.add(form);
      ["x=", "x = ", "x= ", "x ="].forEach((prefix) => accepted.add(`${prefix}${form}`));
    });
  } else if (coordinate) {
    instruction = "Enter the ordered pair as x,y or (x,y), in horizontal-then-vertical order.";
    const xForms = [coordinate[1], coordinate[1].replace(/−/g, "-")];
    const yForms = [coordinate[2], coordinate[2].replace(/−/g, "-")];
    for (const x of xForms) for (const y of yForms) {
      accepted.add(`${x},${y}`); accepted.add(`${x}, ${y}`);
      accepted.add(`(${x},${y})`); accepted.add(`(${x}, ${y})`);
    }
  } else if (fraction) {
    const numerator = Number(fraction[1].replace(/−/g, "-"));
    const denominator = Number(fraction[2]);
    const divisor = greatestCommonDivisor(numerator, denominator);
    const n = numerator / divisor, d = denominator / divisor;
    accepted.add(`${n}/${d}`); accepted.add(`${n} / ${d}`);
    accepted.add(`${numerator} / ${denominator}`);
    instruction = "Enter a fraction using numerator/denominator. A reduced fraction is accepted.";
    if (Math.abs(n) > d) {
      const whole = Math.trunc(n / d), remainder = Math.abs(n % d);
      if (remainder) {
        accepted.add(`${whole} ${remainder}/${d}`);
        accepted.add(`${whole} and ${remainder}/${d}`);
        instruction += " A mixed number with a space between the whole and fractional parts is also accepted.";
      }
    }
    if (d === 1) accepted.add(String(n));
    let residual = d;
    while (residual % 2 === 0) residual /= 2;
    while (residual % 5 === 0) residual /= 5;
    // Fraction-naming exercises retain fractional notation. Exact terminating
    // decimal/percent probability forms are taught explicitly from Grade 6.
    if (grade >= 6 && /probability|relative frequency/i.test(prompt) && residual === 1) {
      numericForms(String(n / d)).forEach((form) => accepted.add(form));
      numericForms(String(n / d * 100), 2).forEach((form) => accepted.add(`${form}%`));
      instruction += " An exact decimal or percent is also accepted; do not round.";
    }
    for (const form of [...accepted]) accepted.add(form.replace(/-/g, "−"));
  } else if (namedFraction) {
    const d = namedFraction[1] === "third" ? 3 : 4;
    ["", " pizza", " of a pizza"].forEach((suffix) => accepted.add(`1/${d}${suffix}`));
    accepted.add(`one ${namedFraction[1]}`);
    if (d === 4) { accepted.add("one quarter"); accepted.add("a quarter"); }
    instruction = `Enter the share as a fraction of one ${namedFraction[2] ? "pizza" : "whole"}, using numerator/denominator notation or fraction words.`;
  } else if (angle) {
    instruction = "Enter the angle in degrees. You may omit °; radians are not requested.";
    numericForms(angle[1]).forEach((form) => { accepted.add(form); accepted.add(`${form}°`); accepted.add(`${form} degrees`); });
  } else if (numeric) {
    const [, value, unit] = numeric;
    instruction = unit
      ? `Enter the number in ${unit === "dollar" ? "dollars" : unit}. You may omit the stated unit; do not change units.`
      : "Enter the numerical answer. Grouping commas and trailing decimal zeros are optional.";
    numericForms(value).forEach((form) => {
      accepted.add(form);
      if (unit) {
        accepted.add(`${form} ${unit}`);
        if (["g", "cm", "cm²", "km", "L"].includes(unit)) accepted.add(`${form}${unit}`);
        if (unit === "cm²") {
          accepted.add(`${form} cm^2`); accepted.add(`${form} cm2`);
          accepted.add(`${form} square centimetres`); accepted.add(`${form} square centimeters`);
        }
        if (unit === "dollar") { accepted.add(`$${form}`); accepted.add(`${form} dollars`); }
        if (unit === "metres") accepted.add(`${form} m`);
      }
    });
  } else {
    // A multiple-choice explanation, non-unique example, or classification
    // should not become an exact-phrase typing test.
    return sort(`Classify the proposed answers: ${prompt}`, ["Answers the question", "Does not answer the question"],
      options.map((option, index) => [option, index === answerIndex ? 0 : 1] as const), explanation);
  }
  return { ...fill(`${prompt.replace(/(?:\.\.\.|\?)$/, "")}. ${instruction}`, [...accepted], explanation, ""),
    prompt: `Apply ${title.toLowerCase()} to a new case.` };
}

export function buildGrade(grade: number, expectations: GradeContent["expectations"], topics: readonly Topic[]): GradeContent {
  const source = `https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g${grade}-math/strands`;
  const activities: Record<string, ActivitySet> = {};
  const lessons = topics.map(([key, title, ids, examples, extra], index): Lesson => {
    const slug = `g${grade}-math-${key}`;
    const support = teaching[key];
    const sections = examples.map(([body, practice], sectionIndex) => ({
      heading: support[sectionIndex][0],
      body: `${body} ${support[sectionIndex][1]}${sectionIndex === 0 ? " Review your model's assumptions and test whether it fits the situation; revise it if the check fails. Explain your reasoning respectfully, ask for help when stuck, and reflect on which strategy helped you persevere." : ""}`,
      activity: `${practice[0]} ${investigations[key][sectionIndex]}`,
      expectations: [...(sectionIndex === 0 ? ["A1", "C4"] : []), ...sectionExpectations(grade, key, ids, sectionIndex)],
      questions: [question(practice, `${slug}-practice-${sectionIndex}`, sectionIndex)],
    }));
    const finals = [
      question(examples[0][2], `${slug}-final-0`, 0),
      question(extra, `${slug}-final-reason`, 0),
      question(examples[1][2], `${slug}-final-1`, 1),
      question(examples[2][2], `${slug}-final-2`, 2),
    ];
    const answers = examples.map((example) => [example[1][0], example[1][1][example[1][2]]] as const);
    const uniqueAnswers = answers.filter((answer, answerIndex) => answers.findIndex((other) => other[1] === answer[1]) === answerIndex);
    const explanation = examples.map((example) => example[1][3]).join(" ");
    const practice = key === "fractions" && grade >= 3
      ? { id: `${slug}-fraction-labels`, type: "diagram" as const,
        prompt: "Label the numerator and denominator in the fraction three fifths.",
        explanation: "The numerator 3 counts the selected fifths; the denominator 5 tells how many equal parts make one whole.",
        image: "/images/fraction-parts.svg",
        description: "The fraction three fifths, with 3 above the fraction bar and 5 below it.",
        labels: [{ id: "numerator", text: "Numerator" }, { id: "denominator", text: "Denominator" }],
        targets: [{ id: "top", x: 60, y: 25, labelId: "numerator" }, { id: "bottom", x: 60, y: 75, labelId: "denominator" }] }
      : index % 4 === 0 || uniqueAnswers.length < 2
      ? sort(`Select correct statements about ${title.toLowerCase()}.`, ["Correct", "Incorrect"],
        examples.flatMap((example) => [[`${example[1][0]} → ${example[1][1][example[1][2]]}`, 0] as const,
          [`${example[1][0]} → ${example[1][1][(example[1][2] + 1) % 3]}`, 1] as const]), explanation)
      : pairs(`Match the worked checks for ${title.toLowerCase()}.`, uniqueAnswers, explanation);
    const f1 = examples[1][2];
    const f2 = examples[2][2];
    activities[slug] = [practice,
      finalActivity(f1, grade, title),
      key === "coding" ? search(["CODE", "TRACE", "TEST"], "Trace the instructions, test the predicted result, and explain corrections.", "Find the three habits used to check a mathematical program.")
        : sequence(`Reconstruct the reasoning for this new ${title.toLowerCase()} check: ${f2[0]}`,
          ["Identify the given quantities and the requested relationship.", f2[3], `Conclude: ${f2[1][f2[2]]}.`], f2[3])];
    return { slug, title, grade, source, strand: ids[0][0], expectations: ["A1", "C4", ...ids],
      unitSlug: `g${grade}-math-${ids[0][0].toLowerCase()}`, unitTitle: `${ids[0][0]} · ${title}`,
      introduction: `Explore ${title.toLowerCase()} through models, worked examples, and independently checked reasoning. Name assumptions, test a prediction, and revise your model if the check fails. If you feel stuck, pause, try another representation, and discuss a strategy respectfully with a partner.`,
      durationMinutes: 35, sections, questions: finals };
  });
  return { edition: 2020, source, expectations, processes: mathProcesses, lessons, activities };
}
