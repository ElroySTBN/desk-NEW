-- Migration pour simplifier la table rapports_gbp pour ne garder que les rapports mensuels
-- Date: 2025-01-05
-- Cette migration modifie la contrainte type pour ne permettre que 'mensuel'

-- Modifier la contrainte CHECK pour ne permettre que 'mensuel'
ALTER TABLE public.rapports_gbp
DROP CONSTRAINT IF EXISTS rapports_gbp_type_check;

ALTER TABLE public.rapports_gbp
ADD CONSTRAINT rapports_gbp_type_check 
CHECK (type = 'mensuel');

-- Mettre à jour les rapports existants de type '5_mois' ou 'complet' vers 'mensuel'
UPDATE public.rapports_gbp
SET type = 'mensuel'
WHERE type IN ('5_mois', 'complet');

-- Commentaire pour documenter le changement
COMMENT ON COLUMN public.rapports_gbp.type IS 
'Type de rapport - uniquement mensuel (comparaison N vs N-1 année pour le même mois)';

