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
export type QueryArgs<TArgs, TSelection> = {
    args?: TArgs;
    select: TSelection;
};

export type UnwrapQueryArgs<TField extends BasicField | UnionField | InterfaceField, TSelection> =
    TSelection extends QueryArgs<TField["arguments"], infer InnerSelection>
        ? UnwrapQueryArgs<TField, InnerSelection>
        : TSelection;

/* Infer the select type */
export type BasicField = {
    strippedType: unknown;
    returnType: unknown;
    arguments: Record<string, unknown> | never;
};

export type UnionField = {
    members: Record<string, Record<string, BasicField | UnionField | InterfaceField>>;
    arguments: Record<string, unknown> | never;
};

export type InterfaceField = {
    members: Record<string, Record<string, BasicField | UnionField | InterfaceField>>;
    fields: Record<string, BasicField | UnionField | InterfaceField>;
    arguments: Record<string, unknown> | never;
};

/**
 * Infer the type that is used for selecting the fields. Also allows for creation of Fragments in
 * using JS objects.
 */

// prettier-ignore
export type InferSelectType<TField extends BasicField | UnionField | InterfaceField> = 
    /**
     * Check if the field is an interface field.
     * This needs both shared fields and fragment spreads for implementing types
     */
    TField extends InterfaceField ?
        /* Check if the query does NOT take any arguments. For some reason this is the only way it works. */
        TField["arguments"] extends never ? {
            [Key in keyof TField["fields"]]?: InferSelectType<TField["fields"][Key]> 
        } & {
            [TypeName in keyof TField["members"] as `... on ${string & TypeName}`]?: {
                [Key in keyof TField["members"][TypeName]]?: InferSelectType<TField["members"][TypeName][Key]>
            }
        }
        /* If not, do the same thing but but wrap the types in QueryArgs */
        : QueryArgs<
            TField["arguments"],
            {
                [Key in keyof TField["fields"]]?: InferSelectType<TField["fields"][Key]>
            } & {
                [TypeName in keyof TField["members"] as `... on ${string & TypeName}`]?: {
                    [Key in keyof TField["members"][TypeName]]?: InferSelectType<TField["members"][TypeName][Key]>
                }
            }
        >    

    /**
     * Check if the field is a union field.
     * In that case we need to generate the "... on TypeName" structure
     */
    : TField extends UnionField ?
        /* Check if the query does NOT take any arguments. For some reason this is the only way it works. */
        TField["arguments"] extends never ? {
            [TypeName in keyof TField["members"] as `... on ${string & TypeName}`]?: {
                [Key in keyof TField["members"][TypeName]]?: InferSelectType<TField["members"][TypeName][Key]>
            }
        }
        /* If not, do the same thing but but wrap the types in QueryArgs */
        : QueryArgs<
            TField["arguments"],
            {
                [TypeName in keyof TField["members"] as `... on ${string & TypeName}`]?: {
                    [Key in keyof TField["members"][TypeName]]?: InferSelectType<TField["members"][TypeName][Key]>
                }
            }
        >
    /**
     * Check if the field is a basic field
     */
    : TField extends BasicField ? 
        /* Check if the query does NOT take any arguments. For some reason this is the only way it works. */
        TField["arguments"] extends never ?
            // Check if the return-type is another field 
            TField["strippedType"] extends Record<string, BasicField | UnionField | InterfaceField> ? {
                [Key in keyof TField["strippedType"]]?: InferSelectType<TField["strippedType"][Key]>
            } 
            // If not, it means that it's a scalar. Return true 
            : true

        /* If not, do the same thing but but wrap the types in QueryArgs */
        :
            // Check if the return-type is another field 
            TField["strippedType"] extends Record<string, BasicField | UnionField | InterfaceField> ? QueryArgs<TField["arguments"], {
                [Key in keyof TField["strippedType"]]?: InferSelectType<TField["strippedType"][Key]>
            }>
            // If not, it means that it's a scalar. Return true 
            : QueryArgs<TField["arguments"], true>

    /**
     * If none of the types match, something probably went wrong when generating the types.
     * Default to `never` for that case.
     */
    : never

/**
 * Infer the return type of a query/mutation using the selected fields. Only include fields that
 * are marked as true.
 */

// prettier-ignore
export type InferSelectedReturnType<
    TField extends BasicField | UnionField | InterfaceField,
    TSelection
> = 
    /**
     * Strip QueryArgs if present, treating the field as if it had no arguments
     */
    TSelection extends QueryArgs<TField["arguments"], infer InnerSelection> ?
        InferSelectedReturnType<TField, UnwrapQueryArgs<TField, InnerSelection>>

    /**
     * Check if the field is an interface field
     */
    : TField extends InterfaceField ?
        {
            /* Loop over each field int the interface */
            [Key in keyof TField["fields"] as Key extends keyof TSelection ? Key : never]: 
                /* Double check that each key exists in TSelection */
                Key extends keyof TSelection ?
                    InferSelectedReturnType<TField["fields"][Key], TSelection[Key]>
                /* If not, fall back to never */
                : never
        } & (
            /* Loop over each member of the interface and build a discriminated union */
            {
                [TypeName in keyof TField["members"]]: 
                    `... on ${string & TypeName}` extends keyof TSelection ?
                        {
                            [Key in keyof TField["members"][TypeName] & keyof TSelection[`... on ${string & TypeName}`]]:
                                InferSelectedReturnType<TField["members"][TypeName][Key], TSelection[`... on ${string & TypeName}`][Key]>
                        }
                    : never
            }[keyof TField["members"]]
        )

    /**
     * Check if the field is a union field
     */
    : TField extends UnionField ? (
        /* Loop over each member of the union and build a discriminated union */
        {
            [TypeName in keyof TField["members"]]: 
                `... on ${string & TypeName}` extends keyof TSelection ?
                    {
                        [Key in keyof TField["members"][TypeName] & keyof TSelection[`... on ${string & TypeName}`]]:
                            InferSelectedReturnType<TField["members"][TypeName][Key], TSelection[`... on ${string & TypeName}`][Key]>
                    }
                : never
        }[keyof TField["members"]]
    )

    /**
     * Check if the field is a basic field
     */
    : TField extends BasicField ?
        /* Check if the field is an object */
        TField["strippedType"] extends Record<string, BasicField | UnionField | InterfaceField> ? {
            [Key in keyof TField["strippedType"] as Key extends keyof TSelection ? Key : never]: 
                // For each key of the object, call the generic recursively
                InferSelectedReturnType<TField["strippedType"][Key], TSelection[Key]>
        }
        /* Check if the field is a scalar */
        : TSelection extends true ? 
            // If so, we have found a leaf that is selected, return the return type of the field
            TField["returnType"]
        /* Invalid field, fall back to never */
        : never

    /**
     * If none of the field types match, fall back to never
     */
    : never
