import { NotAuthenticatedError } from "@monorepo/errors";
import { MiddlewareFn, NextFn, ResolverData } from "type-graphql";
import { MyContext } from "../../types";

/**
 * GraphQL middleware to check if user is authenticated.
 *
 * @param {ReolverData<MyContext>} action - Object that contains GraphQL context, resolve info, args dictrionary and root.
 * @param {NextFn} next - Function to call next middleware provided by type-graphql. Returns a promise that resolves to next middleware fn, if any.
 * @return {NextFn} Move to next middleware, if any.
 */
export const isAuthenticated: MiddlewareFn<MyContext> = async (
  { context }: ResolverData<MyContext>,
  next: NextFn
) => {
  if (!context.req.session.userId) {
    throw new NotAuthenticatedError();
  }

  return next();
};
