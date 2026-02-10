const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#87CEEB'
};

// 游戏状态变量
let player;
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已跳跃次数
const MAX_JUMPS = 2; // 最大跳跃次数
const JUMP_VELOCITY = -200; // 跳跃力度
let statusText;
let jumpCountText;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建地面纹理（棕色矩形）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();

  // 创建地面
  ground = this.physics.add.staticSprite(400, 575, 'ground');
  ground.setOrigin(0.5, 0.5);
  ground.refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加玩家与地面的碰撞
  this.physics.add.collider(player, ground, onLanding, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 监听空格键按下事件（避免长按连续触发）
  spaceKey.on('down', handleJump, this);

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  jumpCountText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 90, 'Press SPACE to jump (max 2 jumps)', {
    fontSize: '14px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加左右移动说明
  this.add.text(16, 120, 'Use Arrow Keys to move', {
    fontSize: '14px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusDisplay();
}

function update() {
  // 左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  // 检测玩家是否在空中（用于更新状态显示）
  updateStatusDisplay();
}

// 处理跳跃逻辑
function handleJump() {
  // 如果还有剩余跳跃次数，执行跳跃
  if (jumpCount < MAX_JUMPS) {
    player.setVelocityY(JUMP_VELOCITY);
    jumpCount++;
    updateStatusDisplay();
    
    console.log(`Jump ${jumpCount}/${MAX_JUMPS}`);
  }
}

// 着陆回调函数
function onLanding() {
  // 只有当玩家真正着陆时才重置跳跃次数
  if (player.body.touching.down && player.body.velocity.y >= 0) {
    if (jumpCount > 0) {
      jumpCount = 0;
      updateStatusDisplay();
      console.log('Landed - Jump count reset');
    }
  }
}

// 更新状态显示
function updateStatusDisplay() {
  const isGrounded = player.body.touching.down;
  const status = isGrounded ? 'GROUNDED' : 'AIRBORNE';
  const remainingJumps = MAX_JUMPS - jumpCount;
  
  statusText.setText(`Status: ${status} | Velocity Y: ${Math.round(player.body.velocity.y)}`);
  jumpCountText.setText(`Jumps Used: ${jumpCount}/${MAX_JUMPS} | Remaining: ${remainingJumps}`);
}

// 启动游戏
const game = new Phaser.Game(config);