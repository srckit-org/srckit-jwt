import { useState } from 'react';
import {
  TextField,
  Paper,
  Typography,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { verifyJWT, decodeJWT } from '../utils/jwtUtils';

export default function JWTVerify() {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await verifyJWT(token, secret);
      setResult(res);
    } catch (e: unknown) {
      setResult({ valid: false, error: (e as Error).message });
    } finally {
      setVerifying(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text.trim());
    } catch { /* ignore */ }
  };

  const decoded = decodeJWT(token);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
        JWT Verify
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        Verify a JWT signature against a secret key. Supports HMAC algorithms (HS256, HS384, HS512). Verification happens entirely in-browser.
      </Typography>

      <div className="space-y-4 mb-4">
        <TextField
          label="Encoded JWT"
          multiline
          minRows={4}
          maxRows={8}
          value={token}
          onChange={e => setToken(e.target.value.trim())}
          fullWidth
          variant="outlined"
          className="font-mono"
          slotProps={{ htmlInput: { className: 'font-mono text-sm' } }}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
        />
        <TextField
          label="Secret / Key"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          fullWidth
          variant="outlined"
          type="password"
          placeholder="your-256-bit-secret"
        />
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button
          variant="contained"
          color="primary"
          startIcon={<VerifiedUserIcon />}
          onClick={handleVerify}
          disabled={!token || !secret || verifying}
        >
          {verifying ? 'Verifying...' : 'Verify Signature'}
        </Button>
        <Button variant="outlined" startIcon={<ContentPasteIcon />} onClick={handlePaste}>
          Paste JWT
        </Button>
        <Button variant="text" onClick={() => { setToken(''); setSecret(''); setResult(null); }}>
          Clear
        </Button>
      </div>

      {result && (
        <Alert
          severity={result.valid ? 'success' : 'error'}
          className="mb-4"
          icon={result.valid ? <VerifiedUserIcon /> : undefined}
        >
          {result.valid
            ? '✓ Signature verified — token is valid'
            : `✗ ${result.error}`}
        </Alert>
      )}

      {decoded && (
        <Paper variant="outlined" className="p-4">
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            Token Info
          </Typography>
          <div className="flex flex-wrap gap-2 mb-3">
            <Chip label={`alg: ${decoded.header.alg ?? 'none'}`} size="small" variant="outlined" />
            <Chip label={`typ: ${decoded.header.typ ?? 'JWT'}`} size="small" variant="outlined" />
            {decoded.payload.iss && (
              <Chip label={`iss: ${decoded.payload.iss}`} size="small" variant="outlined" />
            )}
            {decoded.payload.sub && (
              <Chip label={`sub: ${decoded.payload.sub}`} size="small" variant="outlined" />
            )}
          </div>
          <pre className="m-0 text-xs font-mono bg-gray-100 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)}
          </pre>
        </Paper>
      )}

      {!result && !decoded && (
        <Paper variant="outlined" className="p-8 text-center">
          <Typography color="text.secondary">
            Paste a JWT and enter the secret key, then click <strong>Verify Signature</strong>.
          </Typography>
        </Paper>
      )}
    </div>
  );
}
