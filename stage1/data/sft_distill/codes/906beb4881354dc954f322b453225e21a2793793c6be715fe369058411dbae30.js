const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态变量
let player;
let platforms;
let cursors;
let spaceKey;
let jumpCount = 0;
let platformsCrossed = 0;
let gameStatus = 'playing'; // playing, success, failed
let statusText;
let platformsData = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF0000, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00AA00, 1);
  platformGraphics.fillRect(0, 0, 120, 20);
  platformGraphics.generateTexture('platform', 120, 20);
  platformGraphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 40);
  groundGraphics.generateTexture('ground', 800, 40);
  groundGraphics.destroy();

  // 创建地面（起点）
  const ground = this.physics.add.staticSprite(400, 580, 'ground');

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 创建移动平台组
  platforms = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  // 创建3个移动平台，形成路径
  platformsData = [
    {
      x: 250,
      y: 450,
      minX: 200,
      maxX: 350,
      direction: 1,
      crossed: false
    },
    {
      x: 450,
      y: 350,
      minX: 400,
      maxX: 550,
      direction: -1,
      crossed: false
    },
    {
      x: 650,
      y: 250,
      minX: 600,
      maxX: 700,
      direction: 1,
      crossed: false
    }
  ];

  platformsData.forEach((data, index) => {
    const platform = platforms.create(data.x, data.y, 'platform');
    platform.body.setVelocityX(160 * data.direction);
    platform.setData('index', index);
    platform.setData('minX', data.minX);
    platform.setData('maxX', data.maxX);
    platform.setData('direction', data.direction);
  });

  // 创建终点平台（静态）
  const endPlatform = this.physics.add.staticSprite(700, 150, 'platform');
  endPlatform.setTint(0xFFD700); // 金色表示终点

  // 添加碰撞检测
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, endPlatform, reachEnd, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();

  // 添加说明文本
  this.add.text(400, 30, '使用方向键移动，空格/上箭头跳跃', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);
}

function update() {
  if (gameStatus !== 'playing') {
    return;
  }

  // 玩家左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃
  if ((Phaser.Input.Keyboard.JustDown(spaceKey) || Phaser.Input.Keyboard.JustDown(cursors.up)) && player.body.touching.down) {
    player.setVelocityY(-400);
    jumpCount++;
    updateStatusText();
  }

  // 更新平台移动
  platforms.children.entries.forEach((platform) => {
    const minX = platform.getData('minX');
    const maxX = platform.getData('maxX');
    let direction = platform.getData('direction');

    // 边界反转
    if (platform.x <= minX && direction === -1) {
      direction = 1;
      platform.body.setVelocityX(160);
      platform.setData('direction', direction);
    } else if (platform.x >= maxX && direction === 1) {
      direction = -1;
      platform.body.setVelocityX(-160);
      platform.setData('direction', direction);
    }

    // 检测玩家是否站在平台上（通过平台）
    const index = platform.getData('index');
    if (!platformsData[index].crossed && player.body.touching.down && this.physics.overlap(player, platform)) {
      platformsData[index].crossed = true;
      platformsCrossed++;
      platform.setTint(0xAAAAFF); // 标记已通过
      updateStatusText();
    }
  });

  // 检测玩家掉落
  if (player.y > 600) {
    gameStatus = 'failed';
    updateStatusText();
    this.physics.pause();
  }
}

function reachEnd() {
  if (gameStatus === 'playing') {
    gameStatus = 'success';
    updateStatusText();
    this.physics.pause();
  }
}

function updateStatusText() {
  let status = `跳跃次数: ${jumpCount} | 通过平台: ${platformsCrossed}/3`;
  
  if (gameStatus === 'success') {
    status += ' | 🎉 成功通关！';
  } else if (gameStatus === 'failed') {
    status += ' | ❌ 掉落失败';
  }
  
  statusText.setText(status);
}

new Phaser.Game(config);