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

// 角色状态枚举
const PlayerState = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
};

// 状态配置
const STATE_CONFIG = {
  [PlayerState.IDLE]: { speed: 0, color: 0x4a90e2, name: '静止' },
  [PlayerState.WALK]: { speed: 240, color: 0x50c878, name: '行走' },
  [PlayerState.RUN]: { speed: 480, color: 0xff6b6b, name: '跑步' }
};

let player;
let currentState = PlayerState.IDLE;
let stateText;
let speedText;
let instructionText;
let velocity = { x: 0, y: 0 };
let cursors;

function preload() {
  // 程序化生成不同状态的纹理
  generatePlayerTextures(this);
}

function create() {
  // 创建角色精灵（初始为静止状态）
  player = this.add.sprite(400, 300, 'player_idle');
  player.setScale(2);

  // 创建状态显示文本
  stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  speedText = this.add.text(20, 60, '', {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  instructionText = this.add.text(20, 100, '按键说明：\n1 - 静止 (0 速度)\n2 - 行走 (240 速度)\n3 - 跑步 (480 速度)\n方向键 - 移动', {
    fontSize: '16px',
    fill: '#cccccc',
    fontFamily: 'Arial',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 键盘输入设置
  cursors = this.input.keyboard.createCursorKeys();
  
  // 数字键切换状态
  this.input.keyboard.on('keydown-ONE', () => changeState(PlayerState.IDLE));
  this.input.keyboard.on('keydown-TWO', () => changeState(PlayerState.WALK));
  this.input.keyboard.on('keydown-THREE', () => changeState(PlayerState.RUN));

  // 初始化状态显示
  updateStateDisplay();
}

function update(time, delta) {
  // 重置速度
  velocity.x = 0;
  velocity.y = 0;

  // 获取当前状态的速度
  const currentSpeed = STATE_CONFIG[currentState].speed;

  // 根据方向键和当前状态计算移动
  if (currentSpeed > 0) {
    if (cursors.left.isDown) {
      velocity.x = -currentSpeed;
    } else if (cursors.right.isDown) {
      velocity.x = currentSpeed;
    }

    if (cursors.up.isDown) {
      velocity.y = -currentSpeed;
    } else if (cursors.down.isDown) {
      velocity.y = currentSpeed;
    }

    // 对角线移动时归一化速度
    if (velocity.x !== 0 && velocity.y !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocity.x *= factor;
      velocity.y *= factor;
    }
  }

  // 更新角色位置（根据帧时间）
  player.x += velocity.x * (delta / 1000);
  player.y += velocity.y * (delta / 1000);

  // 边界限制
  player.x = Phaser.Math.Clamp(player.x, 32, 768);
  player.y = Phaser.Math.Clamp(player.y, 32, 568);

  // 更新速度显示（实际移动速度）
  const actualSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  speedText.setText(`实际速度: ${Math.round(actualSpeed)} px/s`);
}

function changeState(newState) {
  if (currentState === newState) return;

  currentState = newState;
  
  // 更新角色纹理
  player.setTexture(`player_${newState}`);
  
  // 更新状态显示
  updateStateDisplay();
}

function updateStateDisplay() {
  const config = STATE_CONFIG[currentState];
  stateText.setText(`当前状态: ${config.name}`);
  stateText.setColor(rgbToHex(config.color));
  speedText.setText(`配置速度: ${config.speed} px/s`);
}

function generatePlayerTextures(scene) {
  // 为每种状态生成纹理
  Object.keys(PlayerState).forEach(key => {
    const state = PlayerState[key];
    const config = STATE_CONFIG[state];
    
    const graphics = scene.add.graphics();
    
    // 绘制角色主体（圆形）
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(32, 32, 28);
    
    // 绘制眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(22, 26, 6);
    graphics.fillCircle(42, 26, 6);
    
    // 绘制瞳孔
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(24, 26, 3);
    graphics.fillCircle(44, 26, 3);
    
    // 根据状态绘制不同的嘴巴
    graphics.lineStyle(3, 0x000000, 1);
    if (state === PlayerState.IDLE) {
      // 静止 - 平嘴
      graphics.beginPath();
      graphics.moveTo(22, 42);
      graphics.lineTo(42, 42);
      graphics.strokePath();
    } else if (state === PlayerState.WALK) {
      // 行走 - 微笑
      graphics.beginPath();
      graphics.arc(32, 38, 10, 0.2, Math.PI - 0.2);
      graphics.strokePath();
    } else if (state === PlayerState.RUN) {
      // 跑步 - 大笑
      graphics.beginPath();
      graphics.arc(32, 35, 12, 0.3, Math.PI - 0.3);
      graphics.strokePath();
    }
    
    // 生成纹理
    graphics.generateTexture(`player_${state}`, 64, 64);
    graphics.destroy();
  });
}

function rgbToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

new Phaser.Game(config);