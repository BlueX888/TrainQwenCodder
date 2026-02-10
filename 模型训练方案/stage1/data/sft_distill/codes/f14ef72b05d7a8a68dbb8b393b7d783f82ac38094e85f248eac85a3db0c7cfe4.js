// 双跳功能实现
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已跳跃次数
const MAX_JUMPS = 2; // 最大跳跃次数
let jumpText; // 显示跳跃状态的文本
let isGrounded = false; // 是否在地面上

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建地面
  const graphics = this.add.graphics();
  graphics.fillStyle(0x228B22, 1);
  graphics.fillRect(0, 550, 800, 50);
  graphics.generateTexture('groundTex', 800, 50);
  graphics.destroy();
  
  ground = this.physics.add.staticSprite(400, 575, 'groundTex');
  
  // 创建玩家角色
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6347, 1);
  playerGraphics.fillRect(-20, -30, 40, 60);
  playerGraphics.generateTexture('playerTex', 40, 60);
  playerGraphics.destroy();
  
  player = this.physics.add.sprite(400, 400, 'playerTex');
  player.setCollideWorldBounds(true);
  player.setBounce(0);
  
  // 设置碰撞检测
  this.physics.add.collider(player, ground, onGroundCollision, null, this);
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 监听空格键按下事件
  spaceKey.on('down', handleJump, this);
  
  // 创建状态显示文本
  jumpText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  
  updateJumpText();
  
  // 添加说明文本
  this.add.text(16, 60, 'Press SPACE to jump (max 2 jumps)', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  
  this.add.text(16, 100, 'Arrow keys to move left/right', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
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
  
  // 检测是否在地面上（通过速度判断）
  const wasGrounded = isGrounded;
  isGrounded = player.body.touching.down || player.body.blocked.down;
  
  // 如果刚着地，重置跳跃计数
  if (isGrounded && !wasGrounded) {
    jumpCount = 0;
    updateJumpText();
  }
}

function handleJump() {
  // 检查是否还能跳跃
  if (jumpCount < MAX_JUMPS) {
    player.setVelocityY(-380); // 跳跃力度（负值向上）
    jumpCount++;
    updateJumpText();
  }
}

function onGroundCollision() {
  // 碰撞回调（可用于更精确的着地检测）
}

function updateJumpText() {
  const remainingJumps = MAX_JUMPS - jumpCount;
  jumpText.setText(`Jumps remaining: ${remainingJumps}/${MAX_JUMPS}`);
  
  // 根据剩余跳跃次数改变颜色
  if (remainingJumps === 0) {
    jumpText.setStyle({ fill: '#ff0000' });
  } else if (remainingJumps === 1) {
    jumpText.setStyle({ fill: '#ff8800' });
  } else {
    jumpText.setStyle({ fill: '#00aa00' });
  }
}

// 启动游戏
new Phaser.Game(config);