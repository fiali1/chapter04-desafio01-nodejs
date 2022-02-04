import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

import { ShowUserProfileError } from "./ShowUserProfileError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show the profile of an user", async () => {
    const { id: user_id } = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456"
    });

    const user = await showUserProfileUseCase.execute(user_id);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@doe.com");
  });

  it("should not be able to show the profile of a non existent user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1234");
    }).rejects.toEqual(new ShowUserProfileError())
  });
})