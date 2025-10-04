# DEFINE TEMP-TABLE Statement Reference

## Example Statement

```abl
/* Exemple DIALOG-BOX fonctionnel et compatible */
DEFINE TEMP-TABLE customer NO-UNDO
  FIELD Name    AS CHARACTER
  FIELD Country AS CHARACTER.
```

## Statement Structure

```
DEFINE {[[ NEW [ GLOBAL ]] SHARED ]|
            [ PRIVATE | PROTECTED ][ STATIC ]
            [ SERIALIZABLE | NON-SERIALIZABLE ]}
  TEMP-TABLE temp-table-name[ NO-UNDO ]
  [ NAMESPACE-URI namespace][ NAMESPACE-PREFIX prefix]
  [ XML-NODE-NAME node-name][ SERIALIZE-NAME serialize-name ]
  [ REFERENCE-ONLY ]
  [ LIKE table-name
      [ VALIDATE ]
      [ USE-INDEX index-name[ AS PRIMARY ]]...]
  [ LIKE-SEQUENTIAL table-name
      [ VALIDATE ]
      [ USE-INDEX index-name[ AS PRIMARY ]]...]
  [ RCODE-INFORMATION ]
  [ BEFORE-TABLE before-table-name]
  [ FIELD field-name
      { AS data-type|  LIKE field[ VALIDATE ]}
  [field-options]
  ]...
  [ INDEX index-name
      [[ AS | IS ][ UNIQUE ][ PRIMARY ][ WORD-INDEX ]]
      {index-field[ ASCENDING | DESCENDING ]}...
  ]...
```

### NEW SHARED TEMP-TABLE temp-table-name
Defines and identifies a temp-table object that can be shared by one or more procedures called directly or indirectly by the current procedure. The temp-table remains available to other procedures until the procedure that defined it ends. The called procedures must define the same temp-table name using a DEFINE SHARED TEMP-TABLE statement.

> **Note:** A SHARED temp-table cannot have a BEFORE-TABLE.

### NEW GLOBAL SHARED TEMP-TABLE temp-table-name
Defines and identifies a global shared temp-table object. The scope of a global shared temp-table is the ABL session. The first procedure to define a temp-table NEW GLOBAL SHARED establishes it. Subsequent procedures access it using a DEFINE SHARED TEMP-TABLE statement.

> **Notes:**
> - ABL does not establish multiple global shared temp-tables with the same name in the same ABL session.
> - A SHARED temp-table cannot have a BEFORE-TABLE.

### SHARED TEMP-TABLE temp-table-name
Defines and identifies a temp-table object that was initially defined by another procedure using a DEFINE NEW SHARED TEMP-TABLE or DEFINE NEW GLOBAL SHARED TEMP-TABLE statement. The procedure that establishes the temp-table determines the name. The procedures that share the temp-table use that name to identify it.

### [ PRIVATE | PROTECTED ][ STATIC ][ SERIALIZABLE | NON-SERIALIZABLE ] TEMP-TABLE temp-table-name
Defines and identifies a temp-table object as a data member of a class, and optionally specifies an access mode (PRIVATE or PROTECTED) and scope (instance or STATIC) for that data member, as well as whether or not the temp-table will participate in serialization (SERIALIZABLE or NON-SERIALIZABLE). You cannot specify any of these options for a temp-table in an interface definition (INTERFACE statement block) or when defining a temp-table as a data element of a procedure.

> These options apply only when defining a data member for a class in a class definition (.cls) file. The PRIVATE/PROTECTED modifier and the STATIC modifier can appear in either order (for example, `DEFINE STATIC PRIVATE TEMP-TABLE myTempTable...`). You cannot shadow (override) the definition of a given temp-table data member in a class hierarchy.

A temp-table defined with the STATIC option is a static data member of the class type for which it is defined, and it is scoped to the ABL session where it is referenced. ABL creates one copy of the specified class static temp-table at the first reference to the class type, and creates only one such copy for any number of instances of the class that you create. You cannot specify STATIC if you specify the REFERENCE-ONLY option. You can directly reference an accessible static temp-table data member from any other static or instance class member defined in the same class or class hierarchy.

Without the STATIC option, ABL creates an instance temp-table data member that is scoped to a single instance of the class where it is defined. ABL creates one copy of the specified instance temp-table for each such class instance that you create. You cannot directly reference an instance temp-table data member from a STATIC class member definition defined within the same class or class hierarchy.

For more information on accessing temp-tables of different access modes and scopes, see the reference entry for Class-based data member access.

Class-based objects that are defined as serializable (using the SERIALIZABLE option in the CLASS statement) can be passed as parameters in remote calls between the AppServer and ABL clients and can be serialized to binary or JSON format. By default, both passing a class as a parameter and serializing an object to binary via the `Progress.IO.BinarySerializer` class include all data members regardless of access mode. However, for JSON serialization via `Progress.IO.JsonSerializer`, only public data members are serialized. To include a protected or private property during JSON serialization, `SERIALIZABLE` must be added to the definition. See `Serialize()` method (JsonSerializer) for more information.

Use the NON-SERIALIZABLE option to exclude a given temp-table from parameter passing between an AppServer and ABL client and from the serialization process via the `Progress.IO.BinarySerializer` class. (Temp-tables are NON-SERIALIZABLE by default via the `Progress.IO.JsonSerializer` class because they cannot be defined as public.) Fields of a temp-table marked as NON-SERIALIZABLE revert to their initial values when the class is deserialized.

> **Note:** Members of a class are grouped into six namespaces, including buffers/temp-tables, methods, variables/properties/events, ProDataSets, queries, and data-sources. Buffers and temp-tables defined as members of a class share the same namespace. There can be only one class member in this namespace with a given name.

For more information on where and how to define data members in a class, see the CLASS statement reference entry.

### TEMP-TABLE temp-table-name
Defines and identifies a temp-table object in an interface, or for access only within the current external procedure or as a data member of the current class.

### NO-UNDO
Specifies that when a transaction is undone, changes to the temp-table records need not be undone. If you do not specify this option, all records in the temp-table are restored to their prior condition when a transaction is undone. The NO-UNDO option can significantly increase the performance for temp-table updates; use it whenever possible.

### NAMESPACE-URI namespace / NAMESPACE-PREFIX prefix
Optional CHARACTER constants that specify the namespace URI and associated prefix for the temp-table.

### XML-NODE-NAME node-name / SERIALIZE-NAME serialize-name
Optional CHARACTER constants that specify the XML element or serialized name representing the temp-table in XML or JSON. Useful when reading or writing temp-tables where the name contains invalid characters or is an ABL keyword.

### REFERENCE-ONLY
Specifies that the procedure defining this temp-table object is using the object definition only as a reference to a temp-table object that is defined and instantiated in another procedure or class, and specified as a parameter in the invocation of a RUN statement, a method in a class, or a user-defined function, using either the BY-REFERENCE or BIND option. The AVM does not instantiate the reference-only object. You cannot specify REFERENCE-ONLY if you specify the STATIC option.

Passing a reference-only temp-table object parameter to a local routine using either the BY-REFERENCE or BIND option allows the calling routine and the called routine to access the same object instance (instead of deep-copying the parameter).

> **Caution:** Do not delete the object or routine to which a reference-only temp-table object is bound, or you might be left with references to an object that no longer exists.

### LIKE table-name / LIKE-SEQUENTIAL table-name
Specifies the name of a table whose characteristics the temp-table inherits. All field definitions of `table-name` are added to the temp-table. `table-name` can represent a database table or another temp-table.

- `LIKE` creates temp-table fields in `_field._field-rpos` order (POSITION order in the .df schema definition file) of the source table's fields.
- `LIKE-SEQUENTIAL` creates fields in `_field._order` sequence. Use this when you need consistent field order between clients and AppServers.

Optional clauses:
- `VALIDATE`
- `USE-INDEX index-name [ AS PRIMARY ]`

### BEFORE-TABLE before-table-name
Specifies the name of the before-image table associated with a compile-time defined temp-table in a ProDataSet object. Must be specified to track changes for a compile-time defined ProDataSet temp-table. Not available on SHARED temp-tables.

### FIELD field-name
Defines a field in the temp-table. You can use FIELD clauses with the LIKE option to define additional fields for the temp-table, or define all fields with FIELD clauses. Supported data types include BLOB, CHARACTER, CLASS, CLOB, COM-HANDLE, DATE, DATETIME, DATETIME-TZ, DECIMAL, HANDLE, INT64, INTEGER, LOGICAL, RAW, RECID, and ROWID.

`LIKE field` allows the field to inherit characteristics from a database field or previously defined variable.

`field-options` can override inherited characteristics, including:
- `BGCOLOR`, `COLUMN-LABEL`, `FORMAT`, `HELP`, `INITIAL`, `LABEL`
- `CASE-SENSITIVE`, `SERIALIZE-HIDDEN`, `SERIALIZE-NAME`
- `TTCODEPAGE`, `COLUMN-CODEPAGE`, `XML-DATA-TYPE`, `XML-NODE-TYPE`, `XML-NODE-NAME`
- Additional view-as phrases

### INDEX index-name
Defines an index on the temp-table. Options include `UNIQUE`, `PRIMARY`, and `WORD-INDEX`. When no indexes are defined or inherited, ABL creates a default primary index sorting records in entry order. Index components can be marked `ASCENDING` or `DESCENDING` (default `ASCENDING`).

> **Note:** You cannot use a BLOB or CLOB field as a component of an index.

### Example
```
DEFINE TEMP-TABLE temp-item
  FIELD cat-page  LIKE Item.CatPage
  FIELD inventory LIKE Item.Price LABEL "Inventory Value"
  INDEX cat-page  IS PRIMARY cat-page ASCENDING
  INDEX inventory-value inventory DESCENDING.
```

### Additional Notes
- Temp-tables defined LIKE a database table do not inherit database triggers.
- You cannot define temp-table fields of type MEMPTR or LONGCHAR.
- Shared objects, work tables, or temp-tables cannot be defined within an internal procedure, method, or user-defined function.
- Temp-tables can be compile-time defined (static) or run-time defined (dynamic via `CREATE TEMP-TABLE`).
- ABL disregards certain options (e.g., `VALIDATE` on DELETE, locking phrases on FIND/FOR) when used with temp-tables.
- Transactions involving temp-tables must be started explicitly.
- `CASE-SENSITIVE` should be used when upper/lower case distinctions matter.
- SHARED or NEW SHARED temp-tables cannot be defined in a class definition (.cls) file.
- A SHARED temp-table remains in scope for a persistent procedure instance until that instance is deleted.
- Temp-tables can participate in joins using the `OF` keyword when a common indexed field exists.
- If a temp-table shares its name with a database table, a buffer defined for that name refers to the database table.
- Temp-table overflow to disk is controlled by the `-Bt` startup parameter (number of temp-table buffers).
