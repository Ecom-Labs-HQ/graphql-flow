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
    baseType: unknown;
    arguments: Record<string, unknown> | never;
    isArray: boolean;
    itemsAreNullable: boolean;
    isNullable: boolean;
};

export type UnionField = {
    members: Record<string, Record<string, BasicField | UnionField | InterfaceField>>;
    arguments: Record<string, unknown> | never;
    isArray: boolean;
    itemsAreNullable: boolean;
    isNullable: boolean;
};

export type InterfaceField = {
    members: Record<string, Record<string, BasicField | UnionField | InterfaceField>>;
    fields: Record<string, BasicField | UnionField | InterfaceField>;
    arguments: Record<string, unknown> | never;
    isArray: boolean;
    itemsAreNullable: boolean;
    isNullable: boolean;
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
            TField["baseType"] extends Record<string, BasicField | UnionField | InterfaceField> ? {
                [Key in keyof TField["baseType"]]?: InferSelectType<TField["baseType"][Key]>
            } 
            // If not, it means that it's a scalar. Return true 
            : true

        /* If not, do the same thing but but wrap the types in QueryArgs */
        :
            // Check if the return-type is another field 
            TField["baseType"] extends Record<string, BasicField | UnionField | InterfaceField> ? QueryArgs<TField["arguments"], {
                [Key in keyof TField["baseType"]]?: InferSelectType<TField["baseType"][Key]>
            }>
            // If not, it means that it's a scalar. Return true 
            : QueryArgs<TField["arguments"], true>

    /**
     * If none of the types match, something probably went wrong when generating the types.
     * Default to `never` for that case.
     */
    : never

/**
 * Helper type to apply array and nullable modifiers to a type.
 * Handles all combinations of isArray, itemsAreNullable, and isNullable.
 */
export type ApplyModifiers<TBaseType, TField extends BasicField | UnionField | InterfaceField> =
    // Is an array and the whole field can be null
    TField["isArray"] extends true
        ? TField["isNullable"] extends true
            ? TField["itemsAreNullable"] extends true
                ? // Array with nullable items that can itself be null
                  (TBaseType | null)[] | null
                : // Array with non-nullable items that can itself be null
                  TBaseType[] | null
            : TField["itemsAreNullable"] extends true
              ? // Array with nullable items that cannot itself be null
                (TBaseType | null)[]
              : // Array with non-nullable items that cannot itself be null
                TBaseType[]
        : // Not an array
          TField["isNullable"] extends true
          ? // Non-array that can be null
            TBaseType | null
          : // Non-array that cannot be null
            TBaseType;

/**
 * Infer the return type of a query/mutation using the selected fields. Only include fields that
 * are marked as true. Apply array and nullable modifiers based on field configuration.
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
        ApplyModifiers<
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
            ),
            TField
        >

    /**
     * Check if the field is a union field
     */
    : TField extends UnionField ? 
        ApplyModifiers<
            /* Loop over each member of the union and build a discriminated union */
            {
                [TypeName in keyof TField["members"]]: 
                    `... on ${string & TypeName}` extends keyof TSelection ?
                        {
                            [Key in keyof TField["members"][TypeName] & keyof TSelection[`... on ${string & TypeName}`]]:
                                InferSelectedReturnType<TField["members"][TypeName][Key], TSelection[`... on ${string & TypeName}`][Key]>
                        }
                    : never
            }[keyof TField["members"]],
            TField
        >

    /**
     * Check if the field is a basic field
     */
    : TField extends BasicField ?
        /* Check if the field is an object */
        TField["baseType"] extends Record<string, BasicField | UnionField | InterfaceField> ? 
            ApplyModifiers<
                {
                    [Key in keyof TField["baseType"] as Key extends keyof TSelection ? Key : never]: 
                        // For each key of the object, call the generic recursively
                        InferSelectedReturnType<TField["baseType"][Key], TSelection[Key]>
                },
                TField
            >
        /* Check if the field is a scalar */
        : TSelection extends true ? 
            // If so, we have found a leaf that is selected, apply modifiers to the return type
            ApplyModifiers<TField["baseType"], TField>
        /* Invalid field, fall back to never */
        : never

    /**
     * If none of the field types match, fall back to never
     */
    : never
