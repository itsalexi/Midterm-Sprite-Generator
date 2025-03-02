export function convertJavaToJS(javaArrayString) {
  console.log(
    javaArrayString.replace(/{/g, '[').replace(/}/g, ']').replace(/;/g, '')
  );
  return JSON.parse(
    javaArrayString.replace(/{/g, '[').replace(/}/g, ']').replace(/;/g, '')
  );
}

export function convertJSToJava(jsArray) {
  return (
    JSON.stringify(jsArray).replace(/\[/g, '{').replace(/\]/g, '}').trim() + ';'
  );
}
