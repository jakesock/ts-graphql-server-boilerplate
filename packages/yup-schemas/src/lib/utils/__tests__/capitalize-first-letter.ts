import { capitalizeFirstLetter } from "../capitalize-first-letter";

describe("UTILS: Capitalize First Letter", () => {
  it("capitalizes first letter of string", () => {
    const word = "hey";
    const expectedResult = "Hey";

    const capitalizedWord = capitalizeFirstLetter(word);

    expect(capitalizedWord).toStrictEqual(expectedResult);
    expect(capitalizedWord).not.toBe(word);
  });
});
