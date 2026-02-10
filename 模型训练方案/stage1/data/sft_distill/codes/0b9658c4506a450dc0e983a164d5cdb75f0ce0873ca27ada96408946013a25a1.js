const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态常量
const STATE = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN'
};

const SPEED = {
  IDLE: 0,
  WALK: 120,
  RUN: 240
};

// 游戏状态变量（可验证）
let gameState = {
  currentState: STATE.IDLE,
  speed: SPEED.IDLE,
  stateChangeCount: 0
};

let player;
let cursors;
let stateText;
let speedText;
let instructionText;
let stateIndicator;

function preload() {
  // 创建角色纹理
  const graphics = this.add.graphics();
  
  // 静止状态 - 蓝色方块
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 40, 60);
  graphics.generateTexture('player_idle', 40, 60);
  graphics.clear();
  
  // 行走状态 - 绿色方块
  graphics.fillStyle(0x7ed321, 1);
  graphics.fillRect(0, 0, 40, 60);
  graphics.generateTexture('player_walk', 40, 60);
  graphics.clear();
  
  // 跑步状态 - 红色方块
  graphics.fillStyle(0xf5a623, 1);
  graphics.fillRect(0, 0, 40, 60);
  graphics.generateTexture('player_run', 40, 60);
  graphics.clear();
  
  graphics.destroy();
}

function create() {
  // 创建玩家角色
  player = this.physics.add.sprite(400, 300, 'player_idle');
  player.setCollideWorldBounds(true);
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加数字键监听（1/2/3 切换状态）
  this.input.keyboard.on('keydown-ONE', () => changeState(STATE.IDLE));
  this.input.keyboard.on('keydown-TWO', () => changeState(STATE.WALK));
  this.input.keyboard.on('keydown-THREE', () => changeState(STATE.RUN));
  
  // 创建状态显示文本
  stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  speedText = this.add.text(20, 60, '', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 状态切换计数
  const countText = this.add.text(20, 100, '', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  countText.setText('State Changes: 0');
  this.countText = countText;
  
  // 操作说明
  instructionText = this.add.text(400, 550, 
    '按键 1: 静止 | 按键 2: 行走 | 按键 3: 跑步 | 方向键: 移动',
    {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    }
  );
  instructionText.setOrigin(0.5, 0.5);
  
  // 创建状态指示器（圆形）
  stateIndicator = this.add.graphics();
  
  // 初始化状态
  updateStateDisplay.call(this);
}

function update() {
  // 根据当前状态和方向键移动角色
  let velocityX = 0;
  let velocityY = 0;
  
  if (cursors.left.isDown) {
    velocityX = -gameState.speed;
  } else if (cursors.right.isDown) {
    velocityX = gameState.speed;
  }
  
  if (cursors.up.isDown) {
    velocityY = -gameState.speed;
  } else if (cursors.down.isDown) {
    velocityY = gameState.speed;
  }
  
  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2;
    velocityX *= factor;
    velocityY *= factor;
  }
  
  player.setVelocity(velocityX, velocityY);
}

function changeState(newState) {
  if (gameState.currentState !== newState) {
    gameState.currentState = newState;
    gameState.speed = SPEED[newState];
    gameState.stateChangeCount++;
    
    updateStateDisplay.call(this);
  }
}

function updateStateDisplay() {
  // 更新状态文本
  const stateColors = {
    IDLE: '#4a90e2',
    WALK: '#7ed321',
    RUN: '#f5a623'
  };
  
  stateText.setText(`状态: ${gameState.currentState}`);
  stateText.setBackgroundColor(stateColors[gameState.currentState]);
  
  speedText.setText(`速度: ${gameState.speed} px/s`);
  
  this.countText.setText(`State Changes: ${gameState.stateChangeCount}`);
  
  // 更新角色纹理
  const textureMap = {
    IDLE: 'player_idle',
    WALK: 'player_walk',
    RUN: 'player_run'
  };
  player.setTexture(textureMap[gameState.currentState]);
  
  // 更新状态指示器
  stateIndicator.clear();
  stateIndicator.fillStyle(parseInt(stateColors[gameState.currentState].replace('#', '0x')), 1);
  stateIndicator.fillCircle(player.x, player.y - 50, 10);
  
  // 添加状态标记
  stateIndicator.lineStyle(2, 0xffffff, 1);
  stateIndicator.strokeCircle(player.x, player.y - 50, 10);
}

// 启动游戏
new Phaser.Game(config);