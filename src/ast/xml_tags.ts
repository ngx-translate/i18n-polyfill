/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TagContentType, TagDefinition} from "./tags";

export class XmlTagDefinition implements TagDefinition {
  closedByParent = false;
  requiredParents: {[key: string]: boolean};
  parentToAdd: string;
  implicitNamespacePrefix: string;
  contentType: TagContentType = TagContentType.PARSABLE_DATA;
  isVoid = false;
  ignoreFirstLf = false;
  canSelfClose = true;

  requireExtraParent(currentParent: string): boolean {
    return false;
  }

  isClosedByChild(name: string): boolean {
    return false;
  }
}

const _TAG_DEFINITION = new XmlTagDefinition();

export function getXmlTagDefinition(tagName: string): XmlTagDefinition {
  return _TAG_DEFINITION;
}
