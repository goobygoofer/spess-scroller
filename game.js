//force page into dark mode
function darkMode(){
  var page = document.body;
  page.classList.toggle("dark-mode", true);
}

darkMode();

let highScore = 0;
if (localStorage.getItem("high-score")===undefined){
  localStorage.setItem("high-score", 0);
} else {
  highScore = localStorage.getItem("high-score");
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width=800;
canvas.height=600;

const spritesheet = new Image();
spritesheet.src="./spritesheet.png";

document.addEventListener("keydown", (e) => {handleKey(e)});
document.addEventListener("keyup", (e) => {handleKey(e)});

function handleKey(e){
  e.preventDefault();
  switch (e.type){
    case "keydown":
      handleDown(e.key);
      break;
    case "keyup":
      handleUp(e.key);
      break;
    default:
      break;
  }
}

function handleDown(key){
  switch (key){
    case "ArrowLeft":
      jet.turning=true;
      jet.direction = "left";
      break;
    case "ArrowRight":
      jet.turning=true;
      jet.direction = "right";
      break;
    case "ArrowUp":
      jet.backForth="forward";
      //jet.speed=7;
      break;
    case "ArrowDown":
      jet.backForth="backward";
      jet.speed=3;
      break;
    case "a":
    case "A":
      jet.shooting=true;
      break;
    case "s":
    case "S":
      jet.missileFiring=true;
      break;
    case " ":
      going=true;
      resetGame();
      break;
    default:
      break;
  }
}

function handleUp(key){
  switch (key){
    case "ArrowLeft":
    case "ArrowRight":
      jet.turning=false;
      jet.direction="mid";
      break;
    case "ArrowUp":
    case "ArrowDown":
      jet.backForth="mid";
      jet.speed=5;
      break;
    case "a":
    case "A":
      jet.shooting=false;
      break;
    case "s":
    case "S":
      jet.missileFiring=false;
      break;
  }
}

var jet = {
  sprt:{
    y:0,
    left:0,
    right:32,
    mid:16,
    width:16,
    height:15
  },
  width:32,
  height:32,
  x:400,
  y:400,
  speed:5,
  turning:false,
  backForth:false,
  shooting:false,
  direction:"mid",
  lastShot:Date.now(),
  lastMissile:Date.now(),
  shotInt:250,
  missileInt:1000,
  engineFlame:0,
  thrust:0,
  shield:100,
  power:100,
  lastRecharge:Date.now(),
  distance:0,
  score:0,
  update:function () {
    checkHiScore();
    maintainJet();
    moveJet();
    mainWeapon();
    secondaryWeapon();
    drawJet();
  }
}

function maintainJet(){
  jet.distance+=jet.speed;
  if (jet.backForth==="forward" && jet.power>1){
    jet.speed=7;
    jet.power-=0.1;
  } 
  else if (jet.backForth==="forward" && jet.power<1) {
    //jet.backForth="mid";
    jet.speed=5;
  }
  if (jet.lastRecharge + 1000 < Date.now()){
    if (jet.shield > 100){
      jet.shield-=10;
      jet.power-=10;
    }
    if (jet.power<100){
      jet.power+=0.5;
    }
    if (jet.power>100){
      jet.power-=10;
      jet.shield-=1;
    }
    if (jet.power < 0){
      jet.power=0;
    }
    jet.lastRecharge=Date.now();
  }
}

function mainWeapon(){
  if (jet.shooting===true && jet.lastShot+jet.shotInt<Date.now()){
    jet.lastShot=Date.now();
    playerProjectiles.push(new jetProjectile(jet.x+jet.width/2, jet.y, bullet));
  }
}

function secondaryWeapon(){
  if (jet.missileFiring===true && jet.power>=10 && jet.lastMissile+jet.missileInt<Date.now()){
    jet.lastMissile=Date.now();
    jet.power-=10;
    jet.y+=10;
    playerProjectiles.push(new jetProjectile(jet.x+5, jet.y+5, missile));
    playerProjectiles.push(new jetProjectile(jet.x+23, jet.y+5, missile));
  }
}

function moveJet(){
  if (jet.y>515){
    jet.y=515;
  }
  if (jet.turning===true){
    if (jet.x>0 && jet.direction==="left"){
      jet.x-=5;
    }
    else if (jet.x < canvas.width-jet.width && jet.direction==="right"){
      jet.x+=5;
    }
  }
  switch (jet.backForth){
    case "mid":
      break;
    case "forward":
      if (jet.y>300){
        jet.y-=5;
      }
      break;
    case "backward":
      if (jet.y<515){
        jet.y+=5;
      }
  }
}

function checkHiScore(){
  if (jet.score > highScore){
    highScore = jet.score;
    localStorage.setItem("high-score", jet.score);
  }
}

const bullet = {
  width:1,
  height:2,
  color:"orange",
  damage:10
}

const missile = {
  width:3,
  height:3,
  color:"yellow",
  damage:50
}

function jetProjectile(x, y, data){
  this.x=x;
  this.y=y;
  this.width=data.width;
  this.height=data.height;
  this.color=data.color;
  this.damage=data.damage;
  this.id=crypto.randomUUID();
  this.end=false;
  this.update = function(){
    if (this.end===true){
      removeItem(playerProjectiles, this.id);
      delete this;
      return;
    }
    if (this.y>=0){
      this.y-=5;
    } else {
      console.log("ended");
      this.end=true;
      removeItem(projectiles, this.id);
      return;
    }
    for (p in projectiles){
      let curProj = projectiles[p];
      if (this.x + this.width >= curProj.x && this.x <= curProj.x+curProj.width && this.y + this.height >= curProj.y && this.y <= curProj.y + curProj.height){
        curProj.hit(this.damage);
        if (curProj.hits<=0 && curProj.type!="powerup"){
          jet.score+=curProj.points;
        }
        removeItem(playerProjectiles, this.id);
        this.end=true;
        delete this;
        return;
      }
    }
  }
}


function enemyProjectile(x, y, direction, data){
  this.x=x;
  this.y=y;
  this.width=data.width;
  this.height=data.height;
  this.color=data.color;
  this.sprite=data.sprite;//either null or object. if null draw color, sprite obj has coords/width/height to pull from sprtsheet
  this.damage=data.damage;
  this.powerDmg=data.powerDmg;
  this.direction=direction;//direction is obj with dX & dY, eg {x:0,y:4} for straight down, {x:2,y:2} for down 45 degrees going to the right
  this.id=crypto.randomUUID();
  this.end=false;
  this.type=data.type;
  this.hits=JSON.parse(JSON.stringify(data.hits));
  this.points=data.points;
  this.lastShot = Date.now();
  this.shotInterval = 1000;
  this.hit = function(dmg){
    this.hits-=dmg;
    if (this.hits<=0){
      this.end=true;
    } else {
      explosions.push(new explosion(this.x+12, this.y+12, 12))
    }
  }
  this.update = function(){
    if (this.lastShot + this.shotInterval < Date.now()){
      this.lastShot=Date.now();
      let shot;
      let speedX;
      let speedY;
      let fire = true;
      switch (this.type){
        case "enemy":
          shot=enemyShot;
          speedX=0;
          speedY=1;
          break;
        case "bigEnemy":
          shot=hugeBomb;
          speedX=0;
          speedY=0.5;
          break;
        default:
          fire = false;
          break;
      }
      if (fire===true){
          projectiles.push(
            new enemyProjectile(this.x+16, this.y+32, {x:speedX, y:speedY}, shot)
          );
      }
    }
    if (this.end === true){
      explosions.push(new explosion(this.x, this.y, 32));
      if (this.type==="debris" && Math.floor(Math.random()*1000>500)){
        //random chance for 1up or shield/power boost
        let randChoice = Math.floor(Math.random()*2);
        projectiles.push(new enemyProjectile(this.x, this.y, {x:0,y:3}, drops[randChoice]));
      }
      removeItem(projectiles, this.id);
    }
    //remove from list if leaves any bounds or hits something/is hit by 
    if (this.x + this.width >= jet.x && this.x <= jet.x+jet.width && this.y+this.height >= jet.y && this.y <= jet.y+jet.height){
      //hit jet!
      jet.shield-=this.damage;
      jet.power-=this.powerDmg;
      jet.y+=5;
      removeItem(projectiles, this.id);
      if (this.type != "powerup"){
        explosions.push(new explosion(this.x, this.y, this.width));
      }
      else if (this.type === "powerup"){
        jet.points+=this.points
      }
    }
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height){
      removeItem(projectiles, this.id);
    } else {
      this.x+=this.direction.x;
      switch (this.type){
        case "enemy":
          this.y += this.direction.y;
          break;
        case "bigEnemy":
          this.y+=this.direction.y;
          break;
        default:
          this.y+=this.direction.y + jet.speed;
          break;
      }
    }
  }
}

function explosion(x, y, size){
  this.x=x;
  this.y=y;
  this.size=size;
  this.id=crypto.randomUUID();
  this.count=0;
  this.update = function(){
    if (this.count>=50 || this.y>=600){
      removeItem(explosions, this.id);
      return;
    }
    this.y+=5;
    this.count+=1;
  }
}

let explosions = [];

function drawExplosions(){
  for (e in explosions){
    let curExpl = explosions[e];
    for (j=0;j<4; j++){
      let randX=Math.floor(Math.random()*curExpl.size);
      let randY=Math.floor(Math.random()*curExpl.size);
      for (i=0;i<10;i++){
        ctx.fillStyle=`rgb(255,255,0,${0.4-(curExpl.count/100)})`;
        ctx.fillRect(curExpl.x + randX, curExpl.y + randY, 2, 2);
        ctx.fillStyle="orange";
        ctx.fillRect(curExpl.x + randX + 1, curExpl.y + randY + 1, 2, 2);
        ctx.fillStyle=`rgb(255,165,0,${0.4-(curExpl.count/100)})`;
        ctx.fillRect(curExpl.x + randX - 1, curExpl.y + randY+3, 2, 2);
      }
    }
    curExpl.update();
  }
}

const bigRock1 = {
  width:32,
  height:32,
  color:"brown",
  sprite:{
    x:64,
    y:0,
    width:16,
    height:15
  },
  type:"debris",
  damage:10,
  powerDmg:0,
  hits:20,
  points:25
}

const bigRock2 = {
  width:32,
  height:32,
  color:"brown",
  sprite:{
    x:80,
    y:0,
    width:16,
    height:15,
  },
  type:"debris",
  damage:10,
  powerDmg:0,
  hits:20,
  points:25
}

const bigRock3 = {
  width:32,
  height:32,
  color:"brown",
  sprite:{
    x:96,
    y:0,
    width:16,
    height:15
  },
  type:"debris",
  damage:10,
  powerDmg:0,
  hits:20,
  points:25
}

const bigRock4 = {
  width:32,
  height:32,
  color:"brown",
  sprite:{
    x:112,
    y:0,
    width:16,
    height:15
  },
  type:"debris",
  damage:10,
  powerDmg:0,
  hits:20,
  points:25
}

const enemyShip ={
  width:32,
  height:32,
  color:"gray",
  sprite:{
     x:160,
     y:0,
     width:16,
     height:15
  },
  type:"enemy",
  damage:25,
  powerDmg:10,
  hits:30,
  points:75
}

const motherShip ={
  width:48,
  height:48,
  color:"gray",
  sprite:{
    x:116,
    y:19,
    width:23,
    height:22
  },
  type:"bigEnemy",
  damage:50,
  powerDmg:50,
  hits:100,
  points:500
}

const hugeBomb ={
  width:32,
  height:32,
  color:"green",
  sprite:{
    x:176,
    y:0,
    width:16,
    height:16
  },
  type:"enemyShot",
  damage:75,
  powerDmg:100,
  hits:100,
  points:1000
}

const enemyShot = {
  width:7,
  height:10,
  color:"green",
  sprite:{
    x:51,
    y:7,
    width:5,
    height:8
  },
  type:"enemyShot",
  damage:20,
  powerDmg:5,
  hits:100,
  points:0
}

const powerUp ={
  width:32,
  height:32,
  color:"blue",
  sprite:{
    x:144,
    y:0,
    width:15,
    height:15
  },
  type:"powerup",
  damage:0,
  powerDmg:-50,
  hits:200,
  points:150
}

const oneUp = {
  width:32,
  height:32,
  color:"green",
  sprite:{
    x:128,
    y:0,
    width:16,
    height:16
  },
  type:"powerup",
  damage:-50,
  powerDmg:0,
  hits:200,
  points:125
}

const drops = [oneUp, powerUp];

let negPos = [1,-1];
let rocks = [bigRock1, bigRock2, bigRock3, bigRock4];
function generateAsteroid(){
  if (Math.floor(Math.random()*100>97)){
    let randX = Math.floor(Math.random()*800);
    let modX = negPos[Math.floor(Math.random()*2)];
    let rand_dX = Math.floor(Math.random()*4)*modX;
    let rand_dY = Math.floor(Math.random()*2)+1;
    let randRock = Math.floor(Math.random()*4);
    projectiles.push(new enemyProjectile(randX, 0, {x:rand_dX,y:rand_dY}, rocks[randRock]));
  }
}

let form_1={
  offset:1,
  mod:1,
  start:0,
  lastSpawn:Date.now(),
  spawnRate:1000
}

let form_2={
  offset:2,
  mod:1,
  start:0,
  lastSpawn:Date.now(),
  spawnRate:500
}

let lastMothership = Date.now();
let motherShipInt = 25000;
function enemyFormation(){
  let form = null;
  if (jet.score<1000){
    form=form_1;
  }
  else if (jet.score>=1000){
    form=form_2;
  }
  if (form.lastSpawn + form.spawnRate > Date.now()){
    return;
  }
  form.lastSpawn=Date.now();
  projectiles.push(
    new enemyProjectile(form.start, 0, {x:form.offset*form.mod,y:1}, enemyShip)
  );
  if (form.offset>=7){
      form.offset=1;
      if (form.mod===1){
          form.mod=-1;
      } else {
          form.mod=1;
      }
      if (form.start===0){
          form.start=768;
      } else {
          form.start=0;
      }
  } else {
      form.offset+=1;
  }
  if (lastMothership + motherShipInt < Date.now()){
    lastMothership=Date.now();
    projectiles.push(
      new enemyProjectile(form.start, 0, {x:form.mod,y:0}, motherShip)
    );
  }
}

let entities = [jet];

function updateEntities(){
  for (ent in entities){
    entities[ent].update();
  }
}

function removeItem(list, id){
  for (proj in list){
    if (list[proj].id===id){
      list.splice(proj, 1);
      return;
    }
  }
}

//list of all projectiles on screen to be updated/drawn
let projectiles = [];
let playerProjectiles = [];

function updateProjectiles(){
  if (projectiles.length===0) return;
  for (proj in projectiles){
    curProj = projectiles[proj];
    curProj.update();
    drawProjectile(curProj);
  }
}

function updatePlayerProjectiles(){
  if (playerProjectiles.length===0) return;
  for (proj in playerProjectiles){
    curProj = playerProjectiles[proj];
    curProj.update();
    drawProjectile(curProj);
  }
}

function drawProjectile(projectile){
    //projectile with sprite
    if (projectile.type==="bigEnemy"){
      console.log(projectile.width);
      console.log(projectile.height);
    }
    try{
      ctx.drawImage(
        spritesheet,
        projectile.sprite.x,
        projectile.sprite.y,
        projectile.sprite.width,
        projectile.sprite.height,
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );
    } catch {
      ctx.drawImage(spritesheet, 50, 0, 4, 4, projectile.x-1, projectile.y, 4, 4);
      ctx.fillStyle=projectile.color;
      ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);  
    }
}

function drawJet(){
  ctx.drawImage(spritesheet, jet.sprt[jet.direction], jet.sprt.y, jet.sprt.width, jet.sprt.height, jet.x, jet.y, jet.width, jet.height);
  //draw engine flames
  switch (jet.engineFlame){
    case 0:
      jet.engineFlame=2;
      break;
    case 2:
      jet.engineFlame=1;
      break;
    case 1:
      jet.engineFlame=0;
      break;
  }
  if (jet.turning===true){
    //draw only one flame on visible engine
    let aug = 1;
    if (jet.direction==="right"){
      aug=-1;
    }
    ctx.drawImage(spritesheet, 50, 0, 4, 4, jet.x+16, jet.y+22, 4, 8);
    ctx.fillStyle=`rgb(255,255,0,0.5)`;
    ctx.fillRect(jet.x+15+aug, jet.y+24+jet.engineFlame, 2, 4);
    if (jet.speed>5){
      ctx.fillRect(jet.x+15+aug, jet.y+24+jet.engineFlame, 2, 6);
    }
  } else {
    //draw both engine flames
    ctx.fillStyle=`rgb(255,255,0,0.5)`;
    if (jet.speed>3){
      ctx.drawImage(spritesheet, 50, 0, 4, 4, jet.x+7, jet.y+24, 4, 8);
      ctx.drawImage(spritesheet, 50, 0, 4, 4, jet.x+22, jet.y+24, 4, 8);
    }
    if (jet.speed>5){
      ctx.fillRect(jet.x+8, jet.y+27+jet.engineFlame, 2, 4);
      ctx.fillRect(jet.x+22, jet.y+27+jet.engineFlame, 2, 4);
    }
    ctx.fillRect(jet.x+8, jet.y+24+jet.engineFlame, 2, 2);
    ctx.fillRect(jet.x+22, jet.y+24+jet.engineFlame, 2, 2);
  }
}

function write(text, fontsize, x, y){
  text=text.toUpperCase();
  for (char in text){
    let charInt = text[char].charCodeAt() - 65;
    let spriteY = 26;
    let offset = 0;
    if (charInt>=13 && charInt<=26){
      charInt-=13;
      spriteY=36;
      offset=1;
    }
    else if (charInt < 0){
      //it a number?
      charInt+=17;
      spriteY=16;
    }
    ctx.drawImage(spritesheet, charInt*8 + offset, spriteY, 8, 9, x+8*char*fontsize, y, 8*fontsize, 10*fontsize);
  }
}

function drawHUD(){
  ctx.fillStyle="rgb(0,0,0,0.5)";
  ctx.fillRect(0, 550, 800, 50);
  //shield
  write("shield", 1, 10, 550);
  ctx.fillStyle="rgb(0,100,125,0.5)";
  ctx.fillRect(60, 550, 100, 10);
  ctx.fillStyle="rgb(19,228,75,0.5)";
  ctx.fillRect(60, 550, (jet.shield/100)*100, 10);
  //power
  write(" power", 1, 10, 565);
  ctx.fillStyle="rgb(0,100,125,0.5)";
  ctx.fillRect(60, 565, 100, 10);
  ctx.fillStyle="rgb(115,215,232,0.5)";
  ctx.fillRect(60, 565, (jet.power/100)*100, 10);
  write(`${Math.floor(jet.distance/100)}000 km`, 1, 769-(JSON.stringify(jet.distance + 2).length)*8, 550);
  write(`hi score ${highScore}`, 1, 400, 575);
  write(`score ${jet.score}`, 1, 400, 590);
}

let star = {
  x:0,
  y:0,
  id:null
}

function drawStars(){
  if (lastStars + Math.floor(Math.random()*1000 < lastStars)){
    lastStars = Date.now();
    for (i=0;i<canvas.width;i++){
      if (Math.floor(Math.random()*100) > 98){
        let newStar = JSON.parse(JSON.stringify(star));
        newStar.x=i;
        newStar.id=crypto.randomUUID();
        stars.push(
          newStar
        );
      }
    }
    for (i=0;i<canvas.width;i++){
      if (Math.floor(Math.random()*10000 > 9998)){
        let newStar = JSON.parse(JSON.stringify(star));
        newStar.x=i;
        newStar.id=crypto.randomUUID();
        stars_2.push(newStar);
      }
    }
  }
  for (s in stars){
    st = stars[s];
    ctx.fillStyle="white";
    ctx.fillRect(st.x, st.y, 1, 1);
    st.y+=1 + jet.speed;
    if (st.y >= canvas.height){
      removeItem(stars, st.id);
    }
  }
  for (s in stars_2){
    st = stars_2[s];
    if (Math.floor(Math.random()*10) > 8){
      ctx.fillStyle="yellow";
    } else {
      ctx.fillStyle="white";
    }
    if (Math.floor(Math.random()*10)>6){
      ctx.fillRect(st.x, st.y-1, 1, 4);
      ctx.fillRect(st.x-2, st.y, 4, 1);
    } else {
      ctx.fillRect(st.x, st.y, 1, 1);
    }
    
    st.y+=0.2 + jet.speed;
    if (st.y >= canvas.height){
      removeItem(stars_2, st.id);
    }
  }
}

let stars = [];
let stars_2 = [];
let stars_3 = [];
let space = [
  stars,
  stars_2,
  stars_3
];
let lastStars = Date.now();
function drawBackground(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="rgb(114,50,115,1)";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  drawStars();
}

function gameOver(){
  ctx.fillStyle="gray";
  ctx.fillRect(305, 300, 180, 20);
  write("game over", 2, 320, 300);
  write("space to reload", 1, 330, 325);
}

function resetGame(){
  if (jet.shield<=0){
    playerProjectiles=[];
    projectiles=[];
    explosions=[];
    lastMothership=Date.now();
    going=false;
    jet.shield=100;
    jet.power=100;
    jet.distance=0;
    jet.x=400;
    jet.y=400;
    jet.score=0;
  } 
}

let instructions = [
  "space to start",
  "",
  "a for primary weapon",
  "s for secondary weapon",
  "",
  "",
  "arrow keys to move",
  "up arrow for thrust",
  "down arrow to slow down",
  "",
  "",
  "secondary weapon and thrust uses power",
  "catch powerups",
  "excess shield depletes power",
  "excess power depletes shield",
  "",
  "",
  "shoot enemy ships and missiles",
  "avoid enemy fire",
  "",
  "",
  "shoot or avoid the asteroids",
  "some asteroids drop powerups"
]

let going=false;
function gameloop(){
  if (jet.shield<=0){
    going=false;
    drawExplosions();
    gameOver();
    return;
  }
  drawBackground();
  if (going===true){
    generateAsteroid();
    enemyFormation();
    updateEntities();
    updateProjectiles();
    updatePlayerProjectiles();
    drawExplosions();
    drawHUD();
  } else {
    write("SPESS SCROLLER", 3, 265, 150);
    for (i in instructions){
      let text = instructions[i];
      write(text, 1, 290, 200+(i*15));
    }
  }
}

setInterval(() => {
  gameloop();
},1000/60)