import { useState, useMemo } from 'react';
import {
  TextField,
  Paper,
  Typography,
  Alert,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  decodeJWT,
  formatTimestamp,
  isExpired,
  isBeforeNbf,
  ALGORITHMS,
  type DecodedToken,
} from '../utils/jwtUtils';

export default function JWTInspector() {
  const [input, setInput] = useState('');

  const decoded: DecodedToken | null = useMemo(() => {
    if (!input.trim()) return null;
    return decodeJWT(input);
  }, [input]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text.trim());
    } catch { /* ignore */ }
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const algoInfo = decoded ? ALGORITHMS.find(a => a.value === decoded.header.alg) : null;
  const expired = decoded ? isExpired(decoded.payload) : false;
  const notYetValid = decoded ? isBeforeNbf(decoded.payload) : false;
  const tokenParts = input.trim().split('.');

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
        JWT Inspector
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Deep inspect every aspect of a JWT — structure, algorithm, timestamps, and raw bytes.
      </Typography>

      <TextField
        label="Encoded JWT"
        multiline
        minRows={3}
        maxRows={7}
        value={input}
        onChange={e => setInput(e.target.value.trim())}
        fullWidth
        variant="outlined"
        className="font-mono mb-4"
        slotProps={{ htmlInput: { className: 'font-mono text-sm' } }}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
      </div>

      {!decoded && input && (
        <Alert severity="error" className="mb-4">
          Invalid JWT — expected format: header.payload.signature
        </Alert>
      )}

      {decoded && (
        <div className="space-y-4">
          {/* Structure */}
          <Paper variant="outlined" className="p-4">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
              Structure
            </Typography>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <Paper variant="outlined" className="p-3 bg-red-50">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  HEADER
                </Typography>
                <Typography variant="body2" className="font-mono break-all">
                  {tokenParts[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tokenParts[0]?.length ?? 0} chars
                </Typography>
              </Paper>
              <Paper variant="outlined" className="p-3 bg-purple-50">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PAYLOAD
                </Typography>
                <Typography variant="body2" className="font-mono break-all">
                  {tokenParts[1]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tokenParts[1]?.length ?? 0} chars
                </Typography>
              </Paper>
              <Paper variant="outlined" className="p-3 bg-blue-50">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  SIGNATURE
                </Typography>
                <Typography variant="body2" className="font-mono break-all text-xs">
                  {tokenParts[2] ? `${tokenParts[2].slice(0, 20)}...` : '(none)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tokenParts[2]?.length ?? 0} chars
                </Typography>
              </Paper>
            </div>
          </Paper>

          {/* Algorithm & Status */}
          <Paper variant="outlined" className="p-4">
            <div className="flex items-center flex-wrap gap-3">
              <div>
                <Typography variant="caption" color="text.secondary">Algorithm</Typography>
                <Chip
                  label={decoded.header.alg ?? 'unknown'}
                  size="small"
                  color={algoInfo ? 'primary' : 'warning'}
                  variant="outlined"
                />
                {algoInfo && (
                  <Typography variant="caption" color="text.secondary" className="ml-2">
                    {algoInfo.label.split(' — ')[1]}
                  </Typography>
                )}
              </div>
              <div>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <div className="flex gap-1 mt-1">
                  {expired ? (
                    <Chip icon={<CancelIcon />} label="Expired" size="small" color="error" />
                  ) : (
                    <Chip icon={<CheckCircleIcon />} label="Not expired" size="small" color="success" variant="outlined" />
                  )}
                  {notYetValid ? (
                    <Chip icon={<CancelIcon />} label="Not yet valid" size="small" color="warning" />
                  ) : (
                    <Chip icon={<CheckCircleIcon />} label="Valid now" size="small" color="success" variant="outlined" />
                  )}
                </div>
              </div>
            </div>
          </Paper>

          {/* Timestamps */}
          <Paper variant="outlined" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Timestamps
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy as JSON'}>
                <IconButton size="small" onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2))}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {decoded.payload.iat !== undefined && (
                <Paper variant="outlined" className="p-2">
                  <Typography variant="caption" color="text.secondary">Issued At (iat)</Typography>
                  <Typography variant="body2" className="font-mono text-xs">{formatTimestamp(decoded.payload.iat)}</Typography>
                </Paper>
              )}
              {decoded.payload.exp !== undefined && (
                <Paper variant="outlined" className="p-2">
                  <Typography variant="caption" color="text.secondary">Expires (exp)</Typography>
                  <Typography variant="body2" className="font-mono text-xs">{formatTimestamp(decoded.payload.exp)}</Typography>
                </Paper>
              )}
              {decoded.payload.nbf !== undefined && (
                <Paper variant="outlined" className="p-2">
                  <Typography variant="caption" color="text.secondary">Not Before (nbf)</Typography>
                  <Typography variant="body2" className="font-mono text-xs">{formatTimestamp(decoded.payload.nbf)}</Typography>
                </Paper>
              )}
            </div>
          </Paper>

          {/* Full JSON */}
          <Paper variant="outlined" className="p-4">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
              Full Decoded JSON
            </Typography>
            <pre className="m-0 text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-80">
              {JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)}
            </pre>
          </Paper>
        </div>
      )}

      {!decoded && !input && (
        <Paper variant="outlined" className="p-8 text-center">
          <Typography color="text.secondary">
            Paste a JWT above to inspect its header, payload, algorithm, timestamps, and structure.
          </Typography>
        </Paper>
      )}
    </div>
  );
}
