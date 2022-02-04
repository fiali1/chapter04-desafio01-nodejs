import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("sould be able to return an user's account balance", async () => {
    const { id: user_id } = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456"
    });

    const accountBalance = await getBalanceUseCase.execute({ user_id });

    expect(accountBalance).toHaveProperty("balance");
    expect(accountBalance).toHaveProperty("statement");
  });

  it("sould not be able to return a non existing user's account balance", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "non_existing_id" });
    }).rejects.toEqual(new GetBalanceError());
  });
});
