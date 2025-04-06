/* General client types */

export type GraphQLFlowClientConfig = {
    endpoint: string | URL;
    headers?: object;
};

export type GraphQLApiResponse<TData = unknown> = {
    data?: TData;
    errors?: Record<string, unknown>;
    extensions?: Record<string, unknown>;
};

/* Types for operations */

export type QueryArgs<TArgs extends object, TSelection extends object | true> = {
    args?: TArgs;
    select: TSelection;
};

export type MutationArgs<TData extends object, TSelection extends object | true> = {
    data?: TData;
    select: TSelection;
};

/* Return type of operation. Adapted from prisma's `GetFindResult` type */

// prettier-ignore
export type OperationReturnType<TObject, TSelection> = 
    // if the selection is `true`, it means the operation returns a scalar
    TSelection extends true ? 
        TObject :
    // if the selection extends the `QueryArgs` type, it is a nested query
    TSelection extends QueryArgs<object, infer NestedSelection> ? 
        OperationReturnType<TObject, NestedSelection> : 
    // otherwise it's an object, loop over each key
    {
        [Key in keyof TSelection as TSelection[Key] extends null | undefined | false | never ? never : Key]: 
            // check if the type is an object
            TSelection[Key] extends object ? 
                // check if it is also an array
                TObject extends { [K in Key]: (infer RelatedType)[] } ? 
                    // is it an array of objects?
                    RelatedType extends object ? 
                        OperationReturnType<RelatedType, TSelection[Key]>[] : 
                        never : 
                // is it nullable?
                TObject extends { [K in Key]: infer RelatedType | null } ? 
                    RelatedType extends object ? 
                        OperationReturnType<RelatedType, TSelection[Key]> | null :
                        never : 
                    never : 
            // is it a scalar?
            TObject extends { [K in Key]: infer ScalarType } ? 
                ScalarType : 
                never;
};
