const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态
let player;
let score = 0;
let scoreText;
let statusText;
let instructionText;
let cursors;
let saveKey;
let loadKey;
let spaceKey;
let lastSaveTime = 0;
let lastLoadTime = 0;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家（使用Graphics绘制）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 20);
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokeCircle(0, 0, 20);
  graphics.generateTexture('playerTexture', 40, 40);
  graphics.destroy();

  player = this.add.sprite(400, 300, 'playerTexture');
  
  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建状态提示文本
  statusText = this.add.text(16, 50, '', {
    fontSize: '20px',
    fill: '#ffff00',
    fontFamily: 'Arial'
  });

  // 创建操作说明
  instructionText = this.add.text(16, 550, 
    'WASD: Move | SPACE: +10 Score | Right Click: Save | S Key: Load', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  // 设置键盘输入
  cursors = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);
  loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

  // 监听空格键增加分数
  spaceKey.on('down', () => {
    score += 10;
    updateScoreDisplay();
    showStatus('Score increased!', 1000);
  });

  // 监听F5键保存（备用保存键）
  saveKey.on('down', () => {
    saveGame();
  });

  // 监听S键加载（需要按住Shift避免与移动冲突）
  this.input.keyboard.on('keydown-S', (event) => {
    if (event.shiftKey) {
      loadGame();
    }
  });

  // 监听鼠标右键保存
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      saveGame();
    }
  });

  // 禁用右键菜单
  this.input.mouse.disableContextMenu();

  // 尝试加载已有存档
  tryAutoLoad();
}

function update(time, delta) {
  // 玩家移动控制
  const speed = 200 * (delta / 1000);

  if (cursors.left.isDown) {
    player.x -= speed;
  } else if (cursors.right.isDown) {
    player.x += speed;
  }

  if (cursors.up.isDown) {
    player.y -= speed;
  } else if (cursors.down.isDown && !this.input.keyboard.shiftKey) {
    player.y += speed;
  }

  // 边界限制
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

function saveGame() {
  const currentTime = Date.now();
  if (currentTime - lastSaveTime < 500) {
    return; // 防止频繁保存
  }
  lastSaveTime = currentTime;

  const saveData = {
    playerX: player.x,
    playerY: player.y,
    score: score,
    timestamp: currentTime
  };

  try {
    localStorage.setItem('phaserGameSave', JSON.stringify(saveData));
    showStatus('Game Saved!', 2000);
    console.log('Game saved:', saveData);
  } catch (e) {
    showStatus('Save Failed!', 2000);
    console.error('Save error:', e);
  }
}

function loadGame() {
  const currentTime = Date.now();
  if (currentTime - lastLoadTime < 500) {
    return; // 防止频繁加载
  }
  lastLoadTime = currentTime;

  try {
    const savedData = localStorage.getItem('phaserGameSave');
    if (savedData) {
      const data = JSON.parse(savedData);
      player.x = data.playerX;
      player.y = data.playerY;
      score = data.score;
      updateScoreDisplay();
      
      const saveDate = new Date(data.timestamp);
      showStatus(`Game Loaded! (Saved: ${saveDate.toLocaleTimeString()})`, 3000);
      console.log('Game loaded:', data);
    } else {
      showStatus('No save data found!', 2000);
    }
  } catch (e) {
    showStatus('Load Failed!', 2000);
    console.error('Load error:', e);
  }
}

function tryAutoLoad() {
  try {
    const savedData = localStorage.getItem('phaserGameSave');
    if (savedData) {
      showStatus('Previous save detected. Press Shift+S to load.', 3000);
    }
  } catch (e) {
    console.error('Auto-load check error:', e);
  }
}

function updateScoreDisplay() {
  scoreText.setText('Score: ' + score);
}

function showStatus(message, duration) {
  statusText.setText(message);
  setTimeout(() => {
    statusText.setText('');
  }, duration);
}

new Phaser.Game(config);