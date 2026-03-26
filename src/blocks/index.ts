import { Block } from '../core/types';
import { logHello } from './logHello';
import { alwaysFails } from './alwaysFails';
import { openPage } from './openPage';
import { clickLink } from './clickLink';
import { assertHeadingVisible } from './assertHeadingVisible';
import { readPageTitle } from './readPageTitle';
import { assertContextValue } from './assertContextValue';
import { clickNonExistentButton } from './clickNonExistentButton';

export const blocks: Block[] = [
  logHello,
  alwaysFails,
  openPage,
  clickLink,
  assertHeadingVisible,
  readPageTitle,
  assertContextValue,
  clickNonExistentButton,
];
