-- Migration pour nettoyer les données et adapter les structures pour rapport mensuel uniquement
-- Date: 2025-01-05
-- Cette migration nettoie les données monthlyKpis si présentes et adapte les structures

-- Nettoyer les données monthlyKpis dans la colonne kpis (JSONB)
-- Les données monthlyKpis ne sont plus nécessaires avec le rapport mensuel uniquement
UPDATE public.rapports_gbp
SET kpis = kpis - 'monthly'
WHERE kpis ? 'monthly';

-- Vérifier que la colonne mois contient bien un seul mois (pas de format "Juin-Octobre")
-- Mettre à jour les formats incorrects si nécessaire
UPDATE public.rapports_gbp
SET mois = SPLIT_PART(mois, '-', 1)
WHERE mois LIKE '%-%';

-- Commentaire pour documenter
COMMENT ON COLUMN public.rapports_gbp.mois IS 
'Mois du rapport (ex: "Octobre") - comparaison avec le même mois de l\'année précédente';

