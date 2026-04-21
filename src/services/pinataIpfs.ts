type PinataMetadata = {
  name?: string;
  keyvalues?: Record<string, string>;
};

type PinataResponse = {
  IpfsHash?: string;
  error?: {
    reason?: string;
    details?: string;
  };
};

function buildPinataHeaders(): HeadersInit {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (jwt) {
    return {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    };
  }

  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const apiSecret = import.meta.env.VITE_PINATA_API_SECRET;

  if (apiKey && apiSecret) {
    return {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
      'Content-Type': 'application/json',
    };
  }

  throw new Error(
    'Pinata credentials missing. Set VITE_PINATA_JWT or VITE_PINATA_API_KEY + VITE_PINATA_API_SECRET in .env.local.'
  );
}

export async function pinJsonToIpfs(content: unknown, metadata?: PinataMetadata): Promise<string> {
  const endpoint = import.meta.env.VITE_PINATA_API_URL || 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: buildPinataHeaders(),
    body: JSON.stringify({
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: metadata?.name || 'project-geometry',
        keyvalues: metadata?.keyvalues || {},
      },
      pinataContent: content,
    }),
  });

  const raw = (await response.json().catch(() => ({}))) as PinataResponse;

  if (!response.ok) {
    const reason = raw.error?.reason || raw.error?.details || `Pinata request failed (${response.status}).`;
    throw new Error(reason);
  }

  if (!raw.IpfsHash) {
    throw new Error('Pinata response did not include an IpfsHash.');
  }

  return raw.IpfsHash;
}
