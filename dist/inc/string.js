export const camelTextToTitleText = (keyName) => {
    const titleText = keyName.replace(/([A-Z])/g, " $1");
    return titleText.charAt(0).toUpperCase() + titleText.slice(1);
};
