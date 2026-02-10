class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
    platformGraphics.destroy();

    // 创建地面平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'platform').setScale(2, 1).refreshBody();
    this.platforms.create(200, 450, 'platform').setScale(0.8, 1).refreshBody();
    this.platforms.create(600, 350, 'platform').setScale(0.8, 1).refreshBody();
    this.platforms.create(400, 250, 'platform').setScale(0.6, 1).refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 4, // 总共 5 个金币
      setXY: { x: 200, y: 0, stepX: 120 }
    });

    // 设置金币属性
    this.coins.children.iterate((coin, index) => {
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
      // 金币在不同高度
      const heights = [150, 200, 100, 180, 120];
      coin.setY(heights[index]);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
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

    // 显示操作提示
    this.add.text(16, 56, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
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

    // 跳跃（只有在地面或平台上才能跳）
    if (this.spaceKey.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否收集完所有金币
    if (this.score >= 5 && this.coins.countActive(true) === 0) {
      this.scoreText.setText('Score: ' + this.score + ' - YOU WIN!');
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);

    // 播放收集音效（使用简单的视觉反馈代替）
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.5);
    flash.fillCircle(coin.x, coin.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);