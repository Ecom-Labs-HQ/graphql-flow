# GraphQL Flow

GraphQL Flow is a lightweight, TypeScript-first GraphQL client generator that provides a Prisma-like syntax for querying GraphQL APIs. It eliminates the need for external code generation tools like GraphQL Codegen by generating a fully-typed client directly from your GraphQL schema via a CLI. The client supports queries and mutations with inline argument and selection definitions, offering a simple and intuitive API.

## Features

- **Prisma-like Syntax**: Define queries and mutations with a familiar, nested object structure.
- **Type Safety**: Full TypeScript support with inferred types for selections and return values.
- **No Codegen Dependency**: Generate a client directly from your schema using the CLI.
- **Lightweight Runtime**: Minimal dependencies, leveraging the native `fetch` API.
- **Flexible Configuration**: Supports custom endpoints and headers.

## Installation

1. **Install the package globally** (or locally if preferred):

    ```bash
    npm install -g graphql-flow
    ```

2. **Prepare your GraphQL schema**:
   Ensure you have a `.graphql` file containing your schema definition (e.g., `schema.graphql`).

3. **Generate the client**:
   Run the CLI to generate the client into an output directory:

    ```bash
    graphql-flow -s ./schema.graphql -o ./generated-client
    ```

    - `-s, --schema <path>`: Path to your GraphQL schema file.
    - `-o, --output <path>`: Directory where the client will be generated.
    - `-c, --clean`: (Optional) Deletes the output directory before generating.

    This will create a directory (e.g., `./generated-client`) with the client code and types.

4. **Install runtime dependencies**:
   If using the generated client in a project, ensure you have `type-fest` installed for type utilities:

    ```bash
    npm install type-fest
    ```

## Usage and Examples

### Initializing the Client

Import and instantiate the generated `GraphQLFlowClient` with your API configuration:

```typescript
import { GraphQLFlowClient } from "./generated-client/client/full-client";

const client = new GraphQLFlowClient({
    endpoint: "https://your-graphql-api.com/graphql",
    headers: {
        Authorization: "Bearer your-token",
    },
});
```

### Querying Data

Use the `queries` property to access query methods. For fields without arguments, define selections directly. For fields with arguments, use an object with `args` and `select`. Consider this schema:

```graphql
type User {
    id: ID!
    name: String!
    posts: [Post!]!
}

type Post {
    id: ID!
    title: String!
    content: String!
}

type Query {
    user(id: ID!): User!
    allUsers: [User!]!
}
```

- **Query with arguments** (e.g., `user`):

```typescript
async function fetchUser() {
    const response = await client.queries.user({
        args: {
            id: "1",
        },
        select: {
            id: true,
            name: true,
            posts: {
                id: true,
                title: true,
            },
        },
    });

    if (response.data) {
        console.log(response.data);
        // { id: "1", name: "John Doe", posts: [{ id: "101", title: "Post 1" }] }
    }
}

fetchUser();
```

Generated GraphQL:

```
query user {
  user(id: "1") { id name posts { id title } }
}
```

- **Query without arguments** (e.g., `allUsers`):

```typescript
async function fetchAllUsers() {
    const response = await client.queries.allUsers({
        id: true,
        name: true,
    });

    if (response.data) {
        console.log(response.data);
        // [{ id: "1", name: "John Doe" }, { id: "2", name: "Jane Doe" }]
    }
}

fetchAllUsers();
```

Generated GraphQL:

```
query allUsers {
  allUsers { id name }
}
```

### Performing Mutations

Mutations follow the same pattern. For example, with this schema:

```graphql
type Mutation {
    createPost(title: String!, content: String!, authorId: ID!): Post!
}
```

```typescript
async function createPost() {
    const response = await client.mutations.createPost({
        args: {
            title: "Hello World",
            content: "This is a post",
            authorId: "1",
        },
        select: {
            id: true,
            title: true,
        },
    });

    if (response.data) {
        console.log(response.data);
        // { id: "123", title: "Hello World" }
    }
}

createPost();
```

Generated GraphQL:

```
mutation createPost {
  createPost(title: "Hello World", content: "This is a post", authorId: "1") { id title }
}
```

### Handling Fragments (Unions and Interfaces)

For union or interface types, use `... on TypeName`. Suppose your schema includes:

```graphql
interface Item {
    id: ID!
}

type Book implements Item {
    id: ID!
    title: String!
    author: String!
}

type Movie implements Item {
    id: ID!
    title: String!
    director: String!
}

type Query {
    item(id: ID!): Item!
}
```

```typescript
async function fetchItem() {
    const response = await client.queries.item({
        args: { id: "1" },
        select: {
            id: true,
            "... on Book": {
                title: true,
                author: true,
            },
            "... on Movie": {
                title: true,
                director: true,
            },
        },
    });

    if (response.data) {
        console.log(response.data);
        // Example: { id: "1", title: "The Book", author: "Jane Doe" }
    }
}

fetchItem();
```

Generated GraphQL:

```
query item {
  item(id: "1") { id ... on Book { title author } ... on Movie { title director } }
}
```

## Project Structure

After generation, your output directory will look like this:

```
generated-client/
├── client/
│   ├── full-client.ts    # Main client class
│   ├── query-client.ts   # Query methods
│   └── mutation-client.ts # Mutation methods
├── runtime/
│   ├── build-operation.ts # Builds GraphQL operations
│   ├── format-arguments.ts # Formats inline arguments
│   ├── send-request.ts    # Sends requests via fetch
│   └── types.ts          # Core runtime types
└── types/
    ├── base-types.ts     # Scalars and enums
    ├── input-types.ts    # Input object types
    └── types.ts         # Schema types (objects, interfaces, unions)
```

## How It Works

1. **Schema Parsing**: The CLI reads your `.graphql` schema file and constructs a schema AST using `graphql`.
2. **Type Generation**: TypeScript types are generated for scalars, enums, input objects, and schema types (objects, interfaces, unions).
3. **Client Generation**: A client is created with methods for all queries and mutations, using a runtime library to build and execute operations.
4. **Runtime**: The runtime handles operation construction and request sending, supporting nested selections and inline arguments.

## Limitations

- **No Subscriptions**: Currently, only queries and mutations are supported.
- **No aliases**: If you would like to see support for aliases, please open an issue. We are happy to add support, but currently focused on the most important features.
- **Schema Requirements**: Your schema must be valid GraphQL and provided as a single `.graphql` file.
- **Scalar Mapping**: Scalars are mapped to basic TypeScript types (e.g., `Int` → `number`). Custom scalar support is not yet configurable.

## Contributing

Contributions are welcome! To get started:

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Make changes and test locally.
4. Submit a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.
