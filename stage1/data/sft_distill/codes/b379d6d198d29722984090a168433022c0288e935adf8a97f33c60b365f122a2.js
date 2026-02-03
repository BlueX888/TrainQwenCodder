class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面平台
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    platforms.create(200, 450, 'platform');
    platforms.create(600, 450, 'platform');
    platforms.create(100, 320, 'platform');
    platforms.create(500, 320, 'platform');
    platforms.create(300, 200, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在空中随机位置生成 12 个金币
    const coinPositions = [
      { x: 150, y: 380 },
      { x: 250, y: 380 },
      { x: 550, y: 380 },
      { x: 650, y: 380 },
      { x: 80, y: 250 },
      { x: 150, y: 250 },
      { x: 480, y: 250 },
      { x: 550, y: 250 },
      { x: 250, y: 130 },
      { x: 350, y: 130 },
      { x: 400, y: 80 },
      { x: 300, y: 50 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.coins, platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 游戏完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, 'All Coins Collected!\nScore: 12', {
      fontSize: '48px',
      fill: '#ffdd00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
  }

  update() {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面或平台上才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score === 12) {
      this.completeText.setVisible(true);
      // 可选：暂停游戏或添加其他效果
      this.physics.pause();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: PlatformGame
};

const game = new Phaser.Game(config);

// 导出可验证的状态变量
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore: () => game.scene.scenes[0].score };
}