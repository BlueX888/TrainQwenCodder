const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#87CEEB'
};

let player;
let ground;
let cursors;
let jumpKey;
let jumpCount = 0; // 当前跳跃次数
const MAX_JUMPS = 2; // 最大跳跃次数
const JUMP_VELOCITY = -160; // 跳跃速度（负值向上）
let statusText;

function preload() {
  // 创建角色纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0066FF, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建地面纹理（绿色长方形）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x228B22, 1);
  groundGraphics.fillRect(0, 0, 800, 100);
  groundGraphics.generateTexture('ground', 800, 100);
  groundGraphics.destroy();

  // 创建平台纹理（棕色）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x8B4513, 1);
  platformGraphics.fillRect(0, 0, 200, 20);
  platformGraphics.generateTexture('platform', 200, 20);
  platformGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.staticSprite(400, 575, 'ground');
  ground.setOrigin(0.5, 0.5);
  ground.refreshBody();

  // 创建几个平台用于测试双跳
  const platform1 = this.physics.add.staticSprite(200, 400, 'platform');
  const platform2 = this.physics.add.staticSprite(600, 300, 'platform');
  
  // 创建平台组
  const platforms = this.physics.add.staticGroup();
  platforms.add(ground);
  platforms.add(platform1);
  platforms.add(platform2);

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加玩家与平台的碰撞
  this.physics.add.collider(player, platforms, () => {
    // 当玩家接触地面时，重置跳跃次数
    if (player.body.touching.down) {
      jumpCount = 0;
    }
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 50, '控制说明:\n← → 移动\n↑ 或 空格 跳跃\n可以在空中跳第二次', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 初始化跳跃次数
  jumpCount = 0;
}

function update() {
  // 左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 双跳逻辑
  if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(jumpKey)) {
    // 检查是否可以跳跃（跳跃次数未达上限）
    if (jumpCount < MAX_JUMPS) {
      player.setVelocityY(JUMP_VELOCITY);
      jumpCount++;
    }
  }

  // 检测玩家是否在地面上，如果在地面且之前跳过，重置跳跃次数
  if (player.body.touching.down && player.body.velocity.y === 0) {
    if (jumpCount > 0) {
      jumpCount = 0;
    }
  }

  // 更新状态显示
  const onGround = player.body.touching.down ? '是' : '否';
  const canJump = jumpCount < MAX_JUMPS ? '是' : '否';
  statusText.setText(
    `跳跃次数: ${jumpCount}/${MAX_JUMPS}\n` +
    `在地面: ${onGround}\n` +
    `可跳跃: ${canJump}\n` +
    `Y速度: ${Math.round(player.body.velocity.y)}`
  );
}

new Phaser.Game(config);