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

// 可验证的状态变量
let currentState = 'idle'; // idle, walk, run
let currentSpeed = 0;
let playerX = 400;

function preload() {
  // 程序化生成角色纹理 - 静止状态（蓝色）
  const idleGraphics = this.add.graphics();
  idleGraphics.fillStyle(0x3498db, 1);
  idleGraphics.fillRect(0, 0, 50, 60);
  idleGraphics.fillStyle(0xffffff, 1);
  idleGraphics.fillCircle(25, 20, 8); // 头部
  idleGraphics.generateTexture('player_idle', 50, 60);
  idleGraphics.destroy();

  // 行走状态（绿色）
  const walkGraphics = this.add.graphics();
  walkGraphics.fillStyle(0x2ecc71, 1);
  walkGraphics.fillRect(0, 0, 50, 60);
  walkGraphics.fillStyle(0xffffff, 1);
  walkGraphics.fillCircle(25, 20, 8);
  walkGraphics.fillStyle(0x27ae60, 1);
  walkGraphics.fillRect(10, 45, 15, 15); // 左腿
  walkGraphics.fillRect(25, 45, 15, 15); // 右腿
  walkGraphics.generateTexture('player_walk', 50, 60);
  walkGraphics.destroy();

  // 跑步状态（红色）
  const runGraphics = this.add.graphics();
  runGraphics.fillStyle(0xe74c3c, 1);
  runGraphics.fillRect(0, 0, 50, 60);
  runGraphics.fillStyle(0xffffff, 1);
  runGraphics.fillCircle(25, 20, 8);
  runGraphics.fillStyle(0xc0392b, 1);
  runGraphics.fillRect(5, 45, 15, 15); // 左腿（更宽步伐）
  runGraphics.fillRect(30, 45, 15, 15); // 右腿
  runGraphics.generateTexture('player_run', 50, 60);
  runGraphics.destroy();
}

function create() {
  // 创建角色精灵
  this.player = this.add.sprite(playerX, 300, 'player_idle');
  this.player.setOrigin(0.5);

  // 状态文本显示
  this.stateText = this.add.text(20, 20, '', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 速度文本显示
  this.speedText = this.add.text(20, 60, '', {
    fontSize: '20px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 位置文本显示
  this.posText = this.add.text(20, 100, '', {
    fontSize: '20px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 说明文本
  this.add.text(20, 550, '按键: [1]静止  [2]行走  [3]跑步  [方向键]移动', {
    fontSize: '18px',
    fill: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 键盘输入设置
  this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
  this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
  this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
  this.cursors = this.input.keyboard.createCursorKeys();

  // 初始化状态
  updateState.call(this, 'idle');
}

function update(time, delta) {
  // 状态切换
  if (Phaser.Input.Keyboard.JustDown(this.key1)) {
    updateState.call(this, 'idle');
  } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
    updateState.call(this, 'walk');
  } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
    updateState.call(this, 'run');
  }

  // 根据当前状态和方向键移动角色
  const deltaSeconds = delta / 1000;
  let moved = false;

  if (this.cursors.left.isDown && currentSpeed > 0) {
    playerX -= currentSpeed * deltaSeconds;
    this.player.setFlipX(true);
    moved = true;
  } else if (this.cursors.right.isDown && currentSpeed > 0) {
    playerX += currentSpeed * deltaSeconds;
    this.player.setFlipX(false);
    moved = true;
  }

  // 限制角色在屏幕内
  playerX = Phaser.Math.Clamp(playerX, 25, 775);
  this.player.x = playerX;

  // 更新显示文本
  this.stateText.setText(`状态: ${getStateText(currentState)}`);
  this.speedText.setText(`速度: ${currentSpeed} px/s`);
  this.posText.setText(`位置: X=${Math.round(playerX)} Y=${this.player.y}`);

  // 如果在移动且不是静止状态，添加轻微的上下浮动效果
  if (moved && currentState !== 'idle') {
    const bounce = Math.sin(time / 100) * 2;
    this.player.y = 300 + bounce;
  } else {
    this.player.y = 300;
  }
}

// 更新状态的辅助函数
function updateState(newState) {
  currentState = newState;
  
  switch (newState) {
    case 'idle':
      currentSpeed = 0;
      this.player.setTexture('player_idle');
      break;
    case 'walk':
      currentSpeed = 360;
      this.player.setTexture('player_walk');
      break;
    case 'run':
      currentSpeed = 360 * 2;
      this.player.setTexture('player_run');
      break;
  }
}

// 获取状态文本的辅助函数
function getStateText(state) {
  switch (state) {
    case 'idle': return '静止 🧍';
    case 'walk': return '行走 🚶';
    case 'run': return '跑步 🏃';
    default: return '未知';
  }
}

// 启动游戏
new Phaser.Game(config);