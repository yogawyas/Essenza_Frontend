import { launchImageLibrary } from 'react-native-image-picker';

export async function pickLibraryPhoto({
  size = 512,
  maxEncodedLength = 400000,
} = {}) {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    maxWidth: size,
    maxHeight: size,
    quality: 0.72,
    includeBase64: true,
    assetRepresentationMode: 'compatible',
  });
  if (result.didCancel) {
    return null;
  }
  const image = result.assets?.[0];
  if (!image?.base64 || !/^image\/(jpe?g|png|webp)$/i.test(image.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (image.base64.length > maxEncodedLength) {
    throw new Error('Choose a smaller photo.');
  }
  return 'data:' + image.type + ';base64,' + image.base64;
}
