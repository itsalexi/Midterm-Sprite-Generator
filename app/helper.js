export function convertJavaToJS(javaArrayString) {
  try {
    let str = javaArrayString.trim();
    str = str.replace(/\s+/g, '');

    str = str.replace(/^\{\{/, '[').replace(/\}\};?$/, ']');

    str = str.replace(/\},\{/g, '],[');

    str = str.replace(
      /new\s*Color\((\d+),(\d+),(\d+),(\d+)\)/g,
      '{"r":$1,"g":$2,"b":$3,"a":$4}'
    );
    str = str.replace(
      /new\s*Color\((\d+),(\d+),(\d+)\)/g,
      '{"r":$1,"g":$2,"b":$3,"a":255}'
    );

    return JSON.parse(`[${str}]`);
  } catch (error) {
    console.error('Error parsing Java code:', error);
    throw new Error('Invalid Java code format. Please check your input.');
  }
}

export function convertJSToJava(jsArray) {
  let javaString = JSON.stringify(jsArray)
    .replace(/\[/g, '{')
    .replace(/\]/g, '}');

  javaString = javaString.replace(
    /\{"r":(\d+),"g":(\d+),"b":(\d+),"a":(\d+)\}/g,
    (match, r, g, b, a) => {
      if (r === '0' && g === '0' && b === '0' && a === '0') {
        return 'new Color(0, 0, 0, 0)';
      } else if (a === '255') {
        return `new Color(${r}, ${g}, ${b})`;
      } else {
        return `new Color(${r}, ${g}, ${b}, ${a})`;
      }
    }
  );

  return javaString + ';';
}

export function migrateOldFormat(oldFormatString) {
  try {
    const rows = oldFormatString
      .replace(/\s+/g, '')
      .replace(/^\{|\}$/g, '')
      .split('},{');

    return rows.map((row) =>
      row
        .split(',')
        .map((pixel) =>
          pixel === '1'
            ? { r: 0, g: 0, b: 0, a: 255 }
            : { r: 0, g: 0, b: 0, a: 0 }
        )
    );
  } catch (error) {
    console.error('Error migrating old format:', error);
    throw new Error('Invalid old format. Please check your input.');
  }
}
