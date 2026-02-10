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

// 状态枚举
const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
};

// 状态配置
const STATE_CONFIG = {
  [STATE.IDLE]: { speed: 0, color: 0x888888, name: '静止 (IDLE)' },
  [STATE.WALK]: { speed: 200, color: 0x4488ff, name: '行走 (WALK)' },
  [STATE.RUN]: { speed: 400, color: 0xff4444, name: '跑步 (RUN)' }
};

// 全局变量
let player;
let currentState = STATE.IDLE;
let stateText;
let instructionText;
let cursors;
let spaceKey;
let velocity = { x: 0, y: 0 };

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建玩家角色（使用 Graphics 绘制）
  const graphics = this.add.graphics();
  graphics.fillStyle(STATE_CONFIG[STATE.IDLE].color, 1);
  graphics.fillRect(0, 0, 40, 60);
  graphics.generateTexture('player', 40, 60);
  graphics.destroy();

  // 创建玩家精灵
  player = this.add.rectangle(400, 300, 40, 60, STATE_CONFIG[STATE.IDLE].color);
  player.setOrigin(0.5, 0.5);

  // 创建状态显示文本
  stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建操作说明文本
  instructionText = this.add.text(20, 60, 
    '操作说明:\n空格键 - 切换状态\n方向键 - 移动角色', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建速度指示器
  this.add.text(20, 550, '当前速度:', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 监听空格键切换状态
  spaceKey.on('down', () => {
    switchState();
  });

  // 初始化状态显示
  updateStateDisplay();
}

function update(time, delta) {
  // 重置速度
  velocity.x = 0;
  velocity.y = 0;

  // 获取当前状态的速度
  const currentSpeed = STATE_CONFIG[currentState].speed;

  // 根据按键设置移动方向
  if (cursors.left.isDown) {
    velocity.x = -1;
  } else if (cursors.right.isDown) {
    velocity.x = 1;
  }

  if (cursors.up.isDown) {
    velocity.y = -1;
  } else if (cursors.down.isDown) {
    velocity.y = 1;
  }

  // 归一化对角线移动速度
  if (velocity.x !== 0 && velocity.y !== 0) {
    const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    velocity.x /= length;
    velocity.y /= length;
  }

  // 应用速度（转换为每帧移动距离）
  const deltaSeconds = delta / 1000;
  player.x += velocity.x * currentSpeed * deltaSeconds;
  player.y += velocity.y * currentSpeed * deltaSeconds;

  // 边界限制
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 30, 570);

  // 更新状态显示（显示实际移动速度）
  const actualSpeed = Math.sqrt(
    Math.pow(velocity.x * currentSpeed, 2) + 
    Math.pow(velocity.y * currentSpeed, 2)
  ).toFixed(0);
  
  updateStateDisplay(actualSpeed);
}

function switchState() {
  // 循环切换状态
  switch (currentState) {
    case STATE.IDLE:
      currentState = STATE.WALK;
      break;
    case STATE.WALK:
      currentState = STATE.RUN;
      break;
    case STATE.RUN:
      currentState = STATE.IDLE;
      break;
  }

  // 更新角色颜色
  player.setFillStyle(STATE_CONFIG[currentState].color);

  // 更新显示
  updateStateDisplay();
}

function updateStateDisplay(actualSpeed = 0) {
  const config = STATE_CONFIG[currentState];
  stateText.setText(`状态: ${config.name} | 速度: ${config.speed}`);
  
  // 更新速度指示器
  if (actualSpeed > 0) {
    stateText.setText(`状态: ${config.name} | 速度: ${config.speed} | 实际: ${actualSpeed}`);
  }
}

// 启动游戏
new Phaser.Game(config);