import { useState, useMemo } from 'react';
import {
  TextField,
  Paper,
  Typography,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { decodeJWT, formatTimestamp, isExpired, isBeforeNbf, REGISTERED_CLAIMS, type JWTPayload } from '../utils/jwtUtils';

function PayloadCard({ payload }: { payload: JWTPayload }) {
  const claims = REGISTERED_CLAIMS.filter(c => c.key in payload);
  const custom = Object.entries(payload).filter(([k]) => !REGISTERED_CLAIMS.some(c => c.key === k));

  return (
    <div className="space-y-3">
      {/* Registered claims */}
      {claims.length > 0 && (
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} className="mb-2">
            Registered Claims
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {claims.map(c => {
              const val = payload[c.key];
              let display: string;
              if ((c.key === 'exp' || c.key === 'nbf' || c.key === 'iat') && typeof val === 'number') {
                display = formatTimestamp(val);
              } else if (Array.isArray(val)) {
                display = val.join(', ');
              } else {
                display = String(val);
              }
              return (
                <Paper key={c.key} variant="outlined" className="p-2">
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {c.label}
                  </Typography>
                  <Typography variant="body2" className="font-mono break-all">
                    {display}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.description}
                  </Typography>
                </Paper>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom claims */}
      {custom.length > 0 && (
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} className="mb-2">
            Custom Claims
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {custom.map(([key, val]) => (
              <Paper key={key} variant="outlined" className="p-2">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {key}
                </Typography>
                <pre className="m-0 text-xs font-mono overflow-auto max-h-20">
                  {JSON.stringify(val, null, 2)}
                </pre>
              </Paper>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JWTDecode() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const decoded = useMemo(() => {
    setError('');
    if (!input.trim()) return null;
    const result = decodeJWT(input);
    if (!result) {
      setError('Invalid JWT format — expected header.payload.signature');
      return null;
    }
    return result;
  }, [input]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text.trim());
    } catch { /* ignore */ }
  };

  const expired = decoded ? isExpired(decoded.payload) : false;
  const notYetValid = decoded ? isBeforeNbf(decoded.payload) : false;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
        JWT Decode
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Paste a JWT to decode its header, payload, and inspect claims. Decoding happens entirely in-browser.
      </Typography>

      <TextField
        label="Encoded JWT"
        multiline
        minRows={4}
        maxRows={8}
        value={input}
        onChange={e => setInput(e.target.value.trim())}
        fullWidth
        variant="outlined"
        className="font-mono mb-4"
        slotProps={{ htmlInput: { className: 'font-mono text-sm' } }}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button variant="outlined" startIcon={<ContentPasteIcon />} onClick={handlePaste}>
          Paste
        </Button>
        {input && (
          <Button variant="text" onClick={() => setInput('')}>
            Clear
          </Button>
        )}
        {decoded && !expired && !notYetValid && (
          <Chip label="Valid" size="small" color="success" variant="outlined" />
        )}
        {expired && <Chip label="Expired" size="small" color="error" variant="outlined" />}
        {notYetValid && <Chip label="Not yet valid" size="small" color="warning" variant="outlined" />}
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {decoded && (
        <div className="space-y-4">
          {/* Header */}
          <Paper variant="outlined" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Header
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy header JSON'}>
                <IconButton size="small" onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2))}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            <pre className="m-0 text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </Paper>

          {/* Payload */}
          <Paper variant="outlined" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Payload
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy payload JSON'}>
                <IconButton size="small" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2))}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            <PayloadCard payload={decoded.payload} />
          </Paper>

          {/* Raw parts */}
          <Paper variant="outlined" className="p-4">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
              Raw Parts
            </Typography>
            <div className="text-xs font-mono space-y-1 text-gray-500">
              <div className="break-all">
                <span className="text-red-400 font-semibold">Header:</span> {decoded.raw.header}
              </div>
              <div className="break-all">
                <span className="text-purple-400 font-semibold">Payload:</span> {decoded.raw.payload}
              </div>
              <div className="break-all">
                <span className="text-blue-400 font-semibold">Signature:</span> {decoded.raw.signature}
              </div>
            </div>
          </Paper>
        </div>
      )}

      {!decoded && !error && (
        <Paper variant="outlined" className="p-8 text-center">
          <Typography color="text.secondary">
            Paste a JWT above to decode it instantly.
          </Typography>
        </Paper>
      )}
    </div>
  );
}
