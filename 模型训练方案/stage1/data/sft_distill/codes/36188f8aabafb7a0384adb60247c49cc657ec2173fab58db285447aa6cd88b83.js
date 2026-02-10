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

// 游戏状态变量
let player;
let cursors;
let spaceKey;
let stateText;
let speedText;
let instructionText;

// 角色状态枚举
const PlayerState = {
  IDLE: 0,
  WALK: 1,
  RUN: 2
};

// 状态配置
const StateConfig = {
  [PlayerState.IDLE]: {
    name: '静止',
    speed: 0,
    color: 0x4a90e2,
    maxSpeed: 0
  },
  [PlayerState.WALK]: {
    name: '行走',
    speed: 160,
    color: 0x50c878,
    maxSpeed: 160
  },
  [PlayerState.RUN]: {
    name: '跑步',
    speed: 320,
    color: 0xff6b6b,
    maxSpeed: 320
  }
};

let currentState = PlayerState.IDLE;
let currentSpeed = 0;

function preload() {
  // 程序化生成角色纹理
  generatePlayerTextures(this);
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player_idle');
  player.setCollideWorldBounds(true);
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 监听空格键切换状态
  spaceKey.on('down', () => {
    switchState(this);
  });
  
  // 创建状态显示文本
  stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  
  speedText = this.add.text(20, 50, '', {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  
  instructionText = this.add.text(20, 90, '操作说明：\n空格键 - 切换状态\n方向键 - 移动角色', {
    fontSize: '16px',
    fill: '#cccccc',
    fontFamily: 'Arial',
    lineSpacing: 5
  });
  
  // 添加状态指示器
  createStateIndicator(this);
  
  // 初始化显示
  updateStateDisplay();
}

function update(time, delta) {
  // 根据当前状态更新移动
  const config = StateConfig[currentState];
  
  // 重置速度
  player.setVelocity(0, 0);
  
  // 只有在非静止状态下才能移动
  if (currentState !== PlayerState.IDLE) {
    let velocityX = 0;
    let velocityY = 0;
    
    if (cursors.left.isDown) {
      velocityX = -config.maxSpeed;
    } else if (cursors.right.isDown) {
      velocityX = config.maxSpeed;
    }
    
    if (cursors.up.isDown) {
      velocityY = -config.maxSpeed;
    } else if (cursors.down.isDown) {
      velocityY = config.maxSpeed;
    }
    
    // 设置速度
    player.setVelocity(velocityX, velocityY);
    
    // 计算实际速度
    currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    // 如果有对角线移动，归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      player.setVelocity(
        velocityX * 0.707,
        velocityY * 0.707
      );
      currentSpeed = config.maxSpeed;
    }
  } else {
    currentSpeed = 0;
  }
  
  // 更新显示
  updateStateDisplay();
}

function switchState(scene) {
  // 循环切换状态
  currentState = (currentState + 1) % 3;
  
  // 更新角色纹理
  const textureKey = getTextureKeyForState(currentState);
  player.setTexture(textureKey);
  
  // 更新显示
  updateStateDisplay();
  
  // 添加状态切换视觉反馈
  scene.tweens.add({
    targets: player,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
}

function updateStateDisplay() {
  const config = StateConfig[currentState];
  stateText.setText(`当前状态: ${config.name}`);
  speedText.setText(`速度: ${Math.round(currentSpeed)} / ${config.maxSpeed}`);
  
  // 更新文本颜色
  stateText.setColor('#' + config.color.toString(16).padStart(6, '0'));
}

function getTextureKeyForState(state) {
  switch(state) {
    case PlayerState.IDLE:
      return 'player_idle';
    case PlayerState.WALK:
      return 'player_walk';
    case PlayerState.RUN:
      return 'player_run';
    default:
      return 'player_idle';
  }
}

function generatePlayerTextures(scene) {
  // 生成静止状态纹理
  const idleGraphics = scene.add.graphics();
  idleGraphics.fillStyle(StateConfig[PlayerState.IDLE].color, 1);
  idleGraphics.fillCircle(25, 25, 20);
  idleGraphics.fillStyle(0xffffff, 1);
  idleGraphics.fillCircle(20, 20, 5);
  idleGraphics.fillCircle(30, 20, 5);
  idleGraphics.generateTexture('player_idle', 50, 50);
  idleGraphics.destroy();
  
  // 生成行走状态纹理
  const walkGraphics = scene.add.graphics();
  walkGraphics.fillStyle(StateConfig[PlayerState.WALK].color, 1);
  walkGraphics.fillCircle(25, 25, 20);
  walkGraphics.fillStyle(0xffffff, 1);
  walkGraphics.fillCircle(20, 20, 5);
  walkGraphics.fillCircle(30, 20, 5);
  // 添加行走标识（小三角形）
  walkGraphics.fillStyle(0xffffff, 1);
  walkGraphics.fillTriangle(25, 35, 20, 40, 30, 40);
  walkGraphics.generateTexture('player_walk', 50, 50);
  walkGraphics.destroy();
  
  // 生成跑步状态纹理
  const runGraphics = scene.add.graphics();
  runGraphics.fillStyle(StateConfig[PlayerState.RUN].color, 1);
  runGraphics.fillCircle(25, 25, 20);
  runGraphics.fillStyle(0xffffff, 1);
  runGraphics.fillCircle(20, 20, 5);
  runGraphics.fillCircle(30, 20, 5);
  // 添加跑步标识（双三角形）
  runGraphics.fillStyle(0xffffff, 1);
  runGraphics.fillTriangle(20, 35, 15, 40, 25, 40);
  runGraphics.fillTriangle(30, 35, 25, 40, 35, 40);
  runGraphics.generateTexture('player_run', 50, 50);
  runGraphics.destroy();
}

function createStateIndicator(scene) {
  // 创建状态指示器（右下角）
  const indicatorX = 650;
  const indicatorY = 500;
  
  scene.add.text(indicatorX, indicatorY - 30, '状态指示器:', {
    fontSize: '16px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 静止状态指示
  const idleCircle = scene.add.graphics();
  idleCircle.lineStyle(3, StateConfig[PlayerState.IDLE].color, 1);
  idleCircle.strokeCircle(indicatorX + 25, indicatorY + 25, 15);
  
  scene.add.text(indicatorX + 50, indicatorY + 15, '静止 (0)', {
    fontSize: '14px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 行走状态指示
  const walkCircle = scene.add.graphics();
  walkCircle.lineStyle(3, StateConfig[PlayerState.WALK].color, 1);
  walkCircle.strokeCircle(indicatorX + 25, indicatorY + 55, 15);
  
  scene.add.text(indicatorX + 50, indicatorY + 45, '行走 (160)', {
    fontSize: '14px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 跑步状态指示
  const runCircle = scene.add.graphics();
  runCircle.lineStyle(3, StateConfig[PlayerState.RUN].color, 1);
  runCircle.strokeCircle(indicatorX + 25, indicatorY + 85, 15);
  
  scene.add.text(indicatorX + 50, indicatorY + 75, '跑步 (320)', {
    fontSize: '14px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
}

// 启动游戏
new Phaser.Game(config);