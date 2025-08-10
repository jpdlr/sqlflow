export interface Table {
  name: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  indexes: Index[];
}

export interface Index {
  name: string;
  columns: string[];
  isUnique: boolean;
  type?: string;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface Relationship {
  id: string;
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
}

export interface Schema {
  tables: Table[];
  relationships: Relationship[];
}