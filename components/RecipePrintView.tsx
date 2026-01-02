import React from "react";
import { Utensils, ChefHat } from "lucide-react";

const RecipePrintView = ({ recipe }: any) => {
  if (!recipe) return null;

  const colors = {
    orange: "#f97316",
    neutral900: "#171717",
    neutral600: "#525252",
    neutral100: "#f5f5f5",
    accent: "#fff7ed",
  };

  const stepCount = recipe.steps?.length || 0;

  // Tailles en pixels pour la stabilité du PDF (Ratio A5)
  const stepFontSize = "12px";
  const stepGap = "12px";
  // Fixer la hauteur de l'image pour éviter l'étirement
  const imageHeight = "180px";

  return (
    <div
      className="pdf-page-container"
      style={{
        width: "559px", // Largeur A5 fixe
        height: "794px", // Hauteur A5 fixe
        padding: "40px",
        backgroundColor: "#ffffff",
        color: colors.neutral900,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          marginBottom: "20px",
          width: "100%",
          display: "flex",
          alignItems: "center", // Centre verticalement l'image et le texte
          gap: "24px",
        }}
      >
        {/* Conteneur d'image fixe (40% de la largeur) */}
        <div
          style={{
            width: "200px", // Largeur fixe pour stabiliser le PDF
            height: imageHeight,
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: colors.neutral100,
            flexShrink: 0, // Empêche l'image de s'écraser
          }}
        >
          <img
            src={recipe.image_url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            alt=""
          />
        </div>

        {/* Contenu texte (60% de la largeur) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: colors.orange,
                fontWeight: "800",
                display: "block",
                marginBottom: "4px",
              }}
            >
              {recipe.category_name || "Recette Maison"}
            </span>
            <h1
              style={{
                fontSize: "20px", // Un peu plus petit pour tenir sur plusieurs lignes si besoin
                fontWeight: "900",
                margin: 0,
                lineHeight: "1.2",
                letterSpacing: "-0.5px",
                color: colors.neutral900,
              }}
            >
              {recipe.title}
            </h1>
          </div>

          {/* Badges Temps & Pers */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: colors.neutral100,
              padding: "8px 12px",
              borderRadius: "12px",
              width: "fit-content", // Ne prend que la place nécessaire
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                {recipe.prep_time}m
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: colors.neutral600,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Préparation
              </div>
            </div>

            <div
              style={{
                width: "1px",
                height: "20px",
                backgroundColor: "#d4d4d4",
              }}
            />

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                {recipe.cook_time}m
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: colors.neutral600,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Cuisson
              </div>
            </div>

            <div
              style={{
                width: "1px",
                height: "20px",
                backgroundColor: "#d4d4d4",
              }}
            />

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                {recipe.servings || 4}
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: colors.neutral600,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                Pers.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div style={{ display: "flex", gap: "30px", flex: 1, minHeight: 0 }}>
        {/* Ingrédients */}
        <div style={{ width: "160px", flexShrink: 0 }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Utensils size={12} strokeWidth={3} /> Ingrédients
          </h2>
          <div
            style={{
              backgroundColor: colors.accent,
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #ffedd5",
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recipe.ingredients?.map((ing: any, i: number) => (
                <li
                  key={i}
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.4",
                    padding: "6px 0",
                    borderBottom:
                      i === recipe.ingredients.length - 1
                        ? "none"
                        : "1px solid #fed7aa",
                    color: colors.neutral600,
                  }}
                >
                  • {ing}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Préparation */}
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ChefHat size={12} strokeWidth={3} /> Préparation
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: stepGap }}
          >
            {recipe.steps?.map((step: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: "12px" }}>
                <span
                  style={{
                    fontSize: stepFontSize,
                    fontWeight: "900",
                    color: colors.orange,
                    minWidth: "20px",
                  }}
                >
                  {i + 1}.
                </span>
                <p
                  style={{
                    fontSize: stepFontSize,
                    margin: 0,
                    lineHeight: "1.5",
                    color: colors.neutral600,
                  }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePrintView;
