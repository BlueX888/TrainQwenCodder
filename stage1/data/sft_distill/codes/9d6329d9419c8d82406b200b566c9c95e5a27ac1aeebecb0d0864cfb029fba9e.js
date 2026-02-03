class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.scoreText = null;
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.cursors = null;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(150, 450, 'platform').refreshBody();
    this.platforms.create(400, 380, 'platform').refreshBody();
    this.platforms.create(650, 450, 'platform').refreshBody();
    
    // 高层平台
    this.platforms.create(250, 280, 'platform').refreshBody();
    this.platforms.create(550, 280, 'platform').refreshBody();
    
    // 顶层平台
    this.platforms.create(400, 180, 'platform').refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在不同位置创建15个金币
    const coinPositions = [
      { x: 150, y: 400 },
      { x: 200, y: 350 },
      { x: 400, y: 330 },
      { x: 450, y: 280 },
      { x: 650, y: 400 },
      { x: 700, y: 350 },
      { x: 250, y: 230 },
      { x: 300, y: 200 },
      { x: 400, y: 130 },
      { x: 500, y: 200 },
      { x: 550, y: 230 },
      { x: 100, y: 380 },
      { x: 600, y: 300 },
      { x: 350, y: 250 },
      { x: 450, y: 150 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 添加金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加说明文本
    this.add.text(16, 56, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面上才能跳）
    if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      // 显示胜利信息
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#ffdd00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.physics.pause();
    }
  }
}

// 游戏配置
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
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);