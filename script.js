let randomInterval;
        let currentLetter = 'A';
        
        function addColumn() {
            const headerRow = document.getElementById('headerRow');
            const inputRow = document.getElementById('inputRow');
            
            const newHeader = document.createElement('th');
            newHeader.innerHTML = `
                <span class="column-header">Nouvelle catégorie</span>
                <span class="delete-column" onclick="deleteColumn(this)">×</span>
            `;
            newHeader.contentEditable = true;
            newHeader.draggable = true;
            newHeader.addEventListener('dragstart', handleDragStart);
            newHeader.addEventListener('dragover', handleDragOver);
            newHeader.addEventListener('drop', handleDrop);
            
            const newCell = document.createElement('td');
            newCell.contentEditable = true;
            newCell.addEventListener('click', toggleStrike);
            
            headerRow.insertBefore(newHeader, headerRow.lastElementChild);
            inputRow.insertBefore(newCell, inputRow.lastElementChild);
        }

            function deleteColumn(element) {
            const columnIndex = element.closest('th').cellIndex;
            const table = document.getElementById('gameTable');
            
            // Supprimer la colonne de chaque ligne
            for (let row of table.rows) {
                row.deleteCell(columnIndex);
            }
            updateScore(document.getElementById('inputRow'));
        }

        function toggleStrike(e) {
            if (e.target.tagName === 'TD' && e.target.cellIndex !== e.target.parentElement.cells.length - 1) {
                e.target.classList.toggle('struck');
                e.target.classList.toggle('invalid-word');
                updateScore(e.target.parentElement);
            }
        }

        function startLetterRandomizer() {
            document.getElementById('stopBtn').disabled = false;
            let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            let currentIndex = 0;
            
            // Effet de ralentissement progressif
            let interval = 50;
            let maxInterval = 500;
            let intervalIncrement = 10;
            
            randomInterval = setInterval(() => {
                currentLetter = letters[Math.floor(Math.random() * letters.length)];
                document.getElementById('letterDisplay').textContent = currentLetter;
                
                // Ralentir progressivement
                interval += intervalIncrement;
                if (interval >= maxInterval) {
                    stopRandomizer();
                } else {
                    clearInterval(randomInterval);
                    randomInterval = setInterval(() => {
                        currentLetter = letters[Math.floor(Math.random() * letters.length)];
                        document.getElementById('letterDisplay').textContent = currentLetter;
                    }, interval);
                }
            }, interval);
        }

        function stopRandomizer() {
            clearInterval(randomInterval);
            document.getElementById('stopBtn').disabled = true;
            // Animation de la lettre finale
            const letterDisplay = document.getElementById('letterDisplay');
            letterDisplay.style.transform = 'scale(1.2)';
            setTimeout(() => {
                letterDisplay.style.transform = 'scale(1)';
            }, 200);
        }

        function updateScore(row) {
            let score = 0;
            for (let cell of row.cells) {
                if (cell !== row.cells[row.cells.length - 1] && 
                    cell.textContent.trim() !== '' && 
                    !cell.classList.contains('struck')) {
                    score += 5;
                }
            }
            row.cells[row.cells.length - 1].textContent = score;
        }

        function showCategorySuggestions(event) {
            const suggestions = document.getElementById('categorySuggestions');
            const button = event.target;
            const buttonRect = button.getBoundingClientRect();
            
            suggestions.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
            suggestions.style.left = `${buttonRect.left + window.scrollX}px`;
            suggestions.style.display = suggestions.style.display === 'none' ? 'block' : 'none';
        }

        function addSuggestedCategory(category) {
            const headerRow = document.getElementById('headerRow');
            const inputRow = document.getElementById('inputRow');
            
            const newHeader = document.createElement('th');
            newHeader.innerHTML = `
                <span class="column-header">${category}</span>
                <span class="delete-column" onclick="deleteColumn(this)">×</span>
            `;
            newHeader.draggable = true;
            newHeader.addEventListener('dragstart', handleDragStart);
            newHeader.addEventListener('dragover', handleDragOver);
            newHeader.addEventListener('drop', handleDrop);
            
            const newCell = document.createElement('td');
            newCell.contentEditable = true;
            newCell.addEventListener('click', toggleStrike);
            
            headerRow.insertBefore(newHeader, headerRow.lastElementChild);
            inputRow.insertBefore(newCell, inputRow.lastElementChild);
            
            document.getElementById('categorySuggestions').style.display = 'none';
        }

        // Fonctionnalité Drag and Drop
        let draggedElement = null;
        let draggedIndex = null;

        function handleDragStart(e) {
            draggedElement = e.target;
            draggedIndex = Array.from(draggedElement.parentNode.children).indexOf(draggedElement);
            e.dataTransfer.effectAllowed = 'move';
            draggedElement.classList.add('dragging');
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const th = e.target.closest('th');
            if (th) {
                const targetIndex = Array.from(th.parentNode.children).indexOf(th);
                if (targetIndex !== draggedIndex) {
                    th.classList.add('drag-over');
                }
            }
        }

        function handleDragLeave(e) {
            e.target.closest('th')?.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.preventDefault();
            const th = e.target.closest('th');
            if (th && th !== draggedElement) {
                const targetIndex = Array.from(th.parentNode.children).indexOf(th);
                const table = document.getElementById('gameTable');
                
                // Déplacer les colonnes pour toutes les lignes
                for (let row of table.rows) {
                    const draggedCell = row.cells[draggedIndex];
                    const targetCell = row.cells[targetIndex];
                    
                    if (draggedIndex < targetIndex) {
                        targetCell.parentNode.insertBefore(draggedCell, targetCell.nextSibling);
                    } else {
                        targetCell.parentNode.insertBefore(draggedCell, targetCell);
                    }
                }
            }
            
            // Nettoyer les classes de style
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            draggedElement.classList.remove('dragging');
            draggedElement = null;
            draggedIndex = null;
        }

        // Gestionnaire d'événements pour le clic en dehors des suggestions
        document.addEventListener('click', function(e) {
            const suggestions = document.getElementById('categorySuggestions');
            const suggestionsButton = document.querySelector('button[onclick="showCategorySuggestions()"]');
            
            if (!suggestions.contains(e.target) && e.target !== suggestionsButton) {
                suggestions.style.display = 'none';
            }
        });

        // Empêcher l'édition du score
        document.addEventListener('keydown', function(e) {
            const target = e.target;
            if (target.tagName === 'TD' && target.cellIndex === target.parentElement.cells.length - 1) {
                e.preventDefault();
                return false;
            }
        });

        // Validation des entrées pour s'assurer qu'elles commencent par la bonne lettre
        document.addEventListener('input', function(e) {
            if (e.target.tagName === 'TD' && e.target.cellIndex !== e.target.parentElement.cells.length - 1) {
                const content = e.target.textContent.trim();
                if (content && content[0].toUpperCase() !== currentLetter) {
                    e.target.classList.add('invalid-entry');
                } else {
                    e.target.classList.remove('invalid-entry');
                }
            }
        });

        // Initialisation
        document.querySelectorAll('th').forEach(th => {
            th.addEventListener('dragstart', handleDragStart);
            th.addEventListener('dragover', handleDragOver);
            th.addEventListener('dragleave', handleDragLeave);
            th.addEventListener('drop', handleDrop);
        });

        // Ajout de styles dynamiques
        const style = document.createElement('style');
        style.textContent = `
            .invalid-entry {
                background-color: #ffe0e0;
                animation: shake 0.5s ease-in-out;
            }

            .dragging {
                opacity: 0.5;
                cursor: move;
            }

            .drag-over {
                border-left: 3px solid #6c5ce7;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .game-table td:focus {
                outline: none;
                box-shadow: inset 0 0 0 2px #6c5ce7;
                background-color: #f8f9fa;
            }

            .game-table th:focus {
                outline: none;
                background-color: #5b4dc2;
            }

            .invalid-word {
                position: relative;
            }

            .invalid-word::after {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                width: 100%;
                height: 2px;
                background-color: #e74c3c;
                transform-origin: center;
                animation: strikethrough 0.3s ease-out forwards;
            }

            @keyframes strikethrough {
                0% {
                    transform: scaleX(0);
                }
                100% {
                    transform: scaleX(1);
                }
            }

            .letter-display.animate {
                animation: letterPop 0.3s ease-out;
            }

            @keyframes letterPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .controls {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 10px;
                }

                .controls button {
                    flex: 1 1 calc(50% - 10px);
                    min-width: 150px;
                }

                .game-table {
                    display: block;
                    overflow-x: auto;
                    white-space: nowrap;
                }

                .letter-display {
                    font-size: 48px;
                    padding: 20px;
                }
            }

            /* Toast notification style */
            .toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #333;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
            }

            .toast.show {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Fonction pour afficher une notification
        function showToast(message, duration = 3000) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, duration);
        }

        // Fonction pour sauvegarder l'état du jeu localement
        function saveGameState() {
            const gameState = {
                categories: Array.from(document.querySelectorAll('th')).map(th => th.textContent.trim()),
                values: Array.from(document.querySelectorAll('td')).map(td => ({
                    content: td.textContent.trim(),
                    struck: td.classList.contains('struck')
                })),
                currentLetter: currentLetter
            };
            localStorage.setItem('baccalaureatGameState', JSON.stringify(gameState));
        }

        // Fonction pour charger l'état du jeu
        function loadGameState() {
            const savedState = localStorage.getItem('baccalaureatGameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                // Restaurer les catégories
                gameState.categories.forEach((category, index) => {
                    if (index > 0 && index < gameState.categories.length - 1) {
                        addSuggestedCategory(category);
                    }
                });
                
                // Restaurer les valeurs et les états struck
                const cells = document.querySelectorAll('td');
                gameState.values.forEach((value, index) => {
                    if (cells[index]) {
                        cells[index].textContent = value.content;
                        if (value.struck) {
                            cells[index].classList.add('struck');
                        }
                    }
                });
                
                currentLetter = gameState.currentLetter;
                document.getElementById('letterDisplay').textContent = currentLetter;
            }
        }

        // Sauvegarder automatiquement lorsque des modifications sont apportées
        document.getElementById('gameTable').addEventListener('input', saveGameState);
        document.getElementById('gameTable').addEventListener('click', saveGameState);

        // Charger l'état du jeu au démarrage
        window.addEventListener('load', loadGameState);

        // Fonction pour réinitialiser le jeu
        function resetGame() {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser le jeu ?')) {
                localStorage.removeItem('baccalaureatGameState');
                location.reload();
            }
        }

        // Ajouter un bouton de réinitialisation dans les contrôles
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Réinitialiser';
        resetButton.onclick = resetGame;
        document.querySelector('.controls').appendChild(resetButton);

        // Gérer les raccourcis clavier
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Z pour annuler le dernier strikethrough
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                const struckElements = document.querySelectorAll('.struck');
                if (struckElements.length > 0) {
                    struckElements[struckElements.length - 1].classList.remove('struck');
                    updateScore(document.getElementById('inputRow'));
                }
            }
        });