// User Management
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// LocalStorage data structure initialization
const users = JSON.parse(localStorage.getItem('users') || '[]');
const posts = JSON.parse(localStorage.getItem('posts') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    // Auth forms toggle
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Registration handler
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target[0].value.trim();
        const password = e.target[1].value.trim();

        if (users.some(user => user.username === username)) {
            alert('Username already exists');
            return;
        }

        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please login.');
        e.target.reset();
    });

    // Login handler
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target[0].value.trim();
        const password = e.target[1].value.trim();

        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            alert('Invalid credentials');
            return;
        }

        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('auth-forms').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        displayPosts();
        e.target.reset();
    });

    // Logout handler
    document.getElementById('logout').addEventListener('click', () => {
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        location.reload();
    });

    // Post submission handler
    document.getElementById('post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const imageUrl = e.target[0].value.trim();
        const description = e.target[1].value.trim();

        if (!imageUrl) {
            alert('Please enter an image URL');
            return;
        }

        const newPost = {
            id: Date.now(),
            author: currentUser.username,
            image: imageUrl,
            description,
            likes: [],
            comments: [],
            timestamp: new Date().toISOString()
        };

        posts.unshift(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        displayPosts();
        e.target.reset();
    });

    // Initial UI state
    if (currentUser) {
        document.getElementById('auth-forms').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        displayPosts();
    }
});

function displayPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
            <div class="post-header">
                <h3>${post.author}</h3>
                <small>${new Date(post.timestamp).toLocaleString()}</small>
            </div>
            <img src="${post.image}" alt="${post.description}">
            <p>${post.description}</p>
            <div class="actions">
                <button class="like-btn" data-id="${post.id}">
                    ${post.likes.length} ❤️
                </button>
            </div>
            <div class="comments">
                ${post.comments.map(c => `
                    <div class="comment">
                        <strong>${c.author}:</strong> ${c.text}
                    </div>
                `).join('')}
                <form class="comment-form" data-id="${post.id}">
                    <input type="text" placeholder="Add a comment" required>
                    <button type="submit">Post</button>
                </form>
            </div>
        `;

        // Like button handler
        postEl.querySelector('.like-btn').addEventListener('click', () => {
            if (!currentUser) {
                alert('Please login to like posts');
                return;
            }

            const index = post.likes.indexOf(currentUser.username);
            if (index === -1) {
                post.likes.push(currentUser.username);
            } else {
                post.likes.splice(index, 1);
            }

            localStorage.setItem('posts', JSON.stringify(posts));
            displayPosts();
        });

        // Comment form handler
        postEl.querySelector('.comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Please login to comment');
                return;
            }

            const commentText = e.target[0].value.trim();
            if (!commentText) return;

            post.comments.push({
                author: currentUser.username,
                text: commentText,
                timestamp: new Date().toISOString()
            });

            localStorage.setItem('posts', JSON.stringify(posts));
            displayPosts();
            e.target.reset();
        });

        postsContainer.appendChild(postEl);
    });
}