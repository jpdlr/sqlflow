import { Node } from 'reactflow';
import { Table, Schema } from '../types';

export type LayoutType = 'grid' | 'hierarchical' | 'circular' | 'modular' | 'force';

export interface LayoutPosition {
  x: number;
  y: number;
}

export interface LayoutConfig {
  spacing: number;
  padding: number;
}

export class LayoutEngine {
  private schema: Schema;
  private config: LayoutConfig;

  constructor(schema: Schema, config: LayoutConfig = { spacing: 450, padding: 100 }) {
    this.schema = schema;
    this.config = config;
  }

  updateConfig(config: Partial<LayoutConfig>) {
    this.config = { ...this.config, ...config };
  }

  updateSchema(schema: Schema) {
    this.schema = schema;
  }

  // Grid Layout (Current default with improvements)
  gridLayout(tables: Table[]): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    const tableCount = tables.length;
    
    if (tableCount === 0) return positions;

    // Better aspect ratio calculation
    const aspectRatio = 0.75; // More square-like layout
    const optimalColumns = Math.max(2, Math.ceil(Math.sqrt(tableCount / aspectRatio)));
    
    tables.forEach((table, index) => {
      const col = index % optimalColumns;
      const row = Math.floor(index / optimalColumns);
      
      // Add slight offset for visual interest
      const xOffset = (row % 2) * 60;
      const yOffset = (col % 2) * 40;
      
      positions.set(table.name, {
        x: col * this.config.spacing + this.config.padding + xOffset,
        y: row * this.config.spacing + this.config.padding + yOffset,
      });
    });

    return positions;
  }

  // Hierarchical Layout - Organize by dependency levels
  hierarchicalLayout(tables: Table[]): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    
    // Build dependency graph
    const dependencies = new Map<string, Set<string>>();
    const dependents = new Map<string, Set<string>>();
    
    // Initialize maps
    tables.forEach(table => {
      dependencies.set(table.name, new Set());
      dependents.set(table.name, new Set());
    });

    // Populate dependencies from relationships
    this.schema.relationships.forEach(rel => {
      dependencies.get(rel.from)?.add(rel.to);
      dependents.get(rel.to)?.add(rel.from);
    });

    // Find root tables (no dependencies)
    const rootTables = tables.filter(table => dependencies.get(table.name)?.size === 0);
    const processedTables = new Set<string>();
    const levels: string[][] = [];

    // Level 0: Root tables
    if (rootTables.length > 0) {
      levels.push(rootTables.map(t => t.name));
      rootTables.forEach(t => processedTables.add(t.name));
    }

    // Build levels iteratively
    while (processedTables.size < tables.length) {
      const nextLevel: string[] = [];
      
      for (const table of tables) {
        if (processedTables.has(table.name)) continue;
        
        // Check if all dependencies are processed
        const deps = dependencies.get(table.name);
        if (deps && Array.from(deps).every(dep => processedTables.has(dep))) {
          nextLevel.push(table.name);
        }
      }

      if (nextLevel.length === 0) {
        // Handle circular dependencies - add remaining tables to current level
        const remaining = tables.filter(t => !processedTables.has(t.name));
        nextLevel.push(...remaining.map(t => t.name));
      }

      levels.push(nextLevel);
      nextLevel.forEach(t => processedTables.add(t));
    }

    // Position tables by levels
    levels.forEach((level, levelIndex) => {
      const levelSpacing = this.config.spacing * 1.2;
      const y = levelIndex * levelSpacing + this.config.padding;
      
      level.forEach((tableName, tableIndex) => {
        const tablesInLevel = level.length;
        const totalWidth = (tablesInLevel - 1) * this.config.spacing;
        const startX = this.config.padding - totalWidth / 2;
        
        positions.set(tableName, {
          x: startX + tableIndex * this.config.spacing + window.innerWidth / 2,
          y,
        });
      });
    });

    return positions;
  }

  // Circular Layout - Main connected tables in center
  circularLayout(tables: Table[]): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    
    if (tables.length === 0) return positions;

    // Calculate table connectivity (number of relationships)
    const connectivity = new Map<string, number>();
    tables.forEach(table => connectivity.set(table.name, 0));

    this.schema.relationships.forEach(rel => {
      connectivity.set(rel.from, (connectivity.get(rel.from) || 0) + 1);
      connectivity.set(rel.to, (connectivity.get(rel.to) || 0) + 1);
    });

    // Sort by connectivity
    const sortedTables = [...tables].sort((a, b) => 
      (connectivity.get(b.name) || 0) - (connectivity.get(a.name) || 0)
    );

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    if (sortedTables.length === 1) {
      positions.set(sortedTables[0].name, { x: centerX, y: centerY });
      return positions;
    }

    // Place most connected tables in center
    const coreTableCount = Math.min(3, Math.ceil(tables.length * 0.3));
    const coreTables = sortedTables.slice(0, coreTableCount);
    const peripheralTables = sortedTables.slice(coreTableCount);

    // Position core tables in small circle
    const coreRadius = Math.max(200, this.config.spacing * 0.8);
    coreTables.forEach((table, index) => {
      const angle = (index / coreTables.length) * 2 * Math.PI;
      positions.set(table.name, {
        x: centerX + Math.cos(angle) * coreRadius,
        y: centerY + Math.sin(angle) * coreRadius,
      });
    });

    // Position peripheral tables in larger circles
    if (peripheralTables.length > 0) {
      const outerRadius = Math.max(400, this.config.spacing * 1.5);
      peripheralTables.forEach((table, index) => {
        const angle = (index / peripheralTables.length) * 2 * Math.PI;
        positions.set(table.name, {
          x: centerX + Math.cos(angle) * outerRadius,
          y: centerY + Math.sin(angle) * outerRadius,
        });
      });
    }

    return positions;
  }

  // Modular Layout - Group by table prefix/module
  modularLayout(tables: Table[]): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    
    // Group tables by prefix (before first underscore)
    const groups = new Map<string, Table[]>();
    
    tables.forEach(table => {
      const prefix = table.name.split('_')[0] || 'misc';
      if (!groups.has(prefix)) {
        groups.set(prefix, []);
      }
      groups.get(prefix)?.push(table);
    });

    const groupEntries = Array.from(groups.entries());
    const groupsPerRow = Math.ceil(Math.sqrt(groupEntries.length));
    
    groupEntries.forEach(([groupName, groupTables], groupIndex) => {
      const groupRow = Math.floor(groupIndex / groupsPerRow);
      const groupCol = groupIndex % groupsPerRow;
      
      // Base position for this group
      const groupBaseX = groupCol * this.config.spacing * 2.5 + this.config.padding;
      const groupBaseY = groupRow * this.config.spacing * 2.5 + this.config.padding;
      
      // Arrange tables within the group in a sub-grid
      const tablesInGroup = groupTables.length;
      const subGridCols = Math.max(1, Math.ceil(Math.sqrt(tablesInGroup)));
      
      groupTables.forEach((table, tableIndex) => {
        const subRow = Math.floor(tableIndex / subGridCols);
        const subCol = tableIndex % subGridCols;
        
        positions.set(table.name, {
          x: groupBaseX + subCol * (this.config.spacing * 0.8),
          y: groupBaseY + subRow * (this.config.spacing * 0.8),
        });
      });
    });

    return positions;
  }

  // Force-Directed Layout - Physics simulation
  forceDirectedLayout(tables: Table[], iterations = 300): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    
    // Initialize random positions
    tables.forEach(table => {
      positions.set(table.name, {
        x: Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
        y: Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1,
      });
    });

    // Force simulation parameters
    const repulsionStrength = this.config.spacing * this.config.spacing;
    const attractionStrength = 0.1;
    const damping = 0.9;

    for (let iteration = 0; iteration < iterations; iteration++) {
      const forces = new Map<string, { x: number; y: number }>();
      
      // Initialize forces
      tables.forEach(table => {
        forces.set(table.name, { x: 0, y: 0 });
      });

      // Repulsion forces (all pairs)
      tables.forEach(table1 => {
        tables.forEach(table2 => {
          if (table1.name === table2.name) return;
          
          const pos1 = positions.get(table1.name)!;
          const pos2 = positions.get(table2.name)!;
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.1; // Avoid division by zero
          
          const force = repulsionStrength / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          const currentForce = forces.get(table1.name)!;
          currentForce.x += fx;
          currentForce.y += fy;
        });
      });

      // Attraction forces (connected tables)
      this.schema.relationships.forEach(rel => {
        const pos1 = positions.get(rel.from);
        const pos2 = positions.get(rel.to);
        
        if (!pos1 || !pos2) return;
        
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.1;
        
        const force = distance * attractionStrength;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        const force1 = forces.get(rel.from)!;
        const force2 = forces.get(rel.to)!;
        
        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      });

      // Apply forces
      tables.forEach(table => {
        const pos = positions.get(table.name)!;
        const force = forces.get(table.name)!;
        
        pos.x += force.x * damping;
        pos.y += force.y * damping;
        
        // Keep within bounds
        pos.x = Math.max(this.config.padding, Math.min(window.innerWidth - this.config.padding, pos.x));
        pos.y = Math.max(this.config.padding, Math.min(window.innerHeight - this.config.padding, pos.y));
      });
    }

    return positions;
  }

  // Utility functions
  distributeEvenly(tables: Table[], currentPositions: Map<string, LayoutPosition>): Map<string, LayoutPosition> {
    const positions = new Map<string, LayoutPosition>();
    
    if (tables.length === 0) return positions;
    
    // Find current bounds
    const bounds = this.getBounds(currentPositions);
    const availableWidth = bounds.maxX - bounds.minX || window.innerWidth * 0.8;
    const availableHeight = bounds.maxY - bounds.minY || window.innerHeight * 0.8;
    
    // Calculate grid dimensions
    const aspectRatio = availableWidth / availableHeight;
    const cols = Math.ceil(Math.sqrt(tables.length * aspectRatio));
    const rows = Math.ceil(tables.length / cols);
    
    const spacingX = availableWidth / Math.max(1, cols - 1) || this.config.spacing;
    const spacingY = availableHeight / Math.max(1, rows - 1) || this.config.spacing;
    
    tables.forEach((table, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      positions.set(table.name, {
        x: bounds.minX + col * spacingX,
        y: bounds.minY + row * spacingY,
      });
    });
    
    return positions;
  }

  resolveOverlaps(tables: Table[], currentPositions: Map<string, LayoutPosition>): Map<string, LayoutPosition> {
    const positions = new Map(currentPositions);
    const minDistance = this.config.spacing * 0.7; // Minimum distance between table centers
    
    // Simple overlap resolution using repulsion
    for (let iteration = 0; iteration < 50; iteration++) {
      let hasOverlaps = false;
      
      tables.forEach(table1 => {
        tables.forEach(table2 => {
          if (table1.name === table2.name) return;
          
          const pos1 = positions.get(table1.name)!;
          const pos2 = positions.get(table2.name)!;
          
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance) {
            hasOverlaps = true;
            
            // Move tables apart
            const moveDistance = (minDistance - distance) / 2 + 10;
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;
            
            pos1.x += moveX;
            pos1.y += moveY;
            pos2.x -= moveX;
            pos2.y -= moveY;
          }
        });
      });
      
      if (!hasOverlaps) break;
    }
    
    return positions;
  }

  private getBounds(positions: Map<string, LayoutPosition>) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });
    
    return { minX, minY, maxX, maxY };
  }

  // Main layout method
  applyLayout(type: LayoutType, tables: Table[], currentPositions?: Map<string, LayoutPosition>): Map<string, LayoutPosition> {
    switch (type) {
      case 'hierarchical':
        return this.hierarchicalLayout(tables);
      case 'circular':
        return this.circularLayout(tables);
      case 'modular':
        return this.modularLayout(tables);
      case 'force':
        return this.forceDirectedLayout(tables);
      case 'grid':
      default:
        return this.gridLayout(tables);
    }
  }
}