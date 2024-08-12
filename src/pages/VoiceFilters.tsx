import React from 'react';
import { Select, Grid } from '@mantine/core';

interface VoiceFiltersProps {
  filters: {
    category: string;
    gender: string;
    accent: string;
    age: string;
    use_case: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    category: string;
    gender: string;
    accent: string;
    age: string;
    use_case: string;
  }>>;
  filterValues: {
    category: string[];
    gender: string[];
    accent: string[];
    age: string[];
    use_case: string[];
  };
}

const VoiceFilters: React.FC<VoiceFiltersProps> = ({ filters, setFilters, filterValues }) => {
  return (
    <Grid gutter="xs" justify="space-between" align="center">
      <Grid.Col span={2}>
        <Select
          label="Category"
          placeholder="Select Category"
          value={filters.category}
          onChange={(value) => setFilters((prev) => ({ ...prev, category: value || '' }))}
          data={filterValues.category.map((category) => ({ value: category, label: category }))}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <Select
          label="Gender"
          placeholder="Select Gender"
          value={filters.gender}
          onChange={(value) => setFilters((prev) => ({ ...prev, gender: value || '' }))}
          data={filterValues.gender.map((gender) => ({ value: gender, label: gender }))}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <Select
          label="Accent"
          placeholder="Select Accent"
          value={filters.accent}
          onChange={(value) => setFilters((prev) => ({ ...prev, accent: value || '' }))}
          data={filterValues.accent.map((accent) => ({ value: accent, label: accent }))}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <Select
          label="Age"
          placeholder="Select Age"
          value={filters.age}
          onChange={(value) => setFilters((prev) => ({ ...prev, age: value || '' }))}
          data={filterValues.age.map((age) => ({ value: age, label: age }))}
        />
      </Grid.Col>
      <Grid.Col span={2}>
        <Select
          label="Use Case"
          placeholder="Select Use Case"
          value={filters.use_case}
          onChange={(value) => setFilters((prev) => ({ ...prev, use_case: value || '' }))}
          data={filterValues.use_case.map((use_case) => ({ value: use_case, label: use_case }))}
        />
      </Grid.Col>
    </Grid>
  );
};

export default VoiceFilters;
