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

export type MutationArgs<TData extends object, TSelection extends object | true> = {
    data?: TData;
    select: TSelection;
};

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

// prettier-ignore
export type InferFullReturnType<TField extends BasicField | UnionField | InterfaceField> = 
    /**
     * Check if the field is an interface field.
     * Return a union of all implementing types, each including the shared fields
     */
    TField extends InterfaceField ?
        {
            [TypeName in keyof TField["members"]]: {
                [Key in keyof TField["fields"]]: InferFullReturnType<TField["fields"][Key]>
            } & {
                [Key in keyof TField["members"][TypeName]]: InferFullReturnType<TField["members"][TypeName][Key]>
            }
        }[keyof TField["members"]]

    /**
     * Check if the field is a union field.
     * Return a union of all possible member types
     */
    : TField extends UnionField ?
        {
            [TypeName in keyof TField["members"]]: {
                [Key in keyof TField["members"][TypeName]]: InferFullReturnType<TField["members"][TypeName][Key]>
            }
        }[keyof TField["members"]]

    /**
     * Check if the field is a basic field
     */
    : TField extends BasicField ?
        TField["strippedType"] extends Record<string, BasicField | UnionField | InterfaceField> ? {
            [Key in keyof TField["strippedType"]]: InferFullReturnType<TField["strippedType"][Key]>
        } : TField["returnType"]

    /**
     * If none of the types match, something probably went wrong when generating the types.
     * Default to `never` for that case.
     */
    : never

// Helpers
type UnwrapQueryArgs<TField extends BasicField | UnionField | InterfaceField, TSelection> =
    TSelection extends QueryArgs<TField["arguments"], infer InnerSelection>
        ? UnwrapQueryArgs<TField, InnerSelection>
        : TSelection;

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
        } & {
            /* Loop over each member of the union and check if it is found in TSelection, i.e. if the member is selected */
            [TypeName in keyof TField["members"] as `... on ${string & TypeName}` extends keyof TSelection ? TypeName : never]: 
                /* Double-check that it is a key of TSelection */
                `... on ${string & TypeName}` extends keyof TSelection ? {
                    /* Loop over each key of the union member, intersected with the TSelection keys (to guarantee that the key exists in both) */
                    [Key in keyof TField["members"][TypeName] & keyof TSelection[`... on ${string & TypeName}`]]: 
                        InferSelectedReturnType<TField["members"][TypeName][Key], TSelection[`... on ${string & TypeName}`][Key]>
                }
                /* If not, fall back to never */
                : never
        }

    /**
     * Check if the field is a union field
     */
    : TField extends UnionField ? {
        /* Loop over each member of the union and check if it is found in TSelection, i.e. if the member is selected */
        [TypeName in keyof TField["members"] as `... on ${string & TypeName}` extends keyof TSelection ? TypeName : never]: 
            /* Double-check that it is a key of TSelection */
            `... on ${string & TypeName}` extends keyof TSelection ? {
                /* Loop over each key of the union member, intersected with the TSelection keys (to guarantee that the key exists in both) */
                [Key in keyof TField["members"][TypeName] & keyof TSelection[`... on ${string & TypeName}`]]: 
                    InferSelectedReturnType<TField["members"][TypeName][Key], TSelection[`... on ${string & TypeName}`][Key]>
              }
            /* If not, fall back to never */
            : never
        }
    
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
