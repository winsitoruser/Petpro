import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import { 
  Language as LanguageIcon, 
  KeyboardArrowDown as ArrowDownIcon 
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' }
];

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Find the current language
  const currentLanguage = languages.find(
    (lang) => lang.code === router.locale
  ) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (langCode: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: langCode });
    handleClose();
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<ArrowDownIcon />}
        sx={{ 
          textTransform: 'none',
          minWidth: 120,
          justifyContent: 'space-between',
          px: 2
        }}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" component="span" sx={{ mr: 1 }}>
            {currentLanguage.flag}
          </Typography>
          <Typography variant="body2" component="span">
            {currentLanguage.name}
          </Typography>
        </Box>
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            selected={currentLanguage.code === language.code}
            sx={{ 
              minWidth: 150,
              py: 1
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="body1">{language.flag}</Typography>
            </ListItemIcon>
            <ListItemText>{language.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
