import { useState, useEffect } from 'react';
import { CustomSection } from '../types/customSection';

export function useCustomSections(currentUserId: string) {
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`customSections-${currentUserId}`);
    setCustomSections(stored ? JSON.parse(stored) : []);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`customSections-${currentUserId}`, JSON.stringify(customSections));
  }, [customSections, currentUserId]);

  const addCustomSection = (section: Omit<CustomSection, 'id'>): CustomSection => {
    const newSection: CustomSection = { ...section, id: `section-${Date.now()}` };
    setCustomSections(prev => [...prev, newSection]);
    return newSection;
  };

  const removeByContentType = (contentType: string) => {
    setCustomSections(prev => prev.filter(s => s.contentType !== contentType));
  };

  return { customSections, setCustomSections, addCustomSection, removeByContentType };
}
