let data = JSON.parse(localStorage.getItem("snakeData"));

document.addEventListener('DOMContentLoaded', () => {
    initialize();
    data = JSON.parse(localStorage.getItem("snakeData"));
    textRefresh();
});

// Données modifiable
const rows = 15;
const cols = 15;
let bombesCounter = 50;

// Ne pas toucher
let started = false;
const overlay = document.getElementById("overlay");
const text = document.getElementById('text');
const clickmodebtn = document.getElementById('clickmode');
let noBombs = [];
let bombs = [];

// Création du terrain
function initialize(){
    const grid = document.getElementById("grid");

    for (let r = 0; r < rows; r++) {
        const row = document.createElement("tr");

        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("td");
            cell.classList.add("cell");
            cell.id = `cell-${c}-${r}`;
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => {
                clickCell(c,r);
            })
            row.appendChild(cell);
        }

        grid.appendChild(row);
    }
}

// créers les bombes
function createBombs(clickx,clicky){
    bombs = [];
    for(let b=0;b<bombesCounter;b++){
        let error = true;
        let tryposition;
        while(error){
            tryposition = {};
            const x = getRandomInt(0,rows-1) ;
            const y = getRandomInt(0,cols-1);
            error = false;
            if(!canExist(x, y) || (x >= clickx - 1 && x <= clickx + 1 && y >= clicky - 1 && y <= clicky + 1)){
                error = true;
                continue;
            }
            tryposition = {marked:false,x: x,y: y};
            break;
            
        }
        bombs.push(tryposition);
    }
    
    started = true;
}

function canExist(x,y){
    for(let bomb of bombs){
        const positionx = bomb.x;
        const positiony = bomb.y;
        if(x === positionx && y === positiony){
            return false;
        } 
    }
    return true;
}

// Tirer sur une case
function clickCell(x,y){
    if(!started){
        createBombs(x,y);
        console.log(bombs);
    }
    if(canExist(x,y)){
        console.log('nobomb');
        noBomb(x,y);
    }else{
        console.log('bomb');
        bombClick(x,y);
    }
    textRefresh();
    refreshGameStatus();
}

function noBomb(x,y){
    const shootedCell = document.getElementById(`cell-${x}-${y}`);
    if(shootedCell.classList.contains('reveal')) return;
    if(clickmodebtn.checked){
        if(!shootedCell.classList.contains('miss')){
            shootedCell.classList.add('miss');
            bombesCounter --;
        }else{
            shootedCell.classList.remove    ('miss');
            bombesCounter ++;
        }
    }else{
        shootedCell.classList.add('reveal');
        revealBomb(x,y);
    }
}

function bombClick(x,y){
    if(clickmodebtn.checked){
        const shootedCell = document.getElementById(`cell-${x}-${y}`);
        if(!shootedCell.classList.contains('miss')){
            shootedCell.classList.add('miss');
            bombesCounter --;
        }else{
            shootedCell.classList.remove    ('miss');
            bombesCounter ++;
        }
        const shootedPosition = bombs.find(obj => obj.x === x && obj.y === y);
        shootedPosition.marked = !shootedPosition.marked;
    }else{
        looseGame();
    }
    refreshGameStatus();
}

function refreshGameStatus(){
    let win = true;
    for(let bomb of bombs){
        if(!bomb.marked){
            win = false; 
        }
    }
    if(win && bombesCounter ===0) winGame();
}

function looseGame(){
    started = false;
    text.innerHTML = 'You Loose !';
    const cells = Array.from(document.getElementsByClassName('cell'));
    cells.forEach(element => {
        element.classList.remove('hit');
        element.classList.remove('miss');
        element.classList.remove('reveal');
        element.innerHTML = '';
    });
}

function winGame(){
    started = false;
    overlay.style.display = 'block';
    const cells = Array.from(document.getElementsByClassName('cell'));
    cells.forEach(element => {
        element.classList.remove('hit');
        element.classList.remove('miss');
        element.classList.remove('reveal');
        element.innerHTML = '';
    });
    text.innerHTML = `Vous avez gagné !!!`;
}

function revealBomb(x,y){
    let bombsNear = 0;
    const Cell = document.getElementById(`cell-${x}-${y}`);
    Cell.classList.add('reveal');
    for(let i = -1; i < 2 ; i++){
        for(let j = -1; j<2 ; j++){
            if(!canExist(x+i,y+j)){
                bombsNear ++;
            }
        }
    }
    console.log(bombsNear);
    if(bombsNear === 0){
        for(let i = -1; i < 2 ; i++){
            for(let j = -1; j<2 ; j++){
                if(canExist(x+i,y+j)){
                    const nearCells = document.getElementById(`cell-${x+i}-${y+j}`);
                    if(!nearCells) continue;
                    if(nearCells.classList.contains('reveal')) continue;
                    revealBomb(x+i,y+j)
                }
            }
        }
    }else{
        Cell.innerHTML = `<span class="text-light text-center h-100 w-100 align-items-center">${bombsNear}</span>`
    }
}

// Position des bateaux
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Affichage Text 
function textRefresh(){
    text.innerHTML = `Bombe(s) restante(s) : ${bombesCounter}`;
}