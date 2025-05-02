import { EditorView } from 'prosemirror-view';
import debounce from 'lodash/debounce';
import { type Dragging } from './state';

export function findBoundaryPosition(
  view: EditorView,
  event: MouseEvent,
  handleWidth: number,
): number {
  const gridDOM = event
    .composedPath()
    .find((el) =>
      (el as HTMLElement).classList?.contains('prosemirror-column-container'),
    ) as HTMLElement | undefined;
  if (!gridDOM) return -1;

  const children = Array.from(gridDOM.children).filter((el) =>
    el.classList.contains('prosemirror-column'),
  );
  for (let i = 0; i < children.length; i++) {
    const colEl = children[i] as HTMLElement;
    const rect = colEl.getBoundingClientRect();
    if (
      event.clientX >= rect.right - handleWidth - 2 &&
      event.clientX <= rect.right + 10 + handleWidth
    ) {
      const pos = view.posAtDOM(colEl, 0);
      if (pos != null) {
        return pos;
      }
    }
  }

  return -1;
}

export function draggedWidth(
  dragging: Dragging,
  event: MouseEvent,
  minWidth: number,
): number {
  const offset = event.clientX - dragging.startX;
  return Math.max(minWidth, dragging.startWidth + offset);
}

export function updateColumnNodeWidth(
  view: EditorView,
  boundaryPos: number,
  width: number,
) {
  const colInfo = getColumnInfoAtPos(view, boundaryPos);
  if (!colInfo) return;

  const { $pos, node } = colInfo;
  const attrs = node.attrs || {};
  // Suppose we store in an attribute colWidth
  const newAttrs = { ...attrs, colWidth: width - 12 * 2 };

  view.dispatch(
    view.state.tr.setNodeMarkup($pos.before(), undefined, newAttrs),
  );
}

// TODO: Fix this
// export function displayColumnWidth(view: EditorView, boundaryPos: number, width: number) {
//   const colInfo = getColumnInfoAtPos(view, boundaryPos);
//   if (!colInfo) return;
//   const { columnEl } = colInfo;
//   columnEl.style.width = width + 'px';
// }

export const displayColumnWidth = debounce(updateColumnNodeWidth, 10);

export function getColumnInfoAtPos(view: EditorView, boundaryPos: number) {
  const $pos = view.state.doc.resolve(boundaryPos);
  const node = $pos.parent;
  if (!node || node.type.name !== 'column') return null;

  const dom = view.domAtPos($pos.pos);
  if (!dom.node) return null;

  const columnEl =
    dom.node instanceof HTMLElement
      ? dom.node
      : (dom.node.childNodes[dom.offset] as HTMLElement);

  const domWidth = columnEl.offsetWidth;

  return { $pos, node, columnEl, domWidth };
}
