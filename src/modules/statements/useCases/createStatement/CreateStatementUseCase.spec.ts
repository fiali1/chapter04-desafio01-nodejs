import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from "@modules/statements/entities/Statement";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemorySatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    
    inMemorySatementsRepository = new InMemoryStatementsRepository();
    
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository, 
      inMemorySatementsRepository
    );
  });

  it("should be able to create a new deposit statement", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "123456"
    }

    const { id: user_id } = await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      user_id, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "deposit",
    };

    const statementCreated = await createStatementUseCase.execute(statement);

    expect(statementCreated).toHaveProperty("id");
    expect(statementCreated.user_id).toBe(user_id);
    expect(statementCreated.type).toBe(OperationType.DEPOSIT);
    expect(statementCreated.amount).toBe(100);
  });

  it("should be able to create a new withdraw statement", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "123456"
    }

    const { id: user_id } = await createUserUseCase.execute(user);

    const depositStatement: ICreateStatementDTO = {
      user_id, 
      type: OperationType.DEPOSIT, 
      amount: 100, 
      description: "deposit",
    };

    const withdrawStatement: ICreateStatementDTO = {
      user_id, 
      type: OperationType.WITHDRAW, 
      amount: 100, 
      description: "withdraw",
    };

    await createStatementUseCase.execute(depositStatement);

    const statementCreated = await createStatementUseCase.execute(withdrawStatement);

    expect(statementCreated).toHaveProperty("id");
    expect(statementCreated.user_id).toBe(user_id);
    expect(statementCreated.type).toBe(OperationType.WITHDRAW);
    expect(statementCreated.amount).toBe(100);
  });

  it("should be able to create a new statement for a non existing user", () => {
    expect(async () => {  
      const statement: ICreateStatementDTO = {
        user_id: "non-existing-user", 
        type: OperationType.DEPOSIT, 
        amount: 100, 
        description: "deposit",
      };
  
      await createStatementUseCase.execute(statement);
    }).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should be able to create a new withdraw statement for an user with insufficient funds", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "john@doe.com",
        password: "123456"
      }
  
      const { id: user_id } = await createUserUseCase.execute(user);
  
      const statement: ICreateStatementDTO = {
        user_id, 
        type: OperationType.WITHDRAW, 
        amount: 100, 
        description: "withdraw",
      };
  
      await createStatementUseCase.execute(statement);  
    }).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
