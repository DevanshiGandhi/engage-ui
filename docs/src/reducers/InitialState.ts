import { IDocumentAppState } from '../Types';

import ChoiceListState from './componentState/ChoiceListState';
import PanelState from './componentState/PanelState';
import UnstyledLinkState from './componentState/UnstyledLinkState';
import LabelledState from './componentState/LabelledState';
import PositionedOverlayState  from './componentState/PositionedOverlayState';

const intialState : IDocumentAppState = {
  components: [
    ChoiceListState,
    PanelState,
    UnstyledLinkState,
    LabelledState,
    PositionedOverlayState,
  ],
};

export default intialState;
