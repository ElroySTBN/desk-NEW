-- Migration pour documenter le nouveau format simplifié de template_config
-- Date: 2025-01-05
-- 
-- Le nouveau format simplifié de template_config:
-- {
--   "pages": ["url1", "url2", ...],  // URLs des images de template (une par page)
--   "variables": {
--     "client.name": { "page": 1, "x": 100, "y": 50, "width": 200, "height": 30, "type": "text", "fontSize": 24, "color": "#000000", "align": "left" },
--     "client.logo_url": { "page": 1, "x": 10, "y": 10, "width": 50, "height": 50, "type": "image" },
--     ...
--   },
--   "screenshot_placements": {
--     "vue_ensemble": { "page": 2, "x": 0, "y": 200, "width": 500, "height": 300 },
--     ...
--   },
--   "text_templates": {
--     "vue_ensemble": {
--       "positive": "Texte si évolution > 10%",
--       "positive_moderate": "Texte si évolution 0-10%",
--       "stable": "Texte si évolution -10% à 10%",
--       "negative_moderate": "Texte si évolution -10% à 0%",
--       "negative": "Texte si évolution < -10%"
--     },
--     ...
--   },
--   "ocr_zones": {
--     "vue_ensemble": {
--       "current": { "x": 100, "y": 50, "width": 100, "height": 30 },
--       "previous": { "x": 250, "y": 50, "width": 100, "height": 30 }
--     },
--     ...
--   }
-- }
--
-- Note: Cette migration ne modifie pas la structure de la table,
-- mais documente le nouveau format. La colonne template_config (JSONB)
-- est déjà suffisamment flexible pour supporter ce format.

-- Aucune modification de schéma nécessaire
-- Le format JSONB permet de stocker n'importe quelle structure JSON
-- Les anciennes données continueront de fonctionner grâce à la migration automatique dans le code

-- Commentaire pour documentation
COMMENT ON COLUMN public.gbp_report_templates.template_config IS 
'Configuration du template au format simplifié: {
  pages: string[] (URLs des images de template, une par page),
  variables: Record<string, { page, x, y, width, height, type, fontSize?, color?, align? }>,
  screenshot_placements: Record<string, { page, x, y, width, height }>,
  text_templates: Record<string, { positive?, positive_moderate?, stable?, negative_moderate?, negative? }>,
  ocr_zones: Record<string, { current: { x, y, width, height }, previous: { x, y, width, height } }>
}';

