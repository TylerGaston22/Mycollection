/**
 * useCustomTabs & useCustomSections – manage user-created categories and sub-sections.
 * Both hooks persist their data to localStorage per user and expose
 * add/remove helpers that return the newly created entity.
 */

import { useState, useEffect } from 'react';
import { CustomTab, CustomSection } from '../types';

export function useCustomTabs(currentUserId: string) {
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);

  useEffect(() => {
    const savedTabsJsonString = localStorage.getItem(`customTabs-${currentUserId}`);
    if (savedTabsJsonString) {
      setCustomTabs(JSON.parse(savedTabsJsonString));
    } else {
      setCustomTabs([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`customTabs-${currentUserId}`, JSON.stringify(customTabs));
  }, [customTabs, currentUserId]);

  const addCustomTab = (tab: Omit<CustomTab, 'id'>): CustomTab => {
    const newTab: CustomTab = { ...tab, id: `custom-${Date.now()}` };
    setCustomTabs((previousTabsList) => [...previousTabsList, newTab]);
    return newTab;
  };

  const removeTab = (tabIdToRemove: string) => {
    setCustomTabs((previousTabsList) => previousTabsList.filter((tab) => tab.id !== tabIdToRemove));
  };

  return { customTabs, setCustomTabs, addCustomTab, removeTab };
}

export function useCustomSections(currentUserId: string) {
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  useEffect(() => {
    const savedSectionsJsonString = localStorage.getItem(`customSections-${currentUserId}`);
    if (savedSectionsJsonString) {
      setCustomSections(JSON.parse(savedSectionsJsonString));
    } else {
      setCustomSections([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`customSections-${currentUserId}`, JSON.stringify(customSections));
  }, [customSections, currentUserId]);

  const addCustomSection = (section: Omit<CustomSection, 'id'>): CustomSection => {
    const newSection: CustomSection = { ...section, id: `section-${Date.now()}` };
    setCustomSections((previousSectionsList) => [...previousSectionsList, newSection]);
    return newSection;
  };

  const removeByContentType = (contentTypeToRemove: string) => {
    setCustomSections((previousSectionsList) => previousSectionsList.filter((section) => section.contentType !== contentTypeToRemove));
  };

  return { customSections, setCustomSections, addCustomSection, removeByContentType };
}
