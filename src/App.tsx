import { useState, type ReactElement, type ReactNode } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Container,
  Typography,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';

import JWTDecode from './components/JWTDecode';
import JWTEncode from './components/JWTEncode';
import JWTVerify from './components/JWTVerify';
import JWTInspector from './components/JWTInspector';

interface TabPanel {
  label: string;
  icon: ReactElement;
  component: ReactNode;
}

const tabs: TabPanel[] = [
  { label: 'Decode', icon: <LockOpenIcon />, component: <JWTDecode /> },
  { label: 'Encode', icon: <LockIcon />, component: <JWTEncode /> },
  { label: 'Verify', icon: <VerifiedUserIcon />, component: <JWTVerify /> },
  { label: 'Inspector', icon: <SearchIcon />, component: <JWTInspector /> },
];

function TabPanelComponent({ children, index, value }: { children: ReactNode; index: number; value: number }) {
  return (
    <div role="tabpanel" hidden={value !== index} className="h-full">
      {value === index && <Box className="py-4">{children}</Box>}
    </div>
  );
}

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  document.documentElement.classList.remove('dark');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors">
      {/* Header */}
<AppBar
        position="sticky"
        elevation={0}
        className="border-b border-gray-200"
        style={{
          background: '#f8fafc',
          color: '#111827',
        }}
      >
        <Toolbar className="min-h-12 px-2 md:px-4">
          <Box className="flex-1 flex items-center justify-center md:justify-start gap-1">
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px", color: "#111827" }} className="text-lg md:text-xl"
          >
            srckit
          </Typography>
          <Typography
            variant="caption"
            className="hidden md:inline opacity-60 tracking-wide"
            style={{ color: '#64748b' }}
          >— developer utilities
          </Typography>
          </Box>
          <IconButton
            size="small"
            href="https://github.com/sayan/srckit"
            target="_blank"
            rel="noopener noreferrer"
          className="ml-auto"
            style={{ color: '#64748b' }}
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Toolbar>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          className="border-t border-gray-200"
          slotProps={{
            indicator: { style: { backgroundColor: '#63b3ed', height: 3 } },
          }}
          style={{ minHeight: 40 }}
        >
          {tabs.map((t, i) => (
            <Tab
              key={i}
              label={t.label}
              icon={t.icon}
              iconPosition="start"
              className="min-h-10 text-xs md:text-sm normal-case"
              style={{ minHeight: 40, padding: '4px 8px' }}
            />
          ))}
        </Tabs>
      </AppBar>

      {/* Content */}
      <Container maxWidth="xl" className="py-2 px-2 md:px-4 flex-1">
        {tabs.map((t, i) => (
          <TabPanelComponent key={i} index={i} value={tabIndex}>
            {t.component}
          </TabPanelComponent>
        ))}
      </Container>

      {/* Footer */}
            <footer className="text-center py-6 border-t border-gray-200 mt-auto bg-white">
        <div className="space-y-1">
          <Typography variant="body2" sx={{fontWeight:600,color:"#111827",letterSpacing:'-0.3px'}}>
            srckit
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Copyright &copy; srckit. Powered by <strong>Bhanjo</strong>. Licensed under <strong>MIT</strong>.
          </Typography>
        </div>
      </footer>
    </div>
  );
}
