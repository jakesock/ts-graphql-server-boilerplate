import { Query, Resolver } from "type-graphql";
import { Service } from "typedi";

@Service()
@Resolver()
/**
 * Represents a resolver for the hello world query.
 */
export class HelloResolver {
  /**
   * QUERY: Hello
   * @return {string} The hello world message.
   */
  @Query(() => String)
  hello(): string {
    return "Hello World!";
  }
}
