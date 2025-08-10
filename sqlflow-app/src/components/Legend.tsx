import React from 'react';
import { Box, Typography, Card, Chip } from '@mui/material';
import { 
  Key as KeyIcon, 
  Link as LinkIcon,
  Storage as TableIcon,
  Code as CodeIcon,
  Numbers as NumberIcon,
  TextFields as TextIcon,
  CalendarToday as DateIcon,
  ToggleOn as BooleanIcon,
  TrendingFlat as ArrowIcon
} from '@mui/icons-material';

const Legend: React.FC = () => {
  const legendItems = [
    {
      category: 'Table Elements',
      items: [
        { icon: <TableIcon sx={{ fontSize: 16, color: '#4285F4' }} />, label: 'Database Table', description: 'Represents a table in the schema' },
        { icon: <KeyIcon sx={{ fontSize: 16, color: '#FFC107' }} />, label: 'Primary Key', description: 'Unique identifier for table rows' },
        { icon: <LinkIcon sx={{ fontSize: 16, color: '#2196F3' }} />, label: 'Foreign Key', description: 'Reference to another table' },
        { 
          icon: <ArrowIcon sx={{ fontSize: 16, color: '#66BB6A' }} />, 
          label: 'Relationship', 
          description: 'Connection between tables' 
        },
      ]
    },
    {
      category: 'Data Types',
      items: [
        { icon: <NumberIcon sx={{ fontSize: 16, color: '#2196F3' }} />, label: 'Numeric', description: 'INT, BIGINT, DECIMAL' },
        { icon: <TextIcon sx={{ fontSize: 16, color: '#4CAF50' }} />, label: 'Text', description: 'VARCHAR, TEXT, CHAR' },
        { icon: <DateIcon sx={{ fontSize: 16, color: '#FF9800' }} />, label: 'Date/Time', description: 'TIMESTAMP, DATE' },
        { icon: <BooleanIcon sx={{ fontSize: 16, color: '#9C27B0' }} />, label: 'Boolean', description: 'TRUE/FALSE values' },
        { icon: <CodeIcon sx={{ fontSize: 16, color: '#E91E63' }} />, label: 'JSON', description: 'JSON/JSONB data' },
      ]
    },
    {
      category: 'Key Indicators',
      items: [
        { 
          icon: <Chip label="PK" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#FFC107', color: '#333' }} />, 
          label: 'Primary Key Badge', 
          description: 'Column is a primary key' 
        },
        { 
          icon: <Chip label="FK" size="small" sx={{ height: 16, fontSize: '0.6rem', backgroundColor: '#2196F3', color: 'white' }} />, 
          label: 'Foreign Key Badge', 
          description: 'Column references another table' 
        },
      ]
    }
  ];

  return (
    <Card
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        width: 300,
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: '#2A2A2A',
        border: '1px solid #3A3A3A',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#353535',
          borderBottom: '2px solid #4285F4',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CodeIcon sx={{ fontSize: 18, color: '#4285F4' }} />
          Schema Legend
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
        {legendItems.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#4285F4',
                fontWeight: 600,
                fontSize: '0.85rem',
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {category.category}
            </Typography>
            
            {category.items.map((item, itemIndex) => (
              <Box
                key={itemIndex}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1,
                  px: 1.5,
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(66, 133, 244, 0.08)',
                  },
                }}
              >
                <Box sx={{ mt: 0.25 }}>
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      lineHeight: 1.2,
                      mb: 0.25,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#A0A0A0',
                      fontSize: '0.7rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default Legend;