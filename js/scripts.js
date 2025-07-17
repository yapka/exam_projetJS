document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('carte').setView([5.347, -4.007], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  let allFeatures = null;
  let geoJsonLayer = null;
  let limitLayer = null;

  async function loadData() {
    try {
      const response = await fetch('/points_interets.geojson');
      const data = await response.json();

      // Limites éventuelles
      limitLayer = L.geoJSON(data, {
        style: {
          color: 'blue',
          weight: 2,
          fillOpacity: 0.1
        }
      }).addTo(map);

      // Sauvegarde des entités
      allFeatures = data.features;

      // Remplir le menu déroulant dynamiquement
      remplirMenuCategories(allFeatures);

      // Affichage initial
      afficherPoints("Tous");
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers GeoJSON :', error);
    }
  }

  function afficherPoints(categorie) {
    if (geoJsonLayer) {
      map.removeLayer(geoJsonLayer);
    }

    const filtered = (categorie === "Tous")
      ? allFeatures
      : allFeatures.filter(f => f.properties?.category === categorie);

    geoJsonLayer = L.geoJSON({
      type: "FeatureCollection",
      features: filtered,
    }, {
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const popupContent = `
          <div style="min-width: 200px">
            <h4>${props.name || 'Nom non disponible'}</h4>
            <p><strong>Catégorie :</strong> ${props.category || 'N/A'}</p>
            <p><strong>Description :</strong> ${props.description || 'N/A'}</p>
            <p><strong>État :</strong> ${props.etat || 'N/A'}</p>
            <p><strong>Prix :</strong> ${props.price || 'N/A'}</p>
          </div>
        `;
        layer.bindPopup(popupContent);
      },
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#f03",
          color: "#500",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      }
    }).addTo(map);
  }

  function remplirMenuCategories(features) {
    const select = document.getElementById('categorySelect');
    if (!select) return;

    // Récupération des catégories uniques
    const categories = [...new Set(features.map(f => f.properties?.category).filter(Boolean))];
    categories.sort();

    // Ajouter l'option "Tous"
    select.innerHTML = '<option value="Tous">Tous</option>';

    // Ajouter les autres catégories
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });

    // Gestion du changement
    select.addEventListener('change', function () {
      afficherPoints(this.value);
    });
  }

  loadData();
});
