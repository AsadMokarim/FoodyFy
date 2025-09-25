const form = document.querySelector("#ingredientForm"),
      input = document.querySelector(".input_ingr"),
      ingrList = document.querySelector(".ingr"),
      cookBtn = document.querySelector(".cook_now"),
      heading = document.querySelector(".ingredients_heading");

// Get elements for the carousel form (ingForm)
const carouselForm = document.querySelector('form[action="ingForm"]'),
      carouselInput = document.querySelector(".input_ing");

let count = 0;

const updateUI = () => {
  heading.textContent = `Your Ingredients (${count})`;
  heading.style.display = count ? "block" : "none";
  cookBtn.innerHTML = `<img src="images/chef.png" width="25px" alt="">Cook Now with ${count} ingredients`;
};
if (count == 0) cookBtn.style.backgroundColor = '#FFC5B4';

const createRemoveBtn = li => {
  const btn = document.createElement("span");
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="6"  y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  btn.classList.add('remove-btn');
  li.onmouseenter = () => btn.style.color = "red";
  li.onmouseleave = () => btn.style.color = "var(--tm-green)";
  li.onclick = () => { li.remove(); count--; updateUI(); if (count == 0) cookBtn.style.backgroundColor = '#FFC5B4'; };
  return btn;
};

const addIngredient = val => {
  if (!val) return;
  if ([...ingrList.querySelectorAll("li span")].some(s => s.textContent === val)) return;
  const li = document.createElement("li"),
        span = document.createElement("span");
  span.textContent = val;
  li.append(span, createRemoveBtn(li));
  ingrList.appendChild(li);
  count++; 
  updateUI();
  cookBtn.style.backgroundColor = 'var(--tm-red)'; 
  cookBtn.onmouseenter = () => cookBtn.style.backgroundColor = "#FFC5B4"; 
  cookBtn.onmouseleave = () => cookBtn.style.backgroundColor = "var(--tm-red)";
  
  // Scroll to the kitchen section to show added ingredients
  document.querySelector('#ktn').scrollIntoView({ behavior: 'smooth' });
  
  // Focus on the main ingredient input after scrolling
  setTimeout(() => {
    if (input) {
      input.focus();
    }
  }, 800); // Delay to allow smooth scroll to complete
};

// Parse multiple ingredients from a string (comma or space separated)
const parseIngredients = (inputString) => {
  return inputString
    .split(/[,\s]+/) // Split by comma or whitespace
    .map(ingredient => ingredient.trim())
    .filter(ingredient => ingredient.length > 0);
};

// Main ingredient form submit
form.onsubmit = e => { 
  e.preventDefault(); 
  const ingredients = parseIngredients(input.value);
  ingredients.forEach(ingredient => addIngredient(ingredient));
  input.value = ""; 
};

// Carousel form submit (ingForm)
if (carouselForm && carouselInput) {
  carouselForm.onsubmit = e => { 
    e.preventDefault(); 
    const ingredients = parseIngredients(carouselInput.value);
    ingredients.forEach(ingredient => addIngredient(ingredient));
    carouselInput.value = ""; 
  };

  // Comma key for carousel input
  carouselInput.onkeydown = e => {
    if (e.key === ",") { 
      e.preventDefault(); 
      const ingredients = parseIngredients(carouselInput.value.replace(",", ""));
      ingredients.forEach(ingredient => addIngredient(ingredient));
      carouselInput.value = ""; 
    }
  };
}

// Main form comma key
input.onkeydown = e => {
  if (e.key === ",") { 
    e.preventDefault(); 
    const ingredients = parseIngredients(input.value.replace(",", ""));
    ingredients.forEach(ingredient => addIngredient(ingredient));
    input.value = ""; 
  }
};

// Popular items click
document.querySelectorAll(".popular-item").forEach(item =>
  item.onclick = () => {
    let text = item.textContent.trim();
    if (text.startsWith("+")) text = text.slice(1).trim();
    addIngredient(text);
  }
);

// ================= API ===================

const recipesSection = document.querySelector(".recipes_avl");
const apiKey = "a7766a5d5e744e72a6260be5dd0e4bbf"; // your Spoonacular key
// const apiKey = "75c1def06a944f27a14bb5040a508151"; // your Spoonacular key


const fetchRecipes = () => {
  const ingredients = [...document.querySelectorAll(".ingr li span")]
                        .map(span => span.textContent)
                        .join(",");

  if (!ingredients) {
      alert("Please add at least one ingredient!");
      return;
  }

  // Show loading state
  recipesSection.innerHTML = "<p style='text-align: center; padding: 50px; font-size: 1.2rem; color: var(--tm-grey);'>Loading delicious recipes...</p>";

  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=6&apiKey=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      recipesSection.innerHTML = "";

      if (data.length === 0) {
        recipesSection.innerHTML = "<p style='text-align: center; padding: 50px; font-size: 1.2rem; color: var(--tm-grey);'>No recipes found with these ingredients. Try different combinations!</p>";
        return;
      }

      // Add a title for the results
      const resultsTitle = document.createElement("h2");
      resultsTitle.textContent = `Recipes with your ingredients (${data.length} found)`;
      resultsTitle.style.cssText = "grid-column: 1 / -1; text-align: center; color: var(--tm-blue); margin-bottom: 20px; font-size: 2.2rem;";
      recipesSection.appendChild(resultsTitle);

      data.forEach(recipe => {
        // fetch full info for rating + duration
        fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`)
          .then(res => res.json())
          .then(info => {
            const stars = Math.round((info.spoonacularScore / 100) * 5); // convert 0–100 to 0–5
            const ratingHtml = `
              <div class="rating">
                ${"⭐".repeat(stars)}${"☆".repeat(5 - stars)}
                <span>${(info.spoonacularScore/20).toFixed(1)}</span>
              </div>
            `;

            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe_card");
            recipeCard.innerHTML = `
              <div class="rcp_card_img">
                <img src="${recipe.image}" alt="${recipe.title}">
                ${ratingHtml}
              </div>
              <div class="card_content">
                <h4>${recipe.title}</h4>
                <div class="recipe-meta">
                  <div class="meta-item">
                    <svg class="meta-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>${info.readyInMinutes} min</span>
                  </div>
                </div>
                <a class="view-recipe-btn" href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">
                  View Recipe
                </a>
              </div>
            `;
            recipesSection.appendChild(recipeCard);
          })
          .catch(err => {
            console.error("Error fetching recipe details:", err);
            // Create a simplified card without full details
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe_card");
            recipeCard.innerHTML = `
              <div class="rcp_card_img">
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="rating">
                  <span class="star">⭐</span>
                  <span>4.0</span>
                </div>
              </div>
              <div class="card_content">
                <h4>${recipe.title}</h4>
                <div class="recipe-meta">
                  <div class="meta-item">
                    <svg class="meta-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd"></path>
                    </svg>
                    <span>30 min</span>
                  </div>
                </div>
                <a class="view-recipe-btn" href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank">
                  View Recipe
                </a>
              </div>
            `;
            recipesSection.appendChild(recipeCard);
          });
      });

      // Scroll to recipes section
      recipesSection.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(err => {
      console.error("Error fetching recipes:", err);
      recipesSection.innerHTML = "<p style='text-align: center; padding: 50px; font-size: 1.2rem; color: var(--tm-red);'>Sorry, there was an error fetching recipes. Please try again later.</p>";
    });
};

// Cook Now button click
cookBtn.addEventListener("click", fetchRecipes);