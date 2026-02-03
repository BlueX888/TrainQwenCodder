class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 生成平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 生成金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 250, 'platform');
    this.platforms.create(500, 150, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 9,
      setXY: { x: 100, y: 0, stepX: 70 }
    });

    // 设置金币位置和物理属性
    const coinPositions = [
      { x: 100, y: 300 },
      { x: 200, y: 200 },
      { x: 350, y: 200 },
      { x: 500, y: 100 },
      { x: 650, y: 250 },
      { x: 750, y: 250 },
      { x: 400, y: 350 },
      { x: 150, y: 150 },
      { x: 600, y: 150 },
      { x: 450, y: 400 }
    ];

    this.coins.children.entries.forEach((coin, index) => {
      coin.setPosition(coinPositions[index].x, coinPositions[index].y);
      coin.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 添加玩家与金币的重叠检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 游戏完成文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'You Win!', {
      fontSize: '64px',
      fill: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
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

    // 跳跃控制（只有在地面或平台上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score === 100) {
      this.winText.setVisible(true);
      // 可以添加游戏结束逻辑
      this.physics.pause();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene,
  backgroundColor: '#87ceeb'
};

const game = new Phaser.Game(config);