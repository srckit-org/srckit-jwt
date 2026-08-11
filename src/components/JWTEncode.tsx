import { useState } from 'react';
import {
  TextField,
  Paper,
  Typography,
  Button,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { encodeJWT, ALGORITHMS, type JWTHeader, type JWTPayload } from '../utils/jwtUtils';

interface CustomClaim {
  key: string;
  value: string;
}

export default function JWTEncode() {
  const [alg, setAlg] = useState('HS256');
  const [secret, setSecret] = useState('');
  const [iss, setIss] = useState('');
  const [sub, setSub] = useState('');
  const [aud, setAud] = useState('');
  const [customClaims, setCustomClaims] = useState<CustomClaim[]>([{ key: '', value: '' }]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const addClaim = () => setCustomClaims(prev => [...prev, { key: '', value: '' }]);
  const removeClaim = (i: number) => setCustomClaims(prev => prev.filter((_, idx) => idx !== i));
  const updateClaim = (i: number, field: 'key' | 'value', val: string) => {
    setCustomClaims(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const handleEncode = async () => {
    setError('');
    try {
      const header: JWTHeader = { alg, typ: 'JWT' };
      const payload: JWTPayload = {
        iat: Math.floor(Date.now() / 1000),
      };
      if (iss.trim()) payload.iss = iss.trim();
      if (sub.trim()) payload.sub = sub.trim();
      if (aud.trim()) payload.aud = aud.trim();

      for (const claim of customClaims) {
        if (!claim.key.trim()) continue;
        try {
          payload[claim.key.trim()] = JSON.parse(claim.value || '""');
        } catch {
          payload[claim.key.trim()] = claim.value;
        }
      }

      const token = await encodeJWT(header, payload, secret);
      setOutput(token);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
        JWT Encode
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Build a JWT with custom header, payload claims, and a signing secret. Encoding happens entirely in-browser.
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Configuration */}
        <Paper variant="outlined" className="p-4 space-y-4">
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Configuration
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Algorithm</InputLabel>
            <Select
              value={alg}
              label="Algorithm"
              onChange={e => setAlg(e.target.value)}
            >
              {ALGORITHMS.map(a => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Secret / Key"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            fullWidth
            size="small"
            type="password"
            placeholder={alg === 'none' ? 'No secret needed for alg=none' : 'your-256-bit-secret'}
            disabled={alg === 'none'}
            helperText={alg === 'none' ? 'No secret required when algorithm is "none"' : ''}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} className="pt-2">
            Registered Claims (optional)
          </Typography>
          <TextField label="Issuer (iss)" value={iss} onChange={e => setIss(e.target.value)} fullWidth size="small" />
          <TextField label="Subject (sub)" value={sub} onChange={e => setSub(e.target.value)} fullWidth size="small" />
          <TextField label="Audience (aud)" value={aud} onChange={e => setAud(e.target.value)} fullWidth size="small" />
        </Paper>

        {/* Custom Claims */}
        <Paper variant="outlined" className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Custom Claims
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addClaim}>
              Add Claim
            </Button>
          </div>
          <Typography variant="caption" color="text.secondary">
            Values are parsed as JSON. Use quotes for strings: "hello", numbers: 42, booleans: true, objects: {'{'}"key":"val"{'}'}
          </Typography>

          {customClaims.map((claim, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextField
                label="Key"
                value={claim.key}
                onChange={e => updateClaim(i, 'key', e.target.value)}
                size="small"
                className="flex-1"
                placeholder="e.g. role"
              />
              <TextField
                label="Value"
                value={claim.value}
                onChange={e => updateClaim(i, 'value', e.target.value)}
                size="small"
                className="flex-[2]"
                placeholder='"admin"'
              />
              <IconButton size="small" onClick={() => removeClaim(i)} disabled={customClaims.length === 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </Paper>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={handleEncode}
        >
          Encode JWT
        </Button>
        {output && (
          <Tooltip title={copied ? 'Copied!' : 'Copy JWT'}>
            <IconButton onClick={handleCopy} color="default">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        )}
        <Button variant="text" onClick={() => { setOutput(''); setError(''); }}>
          Clear Output
        </Button>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {output && (
        <Paper variant="outlined" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Chip label="JWT" size="small" color="success" />
            <Typography variant="caption" color="text.secondary">
              {output.length} characters
            </Typography>
          </div>
          <pre className="m-0 text-xs font-mono break-all whitespace-pre-wrap bg-gray-100 p-3 rounded">
            {output}
          </pre>
        </Paper>
      )}

      {!output && !error && (
        <Paper variant="outlined" className="p-8 text-center">
          <Typography color="text.secondary">
            Configure the header and payload above, then click <strong>Encode JWT</strong>.
          </Typography>
        </Paper>
      )}
    </div>
  );
}
