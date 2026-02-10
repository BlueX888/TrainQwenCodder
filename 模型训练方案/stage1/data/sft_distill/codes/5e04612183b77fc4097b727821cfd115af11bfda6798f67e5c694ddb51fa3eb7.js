const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态枚举
const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
};

// 状态配置
const STATE_CONFIG = {
  [STATE.IDLE]: { speed: 0, name: '静止', color: 0x888888 },
  [STATE.WALK]: { speed: 300, name: '行走', color: 0x00ff00 },
  [STATE.RUN]: { speed: 600, name: '跑步', color: 0xff0000 }
};

// 游戏状态
let gameState = {
  currentState: STATE.IDLE,
  player: null,
  stateText: null,
  speedText: null,
  positionText: null,
  cursors: null,
  keys: null
};

// 导出signals用于验证
window.__signals__ = {
  state: STATE.IDLE,
  speed: 0,
  position: { x: 400, y: 300 },
  stateChanges: 0
};

function preload() {
  // 使用Graphics创建角色纹理
  const graphics = this.add.graphics();
  
  // 创建三种状态的纹理
  Object.keys(STATE_CONFIG).forEach(state => {
    graphics.clear();
    graphics.fillStyle(STATE_CONFIG[state].color, 1);
    graphics.fillRect(0, 0, 40, 60);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(20, 15, 8); // 头部
    graphics.generateTexture(`player_${state}`, 40, 60);
  });
  
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  gameState.player = this.add.sprite(400, 300, 'player_idle');
  gameState.player.setOrigin(0.5);
  
  // 创建UI文本
  const textStyle = {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  };
  
  gameState.stateText = this.add.text(10, 10, '', textStyle);
  gameState.speedText = this.add.text(10, 50, '', textStyle);
  gameState.positionText = this.add.text(10, 90, '', textStyle);
  
  // 添加操作说明
  this.add.text(10, 550, '按键: 1-静止 | 2-行走 | 3-跑步 | 方向键-移动', {
    fontSize: '18px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 设置键盘输入
  gameState.cursors = this.input.keyboard.createCursorKeys();
  gameState.keys = this.input.keyboard.addKeys({
    one: Phaser.Input.Keyboard.KeyCodes.ONE,
    two: Phaser.Input.Keyboard.KeyCodes.TWO,
    three: Phaser.Input.Keyboard.KeyCodes.THREE
  });
  
  // 监听状态切换键
  gameState.keys.one.on('down', () => changeState(STATE.IDLE));
  gameState.keys.two.on('down', () => changeState(STATE.WALK));
  gameState.keys.three.on('down', () => changeState(STATE.RUN));
  
  // 初始化显示
  updateUI();
  
  console.log('Game initialized:', JSON.stringify(window.__signals__));
}

function update(time, delta) {
  const config = STATE_CONFIG[gameState.currentState];
  const speed = config.speed * (delta / 1000); // 转换为像素/帧
  
  let velocityX = 0;
  let velocityY = 0;
  
  // 处理方向键输入
  if (gameState.cursors.left.isDown) {
    velocityX = -1;
  } else if (gameState.cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (gameState.cursors.up.isDown) {
    velocityY = -1;
  } else if (gameState.cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 归一化对角线移动速度
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX *= 0.707;
    velocityY *= 0.707;
  }
  
  // 更新玩家位置
  gameState.player.x += velocityX * speed;
  gameState.player.y += velocityY * speed;
  
  // 边界限制
  gameState.player.x = Phaser.Math.Clamp(gameState.player.x, 20, 780);
  gameState.player.y = Phaser.Math.Clamp(gameState.player.y, 30, 570);
  
  // 根据移动方向翻转精灵
  if (velocityX < 0) {
    gameState.player.setFlipX(true);
  } else if (velocityX > 0) {
    gameState.player.setFlipX(false);
  }
  
  // 更新UI和signals
  updateUI();
  updateSignals();
}

function changeState(newState) {
  if (gameState.currentState !== newState) {
    gameState.currentState = newState;
    
    // 更新精灵纹理
    gameState.player.setTexture(`player_${newState}`);
    
    // 更新signals
    window.__signals__.stateChanges++;
    
    console.log('State changed:', JSON.stringify({
      state: newState,
      speed: STATE_CONFIG[newState].speed,
      changes: window.__signals__.stateChanges
    }));
    
    updateUI();
  }
}

function updateUI() {
  const config = STATE_CONFIG[gameState.currentState];
  
  gameState.stateText.setText(`当前状态: ${config.name}`);
  gameState.speedText.setText(`速度: ${config.speed} 像素/秒`);
  gameState.positionText.setText(
    `位置: (${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})`
  );
}

function updateSignals() {
  window.__signals__.state = gameState.currentState;
  window.__signals__.speed = STATE_CONFIG[gameState.currentState].speed;
  window.__signals__.position = {
    x: Math.round(gameState.player.x),
    y: Math.round(gameState.player.y)
  };
}

new Phaser.Game(config);