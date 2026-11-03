import { describe, expect, it } from 'vitest';
import { MODULES } from '../../src/module-registry.js';
import { MODULE_NAMES, type ModuleName } from '../../src/platform/module/module-name.js';

describe('module registry', () => {
  it('registers every module exactly once', () => {
    expect(MODULES.map((module) => module.name).sort()).toEqual([...MODULE_NAMES].sort());
  });

  it('has an acyclic dependency graph', () => {
    const graph = new Map(MODULES.map((module) => [module.name, module.dependsOn]));
    const visit = (name: ModuleName, path: readonly ModuleName[]): void => {
      expect(path, `cycle: ${[...path, name].join(' -> ')}`).not.toContain(name);
      for (const dependency of graph.get(name) ?? []) visit(dependency, [...path, name]);
    };
    for (const name of MODULE_NAMES) visit(name, []);
  });
});
