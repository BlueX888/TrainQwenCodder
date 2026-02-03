const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态常量
const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
};

const SPEED = {
  IDLE: 0,
  WALK: 360,
  RUN: 720
};

// 全局变量
let player;
let currentState = STATE.IDLE;
let currentSpeed = SPEED.IDLE;
let stateText;
let speedText;
let instructionText;
let spaceKey;

function preload() {
  // 使用 Graphics 生成不同状态的角色纹理
  createPlayerTextures(this);
}

function create() {
  // 创建角色精灵
  player = this.add.sprite(100, 300, 'player_idle');
  player.setScale(2);

  // 创建状态显示文本
  stateText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  speedText = this.add.text(16, 50, '', {
    fontSize: '20px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  instructionText = this.add.text(16, 90, '按空格键切换状态', {
    fontSize: '18px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 初始化显示
  updateStateDisplay();
}

function update(time, delta) {
  // 检测空格键按下（使用 justDown 避免重复触发）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    switchState();
  }

  // 根据速度移动角色
  if (currentSpeed > 0) {
    player.x += (currentSpeed * delta) / 1000;

    // 循环回到左侧
    if (player.x > config.width + 50) {
      player.x = -50;
    }
  }
}

// 创建不同状态的角色纹理
function createPlayerTextures(scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

  // 静止状态 - 蓝色方块
  graphics.clear();
  graphics.fillStyle(0x3498db, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(0, 0, 32, 32);
  graphics.generateTexture('player_idle', 32, 32);

  // 行走状态 - 绿色方块
  graphics.clear();
  graphics.fillStyle(0x2ecc71, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(0, 0, 32, 32);
  // 添加行走标记（小三角）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(8, 16, 24, 16, 16, 8);
  graphics.generateTexture('player_walk', 32, 32);

  // 跑步状态 - 红色方块
  graphics.clear();
  graphics.fillStyle(0xe74c3c, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(0, 0, 32, 32);
  // 添加跑步标记（双三角）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(6, 16, 14, 16, 10, 8);
  graphics.fillTriangle(18, 16, 26, 16, 22, 8);
  graphics.generateTexture('player_run', 32, 32);

  graphics.destroy();
}

// 切换状态
function switchState() {
  if (currentState === STATE.IDLE) {
    currentState = STATE.WALK;
    currentSpeed = SPEED.WALK;
    player.setTexture('player_walk');
  } else if (currentState === STATE.WALK) {
    currentState = STATE.RUN;
    currentSpeed = SPEED.RUN;
    player.setTexture('player_run');
  } else {
    currentState = STATE.IDLE;
    currentSpeed = SPEED.IDLE;
    player.setTexture('player_idle');
  }

  updateStateDisplay();
}

// 更新状态显示
function updateStateDisplay() {
  let stateLabel;
  switch (currentState) {
    case STATE.IDLE:
      stateLabel = '静止 (IDLE)';
      break;
    case STATE.WALK:
      stateLabel = '行走 (WALK)';
      break;
    case STATE.RUN:
      stateLabel = '跑步 (RUN)';
      break;
  }

  stateText.setText(`当前状态: ${stateLabel}`);
  speedText.setText(`当前速度: ${currentSpeed} px/s`);
}

// 启动游戏
new Phaser.Game(config);