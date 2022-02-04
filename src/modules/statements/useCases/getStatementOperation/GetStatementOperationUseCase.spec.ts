import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get a registered statement from an user", async () => {
    const { id: user_id } = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456"
    });

    const {id: statement_id } = await createStatementUseCase.execute({
      user_id, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "deposit",
    });  

    const statement = await getStatementOperationUseCase.execute({ user_id, statement_id });

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user_id)
  });

  it("should not be able to get a registered statement from a non existing user", () => {
    expect(async () => {
      const { id: user_id } = await createUserUseCase.execute({
        name: "John Doe",
        email: "john@doe.com",
        password: "123456",
      });
  
      const {id: statement_id } = await createStatementUseCase.execute({
        user_id, 
        type: OperationType.DEPOSIT, 
        amount: 100, 
        description: "deposit",
      });  
  
      await getStatementOperationUseCase.execute({ 
        user_id: "non_existing_id", 
        statement_id,
      });
    }).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not be able to get a non registered statement from a user", () => {
    expect(async () => {
      const { id: user_id } = await createUserUseCase.execute({
        name: "John Doe",
        email: "john@doe.com",
        password: "123456",
      });
  
      await createStatementUseCase.execute({
        user_id, 
        type: OperationType.DEPOSIT, 
        amount: 100, 
        description: "deposit",
      });  
  
      await getStatementOperationUseCase.execute({ 
        user_id, 
        statement_id: "non_existing_id",
      });
    }).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});
