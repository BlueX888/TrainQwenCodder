class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.score = 0;
  }

  preload() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x7f8c8d, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面纹理（深灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x34495e, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    const ground = this.physics.add.staticGroup();
    ground.create(400, 580, 'ground');

    // 创建平台
    const platforms = this.physics.add.staticGroup();
    platforms.create(150, 450, 'platform');
    platforms.create(400, 350, 'platform');
    platforms.create(650, 450, 'platform');
    platforms.create(250, 250, 'platform');
    platforms.create(550, 250, 'platform');
    platforms.create(400, 150, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在平台上方生成10个金币
    const coinPositions = [
      { x: 150, y: 400 },
      { x: 400, y: 300 },
      { x: 650, y: 400 },
      { x: 250, y: 200 },
      { x: 550, y: 200 },
      { x: 400, y: 100 },
      { x: 200, y: 500 },
      { x: 500, y: 350 },
      { x: 300, y: 250 },
      { x: 600, y: 150 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.5);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.coins, ground);
    this.physics.add.collider(this.coins, platforms);

    // 金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建提示文本
    this.add.text(400, 30, 'Arrow Keys: Move | Up: Jump | Collect all 10 coins!', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score === 100) {
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      // 暂停游戏
      this.physics.pause();
    }
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面或平台上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: PlatformerScene
};

// 创建游戏实例
new Phaser.Game(config);