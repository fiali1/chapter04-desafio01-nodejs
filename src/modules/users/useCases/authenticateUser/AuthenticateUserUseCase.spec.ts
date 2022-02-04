import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);  
  });

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "123456"
    }

    await createUserUseCase.execute(user);

    const { user: authUser, token } = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authUser.name).toBe(user.name);
    expect(authUser.email).toBe(user.email);
    expect(token).toBeDefined();
  });

  it("should not be able to authenticate an user using an incorrect email", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "john@doe.com",
        password: "123456"
      }
  
      await createUserUseCase.execute(user);
  
      await authenticateUserUseCase.execute({
        email: "incorrect@email.com",
        password: user.password,
      });
    }).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("should not be able to authenticate an user using an incorrect password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "john@doe.com",
        password: "123456"
      }
  
      await createUserUseCase.execute(user);
  
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      });
    }).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
})