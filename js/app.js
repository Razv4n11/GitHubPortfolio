const portfolioEl = document.getElementById("portfolio");
const statusEl = document.getElementById("status");
const searchInput = document.querySelector(".search-input");
const languageFiltersEl = document.getElementById("languageFilters");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileHandle = document.getElementById("profileHandle");
const profileRole = document.getElementById("profileRole");
const profileBio = document.getElementById("profileBio");
const profileLink = document.getElementById("profileLink");
const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const repoCount = document.getElementById("repoCount");
const locationValue = document.getElementById("locationValue");
const aboutText = document.getElementById("aboutText");

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
    card.className = "project-card";
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

function applyProfile(profile) {
    if (profile.avatar_url) {
        profileAvatar.src = profile.avatar_url;
    }
    const displayName = profile.name || profile.login;
    if (displayName) {
        profileName.textContent = displayName;
    }
    if (profile.login) {
        profileHandle.textContent = `@${profile.login}`;
    }
    if (profile.bio) {
        profileBio.textContent = profile.bio;
        aboutText.textContent = profile.bio;
    }
    if (profile.html_url) {
        profileLink.href = profile.html_url;
    }
    if (typeof profile.followers === "number") {
        followersCount.textContent = profile.followers;
    }
    if (typeof profile.following === "number") {
        followingCount.textContent = profile.following;
    }
    if (typeof profile.public_repos === "number") {
        repoCount.textContent = profile.public_repos;
    }
    locationValue.textContent = profile.location || "Nespecificata";
    if (profileRole && profileRole.textContent.trim() === "") {
        profileRole.textContent = "Developer";
    }
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

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    let filtered = allProjects.filter((project) => {
        const matchesSearch = `${project.name} ${project.description || ""}`.toLowerCase().includes(searchTerm);
        const matchesLanguage = activeLanguage === "All" || project.language === activeLanguage;
        return matchesSearch && matchesLanguage;
    });

    portfolioEl.innerHTML = "";
    filtered.forEach((project) => portfolioEl.appendChild(createCard(project)));
    if (filtered.length === 0) {
        portfolioEl.innerHTML = "<div class=\"status\">Nu exista rezultate pentru filtrarea curenta.</div>";
    }
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

    let finalList = sorted;
    if (sorted.length < 5) {
        statusEl.textContent = "Ai putine proiecte publice. Afisez si exemple locale.";
        const needed = 5 - sorted.length;
        finalList = [...sorted, ...fallbackProjects.slice(0, needed)];
    } else {
        statusEl.textContent = `Total proiecte incarcate: ${sorted.length}.`;
    }

    allProjects = finalList;
    renderFilters(finalList);
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
    } catch (error) {
        statusEl.textContent = "Ups! Nu am putut incarca proiectele momentan.";
        portfolioEl.innerHTML = "";
        fallbackProjects.forEach((project) => portfolioEl.appendChild(createCard(project)));
    }
}

async function loadProfile() {
    const username = document.querySelector(".page").dataset.username;
    try {
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
            headers: githubApiHeaders
        });
        if (!response.ok) {
            throw new Error("API error");
        }
        const data = await response.json();
        if (!data || typeof data !== "object") {
            throw new Error("Invalid data");
        }
        applyProfile(data);
    } catch (error) {
        statusEl.textContent = "Nu am putut incarca profilul. Verifica conexiunea sau incearca mai tarziu.";
    }
}

loadProfile();
loadProjects();