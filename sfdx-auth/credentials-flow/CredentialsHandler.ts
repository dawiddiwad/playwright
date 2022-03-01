import { UsernamePasswordFetcher } from "../tools/UsernamePasswordFetcher";

(async() => {
    const username: string = process.argv[2];
    const password: string = process.argv[3];

    if (!username || !password){
        throw new Error(`missing username or password arguments, this was received:
            username: ${username}
            password: ${password}`);
    }

    await new UsernamePasswordFetcher({username, password}).writeToFile();
})();