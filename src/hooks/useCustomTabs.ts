import { useState, useEffect } from 'react';
import { CustomTab } from '../types/customTab';

export function useCustomTabs(currentUserId: string) {
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`customTabs-${currentUserId}`);
    setCustomTabs(stored ? JSON.parse(stored) : []);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`customTabs-${currentUserId}`, JSON.stringify(customTabs));
  }, [customTabs, currentUserId]);

  const addCustomTab = (tab: Omit<CustomTab, 'id'>): CustomTab => {
    const newTab: CustomTab = { ...tab, id: `custom-${Date.now()}` };
    setCustomTabs(prev => [...prev, newTab]);
    return newTab;
  };

  const removeTab = (tabId: string) => {
    setCustomTabs(prev => prev.filter(t => t.id !== tabId));
  };

  return { customTabs, setCustomTabs, addCustomTab, removeTab };
}
