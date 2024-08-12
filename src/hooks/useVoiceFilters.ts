import { useState, useEffect } from 'react';
import { Voice } from '../pages/index';

interface Filters {
  category: string[];
  gender: string[];
  accent: string[];
  age: string[];
  use_case: string[];
}

export const useVoiceFilters = (voices: Voice[]) => {
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    accent: '',
    age: '',
    use_case: ''
  });

  const [filteredVoices, setFilteredVoices] = useState<Voice[]>(voices);

  const filterValues = voices.reduce((acc: Filters, voice: Voice) => {
    acc.category = Array.from(new Set([...acc.category, voice.category]));
    acc.gender = Array.from(new Set([...acc.gender, voice.labels.gender]));
    acc.accent = Array.from(new Set([...acc.accent, voice.labels.accent]));
    acc.age = Array.from(new Set([...acc.age, voice.labels.age]));
    acc.use_case = Array.from(new Set([...acc.use_case, voice.labels.use_case]));
    return acc;
  }, { category: [], gender: [], accent: [], age: [], use_case: [] });

  useEffect(() => {
    setFilteredVoices(
      voices.filter((voice) => {
        return (
          (!filters.category || voice.category === filters.category) &&
          (!filters.gender || voice.labels.gender === filters.gender) &&
          (!filters.accent || voice.labels.accent === filters.accent) &&
          (!filters.age || voice.labels.age === filters.age) &&
          (!filters.use_case || voice.labels.use_case === filters.use_case)
        );
      })
    );
  }, [filters, voices]);

  console.log('Filter values:', filterValues);

  return { filters, setFilters, filteredVoices, filterValues };
};
