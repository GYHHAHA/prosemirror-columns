import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import 'prosemirror-example-setup/style/style.css';
import 'prosemirror-gapcursor/style/gapcursor.css';
import '../style/column.css';

import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin } from 'prosemirror-state';
import { DOMParser, Schema } from 'prosemirror-model';
import { schema as baseSchema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';

import { columnNodes, gridResizingPlugin } from '../src';

const schema = new Schema({
  nodes: baseSchema.spec.nodes.append(columnNodes()),
  marks: baseSchema.spec.marks,
});

const contentElement = document.querySelector('#content');
if (!contentElement) {
  throw new Error('Failed to find #content');
}
const doc = DOMParser.fromSchema(schema).parse(contentElement);

const state = EditorState.create({
  doc,
  plugins: [
    gridResizingPlugin({ handleWidth: 2, columnMinWidth: 50 }) as Plugin,
  ].concat(
    exampleSetup({
      schema,
    }),
  ),
});

(window as any).view = new EditorView(document.querySelector('#editor'), {
  state,
});
