import { gqlCall } from "../../../test/utils";

const helloQuery = `
  query HelloQuery {
    hello
  }
`;
describe("HELLO: Hello Query", () => {
  it("returns a string containg Hello World!", async () => {
    const response = await gqlCall({ source: helloQuery });

    expect(response).toMatchObject({
      data: {
        hello: "Hello World!",
      },
    });
  });
});
