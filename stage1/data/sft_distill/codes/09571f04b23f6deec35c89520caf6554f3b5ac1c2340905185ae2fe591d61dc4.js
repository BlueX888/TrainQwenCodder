const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
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
let platforms;
let cursors;
let spaceKey;
let jumpCount = 0; // 状态信号：当前已跳跃次数
const MAX_JUMPS = 2; // 最大跳跃次数
let statusText;
let groundContactCount = 0; // 用于检测是否着地

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建地面平台纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x228B22, 1);
  groundGraphics.fillRect(0, 0, 800, 100);
  groundGraphics.generateTexture('ground', 800, 100);
  groundGraphics.destroy();

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6347, 1);
  playerGraphics.fillRect(0, 0, 40, 50);
  playerGraphics.generateTexture('player', 40, 50);
  playerGraphics.destroy();

  // 创建平台组
  platforms = this.physics.add.staticGroup();
  
  // 添加地面
  const ground = platforms.create(400, 575, 'ground');
  ground.setScale(1).refreshBody();
  
  // 添加几个平台
  platforms.create(200, 450, 'ground').setScale(0.3, 0.3).refreshBody();
  platforms.create(600, 350, 'ground').setScale(0.3, 0.3).refreshBody();
  platforms.create(400, 250, 'ground').setScale(0.25, 0.25).refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, platforms, onPlayerLand, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 60, '使用 ← → 移动，空格键跳跃\n可以在空中跳跃一次（双跳）', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃逻辑
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    if (jumpCount < MAX_JUMPS) {
      player.setVelocityY(-360);
      jumpCount++;
      updateStatusText();
      console.log(`跳跃！当前跳跃次数: ${jumpCount}/${MAX_JUMPS}`);
    }
  }

  // 检测是否在下落且未着地（用于更新状态显示）
  if (player.body.velocity.y > 0 && jumpCount > 0) {
    updateStatusText();
  }
}

function onPlayerLand(player, platform) {
  // 只有当玩家从上方落到平台上时才重置跳跃次数
  // 检查玩家是否真的在平台上方（而不是侧面碰撞）
  if (player.body.touching.down && platform.body.touching.up) {
    if (jumpCount > 0) {
      console.log('着地！重置跳跃次数');
      jumpCount = 0;
      updateStatusText();
    }
  }
}

function updateStatusText() {
  const remainingJumps = MAX_JUMPS - jumpCount;
  const isOnGround = player.body.touching.down;
  
  statusText.setText(
    `跳跃次数: ${jumpCount}/${MAX_JUMPS}\n` +
    `剩余跳跃: ${remainingJumps}\n` +
    `状态: ${isOnGround ? '着地' : '空中'}`
  );
}

const game = new Phaser.Game(config);