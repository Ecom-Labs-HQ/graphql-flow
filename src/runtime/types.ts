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
export type OperationReturnType<TObject, TSelection> = TSelection extends true ? TObject : {
    [Key in keyof TSelection as TSelection[Key] extends null | undefined | false | never ? never : Key]: TSelection[Key] extends object
        ? TObject extends { [K in Key]: (infer RelatedType)[] }
            ? RelatedType extends object
                ? OperationReturnType<RelatedType, TSelection[Key]>[]
                : never
            : TObject extends { [K in Key]: infer RelatedType | null }
              ? RelatedType extends object
                  ? OperationReturnType<RelatedType, TSelection[Key]> | null
                  : never
              : never
        : TObject extends { [K in Key]: infer ScalarType }
          ? ScalarType
          : never;

};
