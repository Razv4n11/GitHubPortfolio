const portfolioEl = document.getElementById("portfolio");
const statusEl = document.getElementById("status");
const searchInput = document.querySelector(".search-input");
const languageFiltersEl = document.getElementById("languageFilters");

const fallbackProjects = [
    {
        name: "interactive-landing",
        description: "Landing page cu animatii custom si layout modular.",
        language: "HTML",
        stargazers_count: 12,
        forks_count: 2,
        html_url: "https://github.com/example/interactive-landing",
        updated_at: "2026-04-10T10:12:00Z",
        fork: false
    },
    {
        name: "design-system",
        description: "Component library cu documentatie si tokens de design.",
        language: "CSS",
        stargazers_count: 8,
        forks_count: 1,
        html_url: "https://github.com/example/design-system",
        updated_at: "2026-03-03T09:00:00Z",
        fork: false
    },
    {
        name: "moodboard-api",
        description: "Aplicatie care combina date API cu galerii vizuale.",
        language: "JavaScript",
        stargazers_count: 5,
        forks_count: 0,
        html_url: "https://github.com/example/moodboard-api",
        updated_at: "2026-02-18T08:30:00Z",
        fork: false
    },
    {
        name: "php-proxy",
        description: "Proxy simplu pentru request-uri securizate catre API-uri.",
        language: "PHP",
        stargazers_count: 3,
        forks_count: 0,
        html_url: "https://github.com/example/php-proxy",
        updated_at: "2026-01-24T12:00:00Z",
        fork: false
    },
    {
        name: "portfolio-2026",
        description: "Portofoliu personal cu sectiuni dinamice.",
        language: "JavaScript",
        stargazers_count: 6,
        forks_count: 1,
        html_url: "https://github.com/example/portfolio-2026",
        updated_at: "2026-05-01T13:20:00Z",
        fork: false
    }
];

let allProjects = [];
let activeLanguage = "All";
let renderVersion = 0;

const githubApiHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
};

function formatDate(value) {
    return new Date(value).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function createCard(project) {
    const card = document.createElement("article");
    card.className = "project-card is-new";
    card.innerHTML = `
		<div class="project-title">${project.name}</div>
		<div class="project-desc">${project.description || "Fara descriere disponibila"}</div>
		<div class="meta-row">
			<span class="meta-pill">${project.language || "N/A"}</span>
			<span class="meta-pill">★ ${project.stargazers_count}</span>
			<span class="meta-pill">Forks ${project.forks_count}</span>
			<span class="meta-pill">Actualizat ${formatDate(project.updated_at)}</span>
		</div>
		<a class="project-link" href="${project.html_url}" target="_blank" rel="noopener">Vezi pe GitHub</a>
	`;
    return card;
}

function renderFilters(projects) {
    const languages = Array.from(new Set(projects.map((project) => project.language).filter(Boolean)));
    languageFiltersEl.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn active";
    allBtn.textContent = "All";
    allBtn.dataset.language = "All";
    languageFiltersEl.appendChild(allBtn);

    languages.forEach((language) => {
        const btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.textContent = language;
        btn.dataset.language = language;
        languageFiltersEl.appendChild(btn);
    });
}

function renderProjectList(projects) {
    renderVersion += 1;
    const currentRender = renderVersion;
    const currentCards = Array.from(portfolioEl.querySelectorAll(".project-card"));

    currentCards.forEach((card) => {
        card.classList.add("is-animated-out");
    });

    const nextCards = projects.map((project, index) => {
        const card = createCard(project);
        card.style.animationDelay = `${index * 50}ms`;
        return card;
    });

    let delay = 50 * currentCards.length + 280;

    window.setTimeout(() => {
        if (currentRender !== renderVersion) {
            return;
        }

        portfolioEl.innerHTML = "";

        if (nextCards.length === 0) {
            portfolioEl.innerHTML = "<div class=\"status\">Nu exista rezultate pentru filtrarea curenta.</div>";
            return;
        }

        nextCards.forEach((card) => portfolioEl.appendChild(card));
    }, delay);
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = allProjects.filter((project) => {
        const matchesSearch = `${project.name} ${project.description || ""}`.toLowerCase().includes(searchTerm);
        const matchesLanguage = activeLanguage === "All" || project.language === activeLanguage;
        return matchesSearch && matchesLanguage;
    });

    renderProjectList(filtered);
}

function wireFilters() {
    languageFiltersEl.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        activeLanguage = button.dataset.language || "All";
        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        applyFilters();
    });

    searchInput.addEventListener("input", applyFilters);
}

function hydrateProjects(projects) {
    const sorted = projects
        .filter((project) => !project.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    allProjects = sorted;
    renderFilters(sorted);
    wireFilters();
    applyFilters();
}

async function loadProjects() {
    const username = document.querySelector(".page").dataset.username;
    try {
        statusEl.textContent = "Se incarca proiectele...";
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`, {
            headers: githubApiHeaders
        });
        if (!response.ok) {
            throw new Error("API error");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid data");
        }
        hydrateProjects(data);
        statusEl.textContent = "Proiectele au fost incarcate cu succes.";
    } catch (error) {
        statusEl.textContent = "Ups! Nu am putut incarca proiectele momentan.";
        portfolioEl.innerHTML = "";
        fallbackProjects.forEach((project) => portfolioEl.appendChild(createCard(project)));
    }
}

loadProjects();