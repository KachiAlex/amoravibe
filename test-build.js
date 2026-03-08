import { buildUploadSignature } from './apps/web/src/lib/cloudinary';

(async () => {
  try {
    const sig = buildUploadSignature({ folder: 'avatars' });
    console.log('Signature object:', sig);
  } catch (e) {
    console.error('Error building signature:', e);
  }
})();
