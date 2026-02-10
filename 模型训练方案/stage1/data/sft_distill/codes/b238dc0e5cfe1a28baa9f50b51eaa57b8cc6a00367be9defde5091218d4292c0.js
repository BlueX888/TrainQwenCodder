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
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
};

const SPEED = {
  IDLE: 0,
  WALK: 160,
  RUN: 320
};

// 全局变量
let player;
let currentState = STATE.IDLE;
let stateText;
let speedText;
let instructionText;
let keys;

function preload() {
  // 生成三种状态的纹理
  createPlayerTexture(this, 'idle', 0x4a90e2);    // 蓝色 - 静止
  createPlayerTexture(this, 'walk', 0x50c878);    // 绿色 - 行走
  createPlayerTexture(this, 'run', 0xe74c3c);     // 红色 - 跑步
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'idle');
  player.setCollideWorldBounds(true);
  
  // 创建状态显示文本
  stateText = this.add.text(20, 20, '', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  speedText = this.add.text(20, 60, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 创建操作说明
  instructionText = this.add.text(400, 550, '按键: 1=静止 | 2=行走 | 3=跑步 | 方向键=移动', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setOrigin(0.5);
  
  // 设置键盘输入
  keys = {
    one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    cursors: this.input.keyboard.createCursorKeys()
  };
  
  // 监听按键事件
  keys.one.on('down', () => changeState(STATE.IDLE));
  keys.two.on('down', () => changeState(STATE.WALK));
  keys.three.on('down', () => changeState(STATE.RUN));
  
  // 初始化显示
  updateStateDisplay();
}

function update() {
  // 获取当前状态的速度
  let speed = getCurrentSpeed();
  
  // 重置速度
  player.setVelocity(0);
  
  // 方向键控制移动
  if (keys.cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (keys.cursors.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (keys.cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (keys.cursors.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(speed);
  }
  
  // 更新速度显示（显示实际速度）
  const actualSpeed = Math.sqrt(
    player.body.velocity.x ** 2 + player.body.velocity.y ** 2
  ).toFixed(1);
  speedText.setText(`实际速度: ${actualSpeed} px/s`);
}

// 创建角色纹理
function createPlayerTexture(scene, key, color) {
  const graphics = scene.add.graphics();
  
  // 绘制角色身体（矩形）
  graphics.fillStyle(color, 1);
  graphics.fillRect(0, 0, 40, 60);
  
  // 绘制眼睛
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(12, 15, 5);
  graphics.fillCircle(28, 15, 5);
  
  // 绘制瞳孔
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(12, 15, 2);
  graphics.fillCircle(28, 15, 2);
  
  // 绘制嘴巴
  graphics.lineStyle(2, 0x000000, 1);
  graphics.beginPath();
  graphics.arc(20, 25, 8, 0, Math.PI, false);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture(key, 40, 60);
  graphics.destroy();
}

// 改变状态
function changeState(newState) {
  currentState = newState;
  
  // 更新角色纹理
  switch (currentState) {
    case STATE.IDLE:
      player.setTexture('idle');
      break;
    case STATE.WALK:
      player.setTexture('walk');
      break;
    case STATE.RUN:
      player.setTexture('run');
      break;
  }
  
  updateStateDisplay();
}

// 获取当前速度
function getCurrentSpeed() {
  switch (currentState) {
    case STATE.IDLE:
      return SPEED.IDLE;
    case STATE.WALK:
      return SPEED.WALK;
    case STATE.RUN:
      return SPEED.RUN;
    default:
      return 0;
  }
}

// 更新状态显示
function updateStateDisplay() {
  const stateNames = {
    [STATE.IDLE]: '静止',
    [STATE.WALK]: '行走',
    [STATE.RUN]: '跑步'
  };
  
  const speed = getCurrentSpeed();
  
  stateText.setText(`当前状态: ${stateNames[currentState]}`);
  
  // 根据状态改变文本颜色
  switch (currentState) {
    case STATE.IDLE:
      stateText.setColor('#4a90e2');
      break;
    case STATE.WALK:
      stateText.setColor('#50c878');
      break;
    case STATE.RUN:
      stateText.setColor('#e74c3c');
      break;
  }
}

// 启动游戏
new Phaser.Game(config);