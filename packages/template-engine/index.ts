export interface Template { id: string; code: string; name: string; definition_json: any; }
export function renderTemplate(template: Template, context: Record<string, any>): any {
  return { ok: true, output: template.definition_json };
}
export default { renderTemplate };

