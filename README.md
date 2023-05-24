# schema-table-component

This component will render fields dynamically based on openApi schema JSON.

# Install
```
npm install schema-table-component
```

## Usage
#### Schema Example:
```ts
const userSchema ={
  "properties": {
     "id":{
       "type":"string",
       "readOnly": true
     },
    "name": {
      "type": "string", 
      "minLength": 3
    },
    "dob": {
      "type": "string",
      "format": "date"
    },
    "address": {
      "type": "string",
      "maxLength": 250
    }
  },
  "required":["name"]
} 
```
```typescript jsx
    import React from 'react';
    import { SchemaTableComponent, IColumnConfig } from "schema-table-component";

    const config:{[keyName: string]: IColumnConfig} ={
        "id":{
            hidden:true
        },
        "dob":{
            title:"Date of Birth"
        }
    }
    
    const Table=()=>{
        const [users, setUsers]= useState();
        
        return <SchemaTableComponent
            data={users || []}
            schema={userSchema}
            width={window.innerWidth}
            height={window.innerHeight - 150}
            config={config}
        />
    }
```

## Component Props
Prop | Type           | Description                                                             |
--- |----------------|-------------------------------------------------------------------------|
schema | ```object```   | schemaObject to be rendered as a set of fields(example openapi schema). |
config | ```object```   | custom UI config {[keyName: string]: IColumnConfig;}.                   |
data | ```array```    | data props will be rendered from api                                    |
onRowClick | ```function``` | it will be navigate to detail of row data                               |
width | ```number``` | this props will be calculated width of table                            |
height | ```number``` | this props will be calculated height of table                           |
tableTitle | ```string``` | custom title for table your own |
isSearchable | ```boolean``` | if this props is ```true``` then the search filed will shown |
isSortable | ```boolean``` | if this props is ```true``` then the table to be able to shorting the data |

## Config
#### you can import the type of config from the IFieldConfig.
```ts
   const config: { [keyName: string]: IColumnConfig } = {}
```

