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
  IDLE: 0,
  WALK: 1,
  RUN: 2
};

// 状态配置
const STATE_CONFIG = {
  [STATE.IDLE]: { name: '静止', speed: 0, color: 0x00ff00 },
  [STATE.WALK]: { name: '行走', speed: 360, color: 0xffff00 },
  [STATE.RUN]: { name: '跑步', speed: 720, color: 0xff0000 }
};

let player;
let stateText;
let speedText;
let instructionText;
let currentState = STATE.IDLE;
let currentSpeed = 0;
let cursors;
let spaceKey;

function preload() {
  // 使用 Graphics 生成角色纹理
  createPlayerTextures.call(this);
}

function createPlayerTextures() {
  const graphics = this.add.graphics();
  
  // 为每种状态创建不同颜色的纹理
  Object.keys(STATE_CONFIG).forEach(stateKey => {
    const state = parseInt(stateKey);
    const config = STATE_CONFIG[state];
    
    graphics.clear();
    graphics.fillStyle(config.color, 1);
    graphics.fillRect(0, 0, 40, 60);
    
    // 添加一个小细节（眼睛）
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 15, 4);
    graphics.fillCircle(28, 15, 4);
    
    // 添加方向指示（三角形）
    graphics.fillStyle(0x000000, 1);
    graphics.fillTriangle(20, 45, 15, 35, 25, 35);
    
    graphics.generateTexture(`player_${state}`, 40, 60);
  });
  
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.add.sprite(100, 300, 'player_0');
  player.setOrigin(0.5, 0.5);
  
  // 创建状态显示文本
  stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 创建速度显示文本
  speedText = this.add.text(20, 60, '', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 创建操作说明文本
  instructionText = this.add.text(20, 100, '按空格键切换状态\n方向键控制移动', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#aaaaaa',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 创建边界提示
  const boundary = this.add.graphics();
  boundary.lineStyle(2, 0x666666, 1);
  boundary.strokeRect(10, 10, 780, 580);
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 监听空格键切换状态
  spaceKey.on('down', () => {
    currentState = (currentState + 1) % 3;
    updatePlayerState();
  });
  
  // 初始化状态显示
  updatePlayerState();
}

function updatePlayerState() {
  const config = STATE_CONFIG[currentState];
  currentSpeed = config.speed;
  
  // 更新角色纹理
  player.setTexture(`player_${currentState}`);
  
  // 更新状态文本
  stateText.setText(`当前状态: ${config.name}`);
  stateText.setBackgroundColor(rgbToHex(config.color));
  
  // 更新速度文本
  speedText.setText(`速度: ${currentSpeed} px/s`);
}

function update(time, delta) {
  // 计算实际移动距离（速度 * 时间）
  const moveDistance = (currentSpeed * delta) / 1000;
  
  let velocityX = 0;
  let velocityY = 0;
  
  // 处理方向键输入
  if (cursors.left.isDown) {
    velocityX = -1;
    player.setFlipX(true);
  } else if (cursors.right.isDown) {
    velocityX = 1;
    player.setFlipX(false);
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 归一化对角线移动速度
  if (velocityX !== 0 && velocityY !== 0) {
    const normalizer = Math.sqrt(2) / 2;
    velocityX *= normalizer;
    velocityY *= normalizer;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 限制玩家在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 30, 770);
  player.y = Phaser.Math.Clamp(player.y, 40, 560);
}

// 辅助函数：将颜色值转换为 CSS 十六进制字符串
function rgbToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

// 启动游戏
new Phaser.Game(config);