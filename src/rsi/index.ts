import { Rule, SchematicContext, Tree, apply, url, template, move, forEach, FileEntry, mergeWith, MergeStrategy } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from 'schematics-utilities';
import { normalize } from 'path';

function addDependencies(host: Tree): Tree {
  const dependencies: NodeDependency[] = [
    { type: NodeDependencyType.Default, version: '4.3.1', name: 'bootstrap' },
    { type: NodeDependencyType.Default, version: '7.1.0', name: 'reactstrap' }
  ];
  dependencies.forEach(dependency => addPackageJsonDependency(host, dependency));
  return host;
}

export function rsi(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    addDependencies(tree);

    const movePath = normalize('./src');
    const templateSource = apply(url('./templates/src'), [
      template({..._options}),
      move(movePath),
      // fix for https://github.com/angular/angular-cli/issues/11337
      forEach((fileEntry: FileEntry) => {
        if (tree.exists(fileEntry.path)) {
          tree.overwrite(fileEntry.path, fileEntry.content);
        }
        return fileEntry;
      }),
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, _context);
  };
}