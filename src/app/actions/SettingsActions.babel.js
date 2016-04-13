import AppStore from 'babel/store/AppStore';
import {
  UPDATE_SETTINGS_OAUTH,
  UPDATE_SETTINGS_COMMON_PARTICIPATE_SHORT,
  UPDATE_SETTINGS_COMMON_EXPLORE_TEXT,
  UPDATE_SETTINGS_INTRO_TITLE,
  UPDATE_SETTINGS_INTRO_SUBTITLE,
  UPDATE_SETTINGS_HEADER_TITLE,
  UPDATE_SETTINGS_HEADER_LOGO_URL,
  UPDATE_SETTINGS_HEADER_LOGO_LINK,
  UPDATE_SETTINGS_MAP_CROWDSOURCE_LAYER_ID,
  UPDATE_SETTINGS_MAP_WEBMAP_ID,
  UPDATE_LAYOUT_ID
} from 'babel/constants/actionsTypes/Settings';

const dispatch = AppStore.dispatch;

// OAuth
export const updateOAuthSettings = function (options) {
  return {
    type: UPDATE_SETTINGS_OAUTH,
    options
  };
};

// Components

// Common Components
export const updateCommonParticipateShort = function (text) {
  return {
    type: UPDATE_SETTINGS_COMMON_PARTICIPATE_SHORT,
    text
  };
};

export const updateCommonExploreText = function (text) {
  return {
    type: UPDATE_SETTINGS_COMMON_EXPLORE_TEXT,
    text
  };
};

// Intro Components
export const updateIntroTitle = function (title) {
  return {
    type: UPDATE_SETTINGS_INTRO_TITLE,
    title
  };
};

export const updateIntroSubtitle = function (subtitle) {
  return {
    type: UPDATE_SETTINGS_INTRO_SUBTITLE,
    subtitle
  };
};

// Header Components
export const updateHeaderTitle = function (title) {
  return {
    type: UPDATE_SETTINGS_HEADER_TITLE,
    title
  };
};

export const updateHeaderLogoUrl = function (url) {
  return {
    type: UPDATE_SETTINGS_HEADER_LOGO_URL,
    url
  };
};

export const updateHeaderLogoLink = function (link) {
  return {
    type: UPDATE_SETTINGS_HEADER_LOGO_LINK,
    link
  };
};

// Map Components
export const updateMapCrowdsourceLayerId = function (id) {
  return {
    type: UPDATE_SETTINGS_MAP_CROWDSOURCE_LAYER_ID,
    id
  };
};

export const updateMapWebmapId = function (webmap) {
  return {
    type: UPDATE_SETTINGS_MAP_WEBMAP_ID,
    webmap
  };
};

// Layout Actions
export const updateLayoutId = function (id) {
  return {
    type: UPDATE_LAYOUT_ID,
    id
  };
};

export const boundActions = {
  updateOAuthSettings: (options) => dispatch(updateOAuthSettings(options)),
  updateCommonParticipateShort: (text) => dispatch(updateCommonParticipateShort(text)),
  updateCommonExploreText: (text) => dispatch(updateCommonExploreText(text)),
  updateIntroTitle: (title) => dispatch(updateIntroTitle(title)),
  updateIntroSubtitle: (subtitle) => dispatch(updateIntroSubtitle(subtitle)),
  updateHeaderTitle: (title) => dispatch(updateHeaderTitle(title)),
  updateHeaderLogoUrl: (url) => dispatch(updateHeaderLogoUrl(url)),
  updateHeaderLogoLink: (link) => dispatch(updateHeaderLogoLink(link)),
  updateMapCrowdsourceLayerId: (id) => dispatch(updateMapCrowdsourceLayerId(id)),
  updateMapWebmapId: (webmap) => dispatch(updateMapWebmapId(webmap)),
  updateLayoutId: (id) => dispatch(updateLayoutId(id))
};

export default boundActions;
