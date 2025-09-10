const createMediaObject = (data = {}, typeKey, desktopPathKey, mobilePathKey, altKey) => ({
  desktop: {
    media_type: data[typeKey] ?? '',
    media_path: data[desktopPathKey] ?? '',
    media_alt: data[altKey] ?? '',
  },
  mobile: {
    media_type: data[typeKey] ?? '',
    media_path: data[mobilePathKey] ?? '',
    media_alt: data[altKey] ?? '',
  },
});

const createButtonObject = (data = {}, textKey, linkKey) => ({
  text: data[textKey] ?? 'View',
  link: data[linkKey] ?? '#',
});

const createSimpleMediaObject = (data = {}, typeKey, pathKey, altKey) => ({
  media_type: data[typeKey] ?? '',
  media_path: data[pathKey] ?? '',
  media_alt: data[altKey] ?? '',
});

module.exports = {
  createMediaObject,
  createButtonObject,
  createSimpleMediaObject,
};
