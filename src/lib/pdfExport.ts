import jsPDF from "jspdf";
import type { Onboarding } from "@/types/onboarding";

export async function generateOnboardingPDF(onboarding: Onboarding) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let y = margin;

  // Helper functions
  const addTitle = (text: string) => {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += lineHeight * 2;
  };

  const addSection = (title: string) => {
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text(title, margin, y);
    y += lineHeight * 1.5;
    doc.setTextColor(0, 0, 0);
  };

  const addSubsection = (title: string) => {
    checkPageBreak(10);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += lineHeight;
  };

  const addText = (label: string, value: string | number | boolean, prefilled = false) => {
    checkPageBreak(10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    if (prefilled) {
      doc.setTextColor(217, 119, 6); // Amber color for prefilled
    }
    
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    
    const text = String(value || "N/A");
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - 50);
    doc.text(lines, margin + 50, y);
    
    if (prefilled) {
      doc.setTextColor(0, 0, 0);
    }
    
    y += lineHeight * lines.length;
  };

  const addList = (label: string, items: string[]) => {
    checkPageBreak(10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    y += lineHeight;
    
    doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      checkPageBreak(10);
      doc.text(`• ${item}`, margin + 5, y);
      y += lineHeight;
    });
  };

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RaiseMed.IA", margin, 20);
  doc.setFontSize(12);
  doc.text("Formulaire d'Onboarding Client", pageWidth - margin - 70, 20);
  
  y = 40;
  doc.setTextColor(0, 0, 0);

  // Client info
  addTitle(`Onboarding - ${onboarding.client_name}`);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date de création: ${new Date(onboarding.created_at).toLocaleDateString("fr-FR")}`, margin, y);
  y += lineHeight;
  doc.text(`Créé par: ${onboarding.created_by}`, margin, y);
  y += lineHeight * 2;

  // Section 1: Informations légales
  addSection("1. Informations légales");
  if (onboarding.legal_info) {
    const li = onboarding.legal_info;
    addText("Raison sociale", li.raison_sociale?.value, li.raison_sociale?.prefilled);
    addText("Nom commercial", li.nom_commercial?.value, li.nom_commercial?.prefilled);
    addText("SIRET", li.siret?.value, li.siret?.prefilled);
    
    if (li.adresse) {
      addSubsection("Adresse");
      addText("Rue", li.adresse.rue?.value, li.adresse.rue?.prefilled);
      addText("Code postal", li.adresse.code_postal?.value, li.adresse.code_postal?.prefilled);
      addText("Ville", li.adresse.ville?.value, li.adresse.ville?.prefilled);
    }
    
    if (li.contact_principal) {
      addSubsection("Contact principal");
      addText("Nom", li.contact_principal.nom?.value, li.contact_principal.nom?.prefilled);
      addText("Fonction", li.contact_principal.fonction);
      addText("Téléphone", li.contact_principal.telephone?.value, li.contact_principal.telephone?.prefilled);
      addText("Email", li.contact_principal.email?.value, li.contact_principal.email?.prefilled);
    }
  }

  // Section 2: Identité de marque
  addSection("2. Identité de marque");
  if (onboarding.brand_identity) {
    const bi = onboarding.brand_identity;
    addText("Description du métier", bi.metier_description);
    if (bi.services && Array.isArray(bi.services) && bi.services.length > 0) {
      addList("Services", bi.services);
    }
    if (bi.points_forts && Array.isArray(bi.points_forts) && bi.points_forts.length > 0) {
      addList("Points forts", bi.points_forts);
    }
    if (bi.certifications && Array.isArray(bi.certifications) && bi.certifications.length > 0) {
      addList("Certifications", bi.certifications);
    }
    if (bi.garanties) {
      addSubsection("Garanties");
      addText("Garantie pièces", `${bi.garanties.pieces_ans} an(s)`);
      addText("Garantie main d'œuvre", `${bi.garanties.main_oeuvre_ans} an(s)`);
      addText("Description SAV", bi.garanties.sav_description);
    }
  }

  // Section 3: Clientèle cible
  addSection("3. Clientèle cible");
  if (onboarding.target_audience) {
    const ta = onboarding.target_audience;
    if (ta.types_clients) {
      addSubsection("Types de clients");
      Object.entries(ta.types_clients).forEach(([key, value]: [string, any]) => {
        if (value.checked) {
          addText(key.charAt(0).toUpperCase() + key.slice(1), `${value.pourcentage_ca}% du CA`);
        }
      });
    }
    
    if (ta.persona) {
      addSubsection("Persona client type");
      addText("Âge moyen", ta.persona.age_moyen);
      addText("Situation", ta.persona.situation);
      addText("Budget moyen", ta.persona.budget_moyen);
      addText("Motivations", ta.persona.motivations);
    }
  }

  // Section 4: Communication
  addSection("4. Tonalité & Communication");
  if (onboarding.communication) {
    const com = onboarding.communication;
    if (com.perception_souhaitee && Array.isArray(com.perception_souhaitee) && com.perception_souhaitee.length > 0) {
      addList("Perception souhaitée", com.perception_souhaitee);
    }
    addText("Ton des réponses aux avis", com.ton_reponses_avis);
    if (com.valeurs && Array.isArray(com.valeurs) && com.valeurs.length > 0) {
      addList("Valeurs", com.valeurs);
    }
  }

  // Section 5: Historique
  addSection("5. Historique & Expérience");
  if (onboarding.history) {
    const hist = onboarding.history;
    addText("Année de création", hist.annee_creation);
    addText("Nombre d'interventions", hist.nb_interventions);
    
    if (hist.equipe) {
      addSubsection("Équipe");
      addText("Techniciens", hist.equipe.nb_techniciens);
      addText("Commerciaux", hist.equipe.nb_commerciaux);
      addText("Total employés", hist.equipe.total_employes);
    }
    
    addText("Base de clients satisfaits", hist.clients_satisfaits_base ? "Oui" : "Non");
    if (hist.clients_satisfaits_base) {
      addText("Clients sollicitables", hist.nb_clients_sollicitables);
    }
  }

  // Section 6: Google Business
  addSection("6. Google Business Profile");
  if (onboarding.google_business) {
    const gb = onboarding.google_business;
    addText("Nom de l'établissement", gb.nom_etablissement?.value, gb.nom_etablissement?.prefilled);
    addText("Catégorie principale", gb.categorie_principale);
    addText("Téléphone public", gb.telephone_public?.value, gb.telephone_public?.prefilled);
    addText("Email public", gb.email_public?.value, gb.email_public?.prefilled);
    addText("Site web", gb.site_web?.value, gb.site_web?.prefilled);
    addText("Description courte", gb.description_courte);
    
    if (gb.horaires) {
      addSubsection("Horaires");
      Object.entries(gb.horaires).forEach(([jour, info]: [string, any]) => {
        if (info.ouvert) {
          addText(jour.charAt(0).toUpperCase() + jour.slice(1), info.horaires || "Non spécifié");
        }
      });
    }
  }

  // Section 7: Visuels
  addSection("7. Visuels & Photos");
  if (onboarding.visuals) {
    const vis = onboarding.visuals;
    if (vis.photos_disponibles && Array.isArray(vis.photos_disponibles) && vis.photos_disponibles.length > 0) {
      addList("Photos disponibles", vis.photos_disponibles);
    }
    addText("Méthode d'envoi", vis.methode_envoi);
    addText("Date limite", vis.deadline);
    if (vis.uploaded_files && vis.uploaded_files.length > 0) {
      addText("Fichiers téléversés", `${vis.uploaded_files.length} fichier(s)`);
    }
  }

  // Section 8: NFC & Équipe
  addSection("8. Cartes NFC & Équipe");
  if (onboarding.nfc_team) {
    const nfc = onboarding.nfc_team;
    addText("Nombre de techniciens", nfc.nb_techniciens);
    addText("Date de formation", nfc.formation_date);
    addText("Format de formation", nfc.formation_format);
    
    if (nfc.techniciens && nfc.techniciens.length > 0) {
      addSubsection("Techniciens");
      nfc.techniciens.forEach((tech: any, index: number) => {
        addText(`Technicien ${index + 1}`, `${tech.prenom} ${tech.nom} - ${tech.cartes_attribuees} carte(s)`);
      });
    }
  }

  // Section 9: Suivi
  addSection("9. Communication & Suivi");
  if (onboarding.follow_up) {
    const fu = onboarding.follow_up;
    addText("Fréquence des rapports", fu.frequence_rapports);
    addText("Canal de communication", fu.canal_communication);
    
    if (fu.personne_referente) {
      addSubsection("Personne référente");
      addText("Nom", fu.personne_referente.nom);
      addText("Disponibilités", fu.personne_referente.disponibilites);
    }
    
    if (fu.compte_google_existant) {
      addText("Compte Google existant", fu.compte_google_existant.existe ? "Oui" : "Non");
      if (fu.compte_google_existant.existe) {
        addText("Email du compte", fu.compte_google_existant.email);
      }
    }
  }

  // Section 10: Validation
  addSection("10. Validation finale");
  if (onboarding.validation) {
    const val = onboarding.validation;
    addText("Questions/préoccupations", val.questions_preoccupations);
    
    if (val.accords) {
      addSubsection("Accords");
      addText("Gestion GBP", val.accords.gestion_gbp ? "✓ Accepté" : "✗ Non accepté");
      addText("Photos sous 5 jours", val.accords.photos_5_jours ? "✓ Accepté" : "✗ Non accepté");
      addText("Validation description", val.accords.validation_description ? "✓ Accepté" : "✗ Non accepté");
    }
    
    addText("Date de rendez-vous", val.date_rendez_vous);
    addText("Prochain point", val.prochain_point);
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `RaiseMed.IA - Onboarding Client - Page ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save PDF
  doc.save(`Onboarding_${onboarding.client_name}_${new Date().toISOString().split("T")[0]}.pdf`);
}

