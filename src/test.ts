import { GraphQLFlowClient } from "./__generated__/client/full-client.js";

const client = new GraphQLFlowClient({
    endpoint: "",
});

async function main() {
    const result = await client.queries.products({
        args: {
            first: 250,
        },
        select: {
            nodes: {
                id: true,
                updatedAt: true,

                media: {
                    select: {
                        nodes: {
                            id: true,
                            "... on Video": {
                                __typename: true,
                                alt: true,
                            },
                            "... on ExternalVideo": {
                                __typename: true,
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        },
    });
}

main();
